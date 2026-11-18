import { useState } from "react";
import { Link } from "react-router-dom";
import { scorePaper, type ExamPaper } from "../domain/exam";
import { buildShortMock, recordExam } from "../lib/papers";
import { update, useAppState } from "../lib/store";
import { ExamReview } from "./exam/ExamReview";
import { ExamRunner } from "./exam/ExamRunner";

/** Mock tests follow the plan: they open in week 5 (day 29). */
export const MOCK_FROM_DAY = 29;

export function MockTestPage() {
  const state = useAppState();
  const day = state.progress.day;
  const unlocked = day >= MOCK_FROM_DAY;
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);
  const history = state.scores.filter((s) => s.source.includes("mock")).slice(-5).reverse();

  const start = () => {
    setAnswers(null);
    setPaper(buildShortMock());
  };
  const finish = (a: Record<string, number>) => {
    setAnswers(a);
    const r = scorePaper(paper!, a);
    update((s) => recordExam(s, paper!, a, { listening: r.listening?.estimated ?? 5, reading: r.reading?.estimated ?? 5 }));
  };

  if (paper && !answers) {
    return (
      <div className="mx-auto max-w-6xl">
        <ExamRunner paper={paper} onFinish={finish} onQuit={() => setPaper(null)} />
      </div>
    );
  }
  if (paper && answers) {
    return (
      <div className="mx-auto max-w-6xl">
        <ExamReview
          paper={paper}
          answers={answers}
          actions={
            <>
              <button onClick={() => setPaper(null)} className="btn-primary">Xong</button>
              <Link to="/" className="btn-ghost">Về Dashboard</Link>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Thi thử</h1>
      <p className="mt-1 text-sm text-slate-500">
        Làm bài như thi thật: Nghe tự chạy một lần, Đọc có giờ và tự nộp. Điểm quy đổi là ước lượng, không phải điểm chính thức ETS.
      </p>

      {!unlocked && (
        <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          🔒 Theo lộ trình, thi thử mở từ <strong>Ngày {MOCK_FROM_DAY}</strong> (tuần 5). Bạn đang ở Ngày {day}. Trước đó, hãy làm Mini test cuối mỗi tuần.
        </p>
      )}

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className={`card flex flex-col p-5 ${unlocked ? "" : "opacity-60"}`}>
          <h2 className="font-bold">📝 Đề rút gọn</h2>
          <p className="mt-1 flex-1 text-sm text-slate-600">
            50 câu: Nghe 25 câu (Part 2–4, khoảng 20 phút), Đọc khoảng 25 câu (Part 5, 7, tính giờ theo nhịp thi thật). Mỗi lần làm là một đề trộn mới.
          </p>
          <button onClick={start} disabled={!unlocked} className="btn-primary mt-4 self-start">Bắt đầu</button>
        </div>
        <div className="card flex flex-col p-5 opacity-60">
          <h2 className="font-bold">🏁 Full test 200 câu</h2>
          <p className="mt-1 flex-1 text-sm text-slate-600">Nghe 100 câu / 45 phút, Đọc 100 câu / 75 phút, đủ 7 Part. Đang soạn đề gốc.</p>
          <button disabled className="btn-primary mt-4 self-start">Sắp có</button>
        </div>
      </section>

      {history.length > 0 && (
        <section className="card mt-5 p-5">
          <h2 className="font-bold">Lần thi gần đây</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {history.map((h) => (
              <li key={h.at} className="flex justify-between py-2">
                <span>{new Date(h.at).toLocaleDateString("vi-VN")}</span>
                <span>
                  Nghe {h.listening} · Đọc {h.reading} · <strong>{h.total}</strong>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
