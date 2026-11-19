import { useCallback, useEffect, useMemo, useState } from "react";
import { vocabById, vocabulary } from "../../data/vocabulary";
import {
  answerLearn,
  blankExample,
  gradeFromMistakes,
  initLearn,
  learnProgress,
  makeChoices,
  matchTyped,
} from "../../domain/learn";
import { gradeVocab, localDateKey, markMissionDone } from "../../lib/state";
import { update } from "../../lib/store";
import { CoachReaction, VerdictLine } from "../../components/Voice";
import { useCoach } from "../../voice/useVoice";
import { isTypingTarget, SpeakButton } from "./shared";

type Feedback = { correct: boolean; picked?: number; typed?: string };

const STAGE_PROMPT = ["Chọn nghĩa đúng", "Chọn từ đúng", "Gõ lại từ tiếng Anh"] as const;

/** Quizlet "Learn": multiple choice both ways, then type the word. Each word finishes as an SRS grade. */
export function LearnSession({ ids, onExit }: { ids: string[]; onExit: () => void }) {
  const [ls, setLs] = useState(() => initLearn(ids));
  const [qNo, setQNo] = useState(0);
  const [feedback, setFeedbackState] = useState<Feedback | null>(null);
  const coach = useCoach();
  const [typed, setTyped] = useState("");
  const [closeHint, setCloseHint] = useState(false);

  const head = ls.queue[0];
  const word = head ? vocabById.get(head.id) : undefined;
  const setFeedback = (f: Feedback | null) => {
    setFeedbackState(f);
    if (f && word) coach.react({ correct: f.correct, skillCode: `w:${word.word}` });
  };
  const stage = head?.stage ?? 0;

  const choice = useMemo(
    () => (word && stage < 2 ? makeChoices(word, vocabulary, stage === 0 ? "en2vi" : "vi2en") : null),
    // A new question every time `qNo` changes, even if the same word comes back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qNo],
  );

  const advance = useCallback(
    (correct: boolean) => {
      const next = answerLearn(ls, correct);
      const justDone = next.done.length > ls.done.length ? next.done[next.done.length - 1] : undefined;
      const now = new Date();
      if (justDone || next.queue.length === 0) {
        update((s) => {
          let n = justDone ? gradeVocab(s, justDone.id, gradeFromMistakes(justDone.mistakes), now) : s;
          if (next.queue.length === 0) n = markMissionDone(n, localDateKey(now), "vocab");
          return n;
        });
      }
      setLs(next);
      setFeedback(null);
      setTyped("");
      setCloseHint(false);
      setQNo((n) => n + 1);
    },
    [ls],
  );

  // Correct answers continue by themselves, like Quizlet; wrong ones wait for the learner.
  useEffect(() => {
    if (!feedback?.correct) return;
    const t = setTimeout(() => advance(true), 900);
    return () => clearTimeout(t);
  }, [feedback, advance]);

  const pick = useCallback(
    (i: number) => {
      if (feedback || !choice) return;
      setFeedback({ correct: i === choice.correctIndex, picked: i });
    },
    [feedback, choice],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !word) return;
      if (feedback && !feedback.correct && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        advance(false);
      } else if (!feedback && choice && /^[1-4]$/.test(e.key)) {
        pick(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [word, feedback, choice, pick, advance]);

  const submitTyped = () => {
    if (!word || feedback) return;
    const r = matchTyped(typed, word.word);
    if (r === "exact") setFeedback({ correct: true, typed });
    else if (r === "close" && !closeHint) setCloseHint(true);
    else setFeedback({ correct: false, typed });
  };

  if (!word || !head) {
    const perfect = ls.done.filter((d) => d.mistakes === 0).length;
    return (
      <div className="card p-8">
        <VerdictLine context={perfect === ls.total ? "done_perfect" : "done"} className="mx-auto max-w-md" />
        <h2 className="mt-4 text-center text-xl font-bold">Đã học xong {ls.total} từ mới!</h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          {perfect} từ không sai lần nào. Các từ sẽ quay lại ôn đúng lúc theo lịch lặp lại ngắt quãng.
        </p>
        <ul className="mt-5 divide-y divide-slate-100 text-sm">
          {ls.done.map((d) => {
            const w = vocabById.get(d.id)!;
            return (
              <li key={d.id} className="flex items-center gap-3 py-2">
                <span className="w-32 shrink-0 font-medium">{w.word}</span>
                <span className="min-w-0 flex-1 truncate text-slate-600">{w.meaningVi}</span>
                <span className={d.mistakes === 0 ? "text-emerald-700" : "text-amber-700"}>
                  {d.mistakes === 0 ? "✓ không sai" : `${d.mistakes} lần sai`}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 text-center">
          <button onClick={onExit} className="btn-primary">
            Xong
          </button>
        </div>
      </div>
    );
  }

  const progress = learnProgress(ls);
  const blank = blankExample(word.example, word.word);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        <span>{ls.done.length}/{ls.total} từ đã xong</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="card p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {STAGE_PROMPT[stage]} · bước {stage + 1}/3
        </p>

        {stage === 0 && (
          <div className="mt-3 flex items-center gap-3">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">{word.word}</h2>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{word.pos}</span>
            <SpeakButton text={word.word} label="Nghe phát âm" autoPlay />
          </div>
        )}
        {stage === 1 && <h2 className="mt-3 text-3xl font-bold text-brand-700">{word.meaningVi}</h2>}
        {stage === 2 && (
          <div className="mt-3 space-y-2">
            <h2 className="text-3xl font-bold text-brand-700">{word.meaningVi}</h2>
            <p className="text-slate-600">{word.meaningEn}</p>
            {blank.blanked && <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-700">"{blank.text}"</p>}
          </div>
        )}

        {choice && (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {choice.options.map((opt, i) => {
              const answered = feedback !== null;
              const isCorrect = i === choice.correctIndex;
              const isPicked = feedback?.picked === i;
              const style = !answered
                ? "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm"
                : isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : isPicked
                    ? "border-rose-400 bg-rose-50 text-rose-800"
                    : "border-slate-200 text-slate-400";
              return (
                <li key={opt}>
                  <button
                    disabled={answered}
                    onClick={() => pick(i)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99] ${style}`}
                  >
                    <span className="mr-2 text-xs text-slate-400">{i + 1}</span>
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {stage === 2 && (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              submitTyped();
            }}
          >
            <input
              key={qNo}
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={feedback !== null}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Gõ từ tiếng Anh"
              placeholder="Gõ từ tiếng Anh…"
              className={`field !py-3 !text-lg ${feedback ? (feedback.correct ? "!border-emerald-500 !bg-emerald-50" : "!border-rose-400 !bg-rose-50") : ""}`}
            />
            {closeHint && !feedback && (
              <p role="status" className="mt-2 text-sm text-amber-700">Gần đúng rồi, kiểm tra lại chính tả và thử một lần nữa.</p>
            )}
            {!feedback && (
              <div className="mt-3 flex gap-2">
                <button className="btn-primary">Kiểm tra</button>
                <button
                  type="button"
                  onClick={() => setFeedback({ correct: false })}
                  className="btn-ghost"
                >
                  Tôi không biết
                </button>
              </div>
            )}
          </form>
        )}

        {feedback && (
          <div role="status" className={`mt-5 rounded-lg px-4 py-3 text-sm ${feedback.correct ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
            {feedback.correct ? (
              <>
                <span className="font-semibold">Chính xác!</span>
                <CoachReaction line={coach.line} className="mt-2" />
              </>
            ) : (
              <>
                <p className="font-semibold">Chưa đúng.</p>
                <p className="mt-1">
                  <strong>{word.word}</strong> ({word.pos}): {word.meaningVi}
                </p>
                <p className="mt-1 italic text-rose-800/80">"{word.example}"</p>
                <CoachReaction line={coach.line} className="mt-2" />
                <button onClick={() => advance(false)} className="btn mt-3 bg-rose-600 text-white hover:bg-rose-700">
                  Tiếp tục <span className="font-normal opacity-70">(Enter)</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
