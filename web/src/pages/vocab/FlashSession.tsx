import { useCallback, useEffect, useState } from "react";
import { TOPIC_LABEL, vocabById } from "../../data/vocabulary";
import { intervalLabel, type Grade } from "../../domain/srs";
import { gradeVocab, localDateKey, markMissionDone } from "../../lib/state";
import { update, useAppState } from "../../lib/store";
import { VerdictLine } from "../../components/Voice";
import { isTypingTarget, SpeakButton } from "./shared";

const GRADES: { grade: Grade; label: string; key: string; style: string }[] = [
  { grade: "again", label: "Chưa nhớ", key: "1", style: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-slate-100" },
  { grade: "hard", label: "Khó", key: "2", style: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-slate-100" },
  { grade: "good", label: "Nhớ", key: "3", style: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-slate-100" },
  { grade: "easy", label: "Dễ", key: "4", style: "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100" },
];

type Summary = Record<Grade, number>;

/** Quizlet-style flip cards, graded into the spaced-repetition schedule. */
export function FlashSession({ initial, onExit }: { initial: string[]; onExit: () => void }) {
  const state = useAppState();
  const [queue, setQueue] = useState<string[]>(initial);
  const [flipped, setFlipped] = useState(false);
  const [summary, setSummary] = useState<Summary>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [total] = useState(initial.length);

  const currentId = queue[0];
  const word = currentId ? vocabById.get(currentId) : undefined;
  const card = currentId ? state.srs[currentId] : undefined;

  const answer = useCallback(
    (grade: Grade) => {
      if (!currentId) return;
      const now = new Date();
      const last = queue.length === 1 && grade !== "again";
      update((s) => {
        const next = gradeVocab(s, currentId, grade, now);
        return last ? markMissionDone(next, localDateKey(now), "vocab") : next;
      });
      setSummary((s) => ({ ...s, [grade]: s[grade] + 1 }));
      setFlipped(false);
      setQueue((q) => (grade === "again" ? [...q.slice(1), currentId] : q.slice(1)));
    },
    [currentId, queue.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !word) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) answer(g.grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [word, flipped, answer]);

  if (!word) {
    const reviewed = summary.again + summary.hard + summary.good + summary.easy;
    return (
      <div className="card p-8 text-center">
        <VerdictLine context={summary.again > summary.good + summary.easy ? "done_rough" : "done"} className="mx-auto max-w-md text-left" />
        <h2 className="mt-4 text-xl font-bold">Xong phiên thẻ ghi nhớ!</h2>
        <p className="mt-1 text-sm text-slate-600">
          {total} từ · {reviewed} lượt chấm · Nhớ/Dễ: {summary.good + summary.easy} · Khó: {summary.hard} · Chưa nhớ:{" "}
          {summary.again}
        </p>
        <p className="mt-1 text-sm text-slate-500">Nhiệm vụ "Từ vựng" hôm nay đã được đánh dấu xong.</p>
        <button onClick={onExit} className="btn-primary mt-5">
          Xong
        </button>
      </div>
    );
  }

  const progress = Math.round(((total - new Set(queue).size) / total) * 100);
  const face =
    "relative col-start-1 row-start-1 overflow-hidden rounded-3xl border border-white/80 p-8 shadow-[0_10px_40px_rgb(79_70_229/0.14)] [backface-visibility:hidden]";
  const strip = <span className="absolute inset-x-0 top-0 h-1.5 bg-brand-600" aria-hidden />;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        <span>Còn {queue.length} · {card ? "Ôn tập" : "Từ mới"}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Lật về mặt trước" : "Lật thẻ để xem nghĩa"}
        onClick={() => setFlipped((f) => !f)}
        className="cursor-pointer [perspective:1200px]"
      >
        <div
          className={`grid min-h-[320px] transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className={`${face} flex flex-col items-center justify-center bg-white text-center`} aria-hidden={flipped}>
            {strip}
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{TOPIC_LABEL[word.topic]}</p>
            <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">{word.word}</h2>
            <p className="mt-2 text-sm text-slate-400">{word.pos}</p>
            <div className="mt-4"><SpeakButton text={word.word} label="Nghe phát âm" autoPlay /></div>
            <p className="mt-6 text-xs text-slate-400">Chạm để lật · Space</p>
          </div>
          <div className={`${face} bg-white [transform:rotateY(180deg)]`} aria-hidden={!flipped}>
            {strip}
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{word.word}</h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{word.pos}</span>
              <SpeakButton text={word.word} label="Nghe phát âm" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-brand-700">{word.meaningVi}</p>
            <p className="mt-1 text-slate-600">{word.meaningEn}</p>
            {word.paraphrase && (
              <p className="mt-3 text-sm">
                <span className="rounded bg-brand-50 px-2 py-0.5 font-medium text-brand-700">≈ {word.paraphrase}</span>
                <span className="ml-2 text-slate-400">paraphrase hay gặp trong TOEIC</span>
              </p>
            )}
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-700">
              <span className="flex-1">"{word.example}"</span>
              <SpeakButton text={word.example} label="Nghe câu ví dụ" />
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 ${flipped ? "" : "invisible"}`} aria-hidden={!flipped}>
        {GRADES.map((g) => (
          <button
            key={g.grade}
            tabIndex={flipped ? 0 : -1}
            onClick={() => answer(g.grade)}
            className={`rounded-2xl border px-2 py-3 text-sm font-semibold transition active:scale-[0.98] ${g.style}`}
          >
            {g.label}
            <span className="block text-xs font-normal opacity-70">
              {intervalLabel(card, g.grade, new Date())} · {g.key}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
