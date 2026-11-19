import { useCallback, useEffect, useMemo, useState } from "react";
import { vocabById } from "../../data/vocabulary";
import { buildDayTest } from "../../domain/dayTest";
import { DAY_TEST_PASS, unlockedWords, wordsForDay } from "../../domain/progress";
import { recordDayTest } from "../../lib/state";
import { update, useAppState } from "../../lib/store";
import { VerdictLine } from "../../components/Voice";
import { isTypingTarget, SpeakButton } from "./shared";

type Answer = { wordId: string; correct: boolean };

/** "Bài test ngày N": every word of the day once; DAY_TEST_PASS % or more passes the day's vocabulary. */
export function DayTestSession({ day, onExit }: { day: number; onExit: () => void }) {
  const state = useAppState();
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => buildDayTest(wordsForDay(day), unlockedWords(state.progress.day)),
    // A new set of questions for each attempt only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [day, round],
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<{ percent: number; passed: boolean; best: number } | null>(null);

  const q = questions[i];
  const total = questions.length;
  const right = answers.filter((a) => a.correct).length;

  const next = useCallback(() => {
    if (picked === null || !q) return;
    const all = [...answers, { wordId: q.wordId, correct: picked === q.correctIndex }];
    setAnswers(all);
    setPicked(null);
    if (i + 1 < total) {
      setI(i + 1);
      return;
    }
    let outcome = { percent: 0, passed: false };
    update((s) => {
      const r = recordDayTest(s, day, all);
      outcome = r;
      return r.state;
    });
    setResult({ ...outcome, best: Math.max(state.dayTests[String(day)] ?? 0, outcome.percent) });
  }, [picked, q, answers, i, total, day, state.dayTests]);

  const pick = useCallback((n: number) => picked === null && setPicked(n), [picked]);

  // Right answers move on by themselves after a moment; wrong ones wait for Enter.
  useEffect(() => {
    if (picked === null || !q || picked !== q.correctIndex) return;
    const t = setTimeout(next, 1100);
    return () => clearTimeout(t);
  }, [picked, q, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || result) return;
      if (picked === null && /^[1-4]$/.test(e.key)) pick(Number(e.key) - 1);
      else if (picked !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked, pick, next, result]);

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setAnswers([]);
    setResult(null);
  };

  if (total === 0) {
    return (
      <div className="card p-6 text-center text-sm text-slate-600">
        Ngày {day} chưa có từ nào để kiểm tra.
        <div className="mt-4"><button onClick={onExit} className="btn-ghost">Quay lại</button></div>
      </div>
    );
  }

  if (result) {
    const wrong = answers.filter((a) => !a.correct);
    return (
      <div className="card p-6 sm:p-8">
        <VerdictLine context={result.percent === 100 ? "done_perfect" : result.passed ? "done" : "done_rough"} className="mx-auto max-w-md" />
        <h2 className="mt-4 text-center text-2xl font-extrabold">
          {result.passed ? `Đạt bài test ngày ${day}!` : `Chưa đạt bài test ngày ${day}`}
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Đúng {right}/{total} câu · <strong className={result.passed ? "text-emerald-700" : "text-rose-700"}>{result.percent}%</strong>
          {" "}(cần {DAY_TEST_PASS}%) · Cao nhất {result.best}%
        </p>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
          {result.passed
            ? "Phần từ vựng của ngày này đã được tính. Các từ sai được xếp lịch ôn lại sớm."
            : `Phần từ vựng của ngày ${day} chưa được tính. Ôn lại các từ sai bên dưới rồi làm lại nhé.`}
        </p>
        {wrong.length > 0 && (
          <ul className="mt-5 divide-y divide-slate-100 text-sm">
            {wrong.map((a) => {
              const w = vocabById.get(a.wordId)!;
              return (
                <li key={a.wordId} className="flex items-center gap-3 py-2">
                  <span className="w-40 shrink-0 font-semibold">{w.word} <span className="text-xs font-normal text-slate-400">{w.pos}</span></span>
                  <span className="min-w-0 flex-1 text-slate-600">{w.meaningVi}</span>
                  <SpeakButton text={w.word} label={`Nghe ${w.word}`} />
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={restart} className={result.passed ? "btn-ghost" : "btn-primary"}>Làm lại</button>
          <button onClick={onExit} className={result.passed ? "btn-primary" : "btn-ghost"}>Xong</button>
        </div>
      </div>
    );
  }

  const correct = picked !== null && picked === q!.correctIndex;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát (không lưu)</button>
        <span>Câu {i + 1}/{total} · Đúng {right}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-brand-100" aria-hidden>
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${(i / total) * 100}%` }} />
      </div>
      <div className="card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Bài test ngày {day} · {q!.dir === "en2vi" ? "Chọn nghĩa đúng" : "Chọn từ đúng"}
        </p>
        <p className="mt-2 flex items-center gap-3">
          <span className="text-3xl font-extrabold tracking-tight">{q!.prompt}</span>
          {q!.dir === "en2vi" && <SpeakButton text={q!.prompt} label="Nghe phát âm" autoPlay />}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {q!.options.map((o, n) => {
            const style =
              picked === null
                ? "border-slate-200 hover:border-brand-400 hover:bg-brand-50"
                : n === q!.correctIndex
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : n === picked
                    ? "border-rose-400 bg-rose-50 text-rose-900"
                    : "border-slate-200 opacity-60";
            return (
              <button
                key={n}
                type="button"
                disabled={picked !== null}
                onClick={() => pick(n)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${style}`}
              >
                <span className="mr-2 text-slate-400">{n + 1}</span>
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div role="status" className={`mt-5 rounded-lg px-4 py-3 text-sm ${correct ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
            <p className="font-semibold">{correct ? "Chính xác!" : "Chưa đúng."}</p>
            {!correct && (
              <>
                <p className="mt-1">
                  {(() => {
                    const w = vocabById.get(q!.wordId)!;
                    return (
                      <>
                        <strong>{w.word}</strong> ({w.pos}): {w.meaningVi}
                      </>
                    );
                  })()}
                </p>
                <button onClick={next} className="btn mt-3 bg-rose-600 text-white hover:bg-rose-700">
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
