import { useState } from "react";
import { scorePaper, type ExamPaper, type ExamPart } from "../../domain/exam";

const LETTERS = ["A", "B", "C", "D"] as const;
const SPEAKER: Record<string, string> = { M: "Man", W: "Woman", M2: "Man 2", W2: "Woman 2" };
const PART_NAME: Record<ExamPart, string> = {
  "1": "Part 1 · Tranh",
  "2": "Part 2 · Hỏi – đáp",
  "3": "Part 3 · Hội thoại",
  "4": "Part 4 · Bài nói",
  "5": "Part 5 · Điền câu",
  "6": "Part 6 · Điền đoạn văn",
  "7": "Part 7 · Đọc hiểu",
};

/** Results and full review after submission: estimated scores, per-part accuracy, every question explained. */
export function ExamReview({ paper, answers, actions }: { paper: ExamPaper; answers: Record<string, number>; actions?: React.ReactNode }) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const r = scorePaper(paper, answers);
  const total = (r.listening?.estimated ?? 0) + (r.reading?.estimated ?? 0);
  const parts = (Object.keys(r.byPart) as ExamPart[]).sort();

  return (
    <div className="space-y-5">
      <section className="card p-6">
        <h2 className="text-xl font-bold">Kết quả: {paper.title}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {r.listening && (
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">🎧 Nghe</p>
              <p className="text-2xl font-extrabold">{r.listening.estimated}<span className="text-sm font-medium text-slate-500"> /495</span></p>
              <p className="text-xs text-slate-600">Đúng {r.listening.correct}/{r.listening.total}</p>
            </div>
          )}
          {r.reading && (
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm text-amber-800">📖 Đọc</p>
              <p className="text-2xl font-extrabold">{r.reading.estimated}<span className="text-sm font-medium text-slate-500"> /495</span></p>
              <p className="text-xs text-slate-600">Đúng {r.reading.correct}/{r.reading.total}</p>
            </div>
          )}
          {r.listening && r.reading && (
            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-sm text-brand-800">Tổng ước lượng</p>
              <p className="text-2xl font-extrabold">{total}<span className="text-sm font-medium text-slate-500"> /990</span></p>
              <p className="text-xs text-slate-600">Mục tiêu 800</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Điểm quy đổi chỉ là ước lượng dựa trên tỉ lệ câu đúng, không phải điểm chính thức của ETS.
          {r.answered < paper.sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.questions.length, 0), 0) ? " Một số câu chưa được trả lời và tính là sai." : ""}
        </p>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="py-1 font-medium">Phần</th>
              <th className="py-1 text-right font-medium">Đúng</th>
              <th className="py-1 text-right font-medium">Tỉ lệ</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => {
              const s = r.byPart[p]!;
              const pct = Math.round((s.correct / s.total) * 100);
              return (
                <tr key={p} className="border-t border-slate-100">
                  <td className="py-1.5">{PART_NAME[p]}</td>
                  <td className="py-1.5 text-right">{s.correct}/{s.total}</td>
                  <td className={`py-1.5 text-right font-semibold ${pct >= 80 ? "text-emerald-700" : pct >= 60 ? "text-amber-700" : "text-rose-700"}`}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Xem lại từng câu</h2>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
            Chỉ câu sai
          </label>
        </div>
        <div className="mt-4 space-y-6">
          {paper.sections.flatMap((s) =>
            s.groups.map((g) => {
              const wrong = g.questions.some((q) => answers[q.id] !== q.answer);
              if (onlyWrong && !wrong) return null;
              return (
                <article key={g.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{PART_NAME[g.part]}</p>
                  {g.script && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-slate-600">Lời thoại</summary>
                      <div className="mt-2 space-y-1 text-slate-700">
                        {g.script.map((l, i) => (
                          <p key={i}>
                            {(g.part === "3" || g.script!.length > 4) && <span className="mr-1 font-semibold text-slate-500">{SPEAKER[l.speaker]}:</span>}
                            {l.text}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                  {g.passages?.map((p, i) => (
                    <details key={i} className="mt-2 text-sm">
                      <summary className="cursor-pointer text-slate-600">{p.title}</summary>
                      <div className="mt-2 whitespace-pre-line text-slate-700">{p.text}</div>
                    </details>
                  ))}
                  <ol className="mt-3 space-y-4">
                    {g.questions.map((q) => {
                      const mine = answers[q.id];
                      const ok = mine === q.answer;
                      return (
                        <li key={q.id}>
                          <p className="font-medium text-slate-900">
                            {q.number}. {q.question ?? "(Câu hỏi và đáp án được đọc trong bài nghe)"}
                            <span className={`ml-2 text-sm font-semibold ${ok ? "text-emerald-700" : "text-rose-700"}`}>{ok ? "✓" : mine === undefined ? "✗ chưa trả lời" : "✗"}</span>
                          </p>
                          <ul className="mt-1 space-y-0.5 text-sm">
                            {q.options.map((o, i) => (
                              <li key={i} className={i === q.answer ? "font-medium text-emerald-800" : i === mine ? "text-rose-700 line-through" : "text-slate-600"}>
                                ({LETTERS[i]}) {o}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">💡 {q.explainVi}</p>
                        </li>
                      );
                    })}
                  </ol>
                </article>
              );
            }),
          )}
        </div>
      </section>
    </div>
  );
}
