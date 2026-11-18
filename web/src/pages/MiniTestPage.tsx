import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { part2Items, part3Sets } from "../data/listening";
import { part5Items, part7Sets } from "../data/reading";
import { shuffle } from "../domain/learn";
import { localDateKey, markMissionDone } from "../lib/state";
import { update } from "../lib/store";
import { Part2Session, SetSession } from "./ListeningPage";
import { Part5Session, Part7Session, type SessionResult } from "./ReadingPage";

const MINUTES = 20;
const SECTIONS = ["Part 2 · Hỏi – đáp", "Part 3 · Hội thoại", "Part 5 · Điền vào câu", "Part 7 · Đọc hiểu"] as const;

type Paper = {
  p2: typeof part2Items;
  p3: typeof part3Sets;
  p5: typeof part5Items;
  p7: typeof part7Sets;
};

const newPaper = (): Paper => ({
  p2: shuffle(part2Items).slice(0, 5),
  p3: shuffle(part3Sets).slice(0, 1),
  p5: shuffle(part5Items).slice(0, 5),
  p7: shuffle(part7Sets).slice(0, 1),
});

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** A short mixed test (about 16 questions, 20 minutes) for the weekend checkpoints. */
export function MiniTestPage() {
  const [status, setStatus] = useState<"ready" | "running" | "done">("ready");
  const [paper, setPaper] = useState<Paper>(newPaper);
  const [section, setSection] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [left, setLeft] = useState(MINUTES * 60);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const finish = (all: SessionResult[]) => {
    setResults(all);
    setStatus("done");
    update((s) => markMissionDone(s, localDateKey(new Date()), "mini_test"));
  };

  useEffect(() => {
    if (status === "running" && left <= 0) {
      setTimedOut(true);
      finish(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, status]);

  const sectionDone = (r: SessionResult) => {
    const all = [...results, r];
    if (section + 1 >= SECTIONS.length) finish(all);
    else {
      setResults(all);
      setSection(section + 1);
    }
  };

  const start = () => {
    setPaper(newPaper());
    setSection(0);
    setResults([]);
    setLeft(MINUTES * 60);
    setTimedOut(false);
    setStatus("running");
  };
  const quit = () => setStatus("ready");

  const total = results.reduce((n, r) => n + r.total, 0);
  const correct = results.reduce((n, r) => n + r.correct, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Mini test</h1>
        {status === "running" && (
          <p className={`font-mono text-lg font-bold ${left < 120 ? "text-rose-600" : "text-slate-700"}`} aria-live="off">
            ⏱ {fmt(Math.max(0, left))}
          </p>
        )}
      </div>

      {status === "ready" && (
        <div className="card mx-auto mt-5 max-w-2xl p-6">
          <p className="text-slate-700">Bài kiểm tra ngắn gồm 4 phần, làm liền mạch trong {MINUTES} phút:</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Part 2: 5 câu hỏi – đáp</li>
            <li>Part 3: 1 đoạn hội thoại (3 câu)</li>
            <li>Part 5: 5 câu điền vào câu</li>
            <li>Part 7: 1 bài đọc</li>
          </ol>
          <p className="mt-3 text-sm text-slate-500">Hết giờ, bài tự nộp với các phần đã làm xong. Câu sai được ghi vào nhật ký lỗi.</p>
          <button onClick={start} className="btn-primary mt-5">Bắt đầu</button>
        </div>
      )}

      {status === "running" && (
        <div className="mt-4">
          <ol className="mb-4 flex flex-wrap gap-2 text-xs" aria-label="Các phần">
            {SECTIONS.map((s, i) => (
              <li
                key={s}
                className={`rounded-full px-3 py-1 ${i === section ? "bg-brand-600 text-white" : i < section ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
              >
                {i < section ? "✓ " : ""}{s}
              </li>
            ))}
          </ol>
          <div className={section >= 2 && section !== 3 ? "mx-auto max-w-3xl" : section < 2 ? "mx-auto max-w-3xl" : ""}>
            {section === 0 && <Part2Session items={paper.p2} rate={1} onDone={sectionDone} onExit={quit} />}
            {section === 1 && <SetSession part="3" sets={paper.p3} rate={1} onDone={sectionDone} onExit={quit} />}
            {section === 2 && <Part5Session items={paper.p5} onDone={sectionDone} onExit={quit} />}
            {section === 3 && <Part7Session sets={paper.p7} onDone={sectionDone} onExit={quit} />}
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="card mx-auto mt-5 max-w-2xl p-6 text-center">
          <p className="text-5xl" aria-hidden>{total > 0 && correct / total >= 0.7 ? "🎉" : "📈"}</p>
          <p className="mt-2 text-3xl font-extrabold">{correct}/{total}</p>
          <p className="mt-1 text-sm text-slate-600">
            {timedOut ? "Hết giờ, đã chấm các phần làm xong. " : ""}
            {total > 0 ? `Đúng ${Math.round((correct / total) * 100)}%.` : "Chưa làm xong phần nào."} Nhiệm vụ "Mini test" hôm nay đã được đánh dấu.
          </p>
          <ul className="mx-auto mt-4 max-w-sm space-y-1 text-left text-sm">
            {results.map((r, i) => (
              <li key={i} className="flex justify-between rounded-lg bg-slate-100 px-3 py-1.5">
                <span>{SECTIONS[i]}</span>
                <span className="font-semibold">{r.correct}/{r.total}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={start} className="btn-primary">Làm đề khác</button>
            <Link to="/" className="btn-ghost">Về Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}
