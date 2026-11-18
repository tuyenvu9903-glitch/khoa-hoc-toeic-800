import { useState } from "react";
import { Link } from "react-router-dom";
import type { ExamPaper } from "../domain/exam";
import { firstTestDay, miniTestUnlocked } from "../domain/progress";
import { buildMiniPaper, recordExam } from "../lib/papers";
import { localDateKey, markMissionDone } from "../lib/state";
import { update, useAppState } from "../lib/store";
import { ExamReview } from "./exam/ExamReview";
import { ExamRunner } from "./exam/ExamRunner";

/** The weekly checkpoint, run in exam mode on material already studied. */
export function MiniTestPage() {
  const day = useAppState().progress.day;
  const unlocked = miniTestUnlocked(day);
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);

  const start = () => {
    setAnswers(null);
    setPaper(buildMiniPaper(day));
  };
  const finish = (a: Record<string, number>) => {
    setAnswers(a);
    update((s) => markMissionDone(recordExam(s, paper!, a, null), localDateKey(new Date()), "mini_test"));
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Mini test</h1>

      {!unlocked && (
        <div className="card mx-auto mt-5 max-w-2xl p-6 text-center">
          <p className="text-4xl" aria-hidden>🔒</p>
          <p className="mt-2 text-slate-700">Mini test đầu tiên mở vào <strong>Ngày {firstTestDay()}</strong>, cuối tuần 1. Bạn đang ở Ngày {day}.</p>
          <Link to="/" className="btn-ghost mt-4">Về Dashboard</Link>
        </div>
      )}

      {unlocked && !paper && (
        <div className="card mx-auto mt-5 max-w-2xl p-6">
          <p className="text-slate-700">Bài kiểm tra cuối tuần làm theo đúng giao diện thi thật, chỉ gồm nội dung bạn đã học tới Ngày {day}:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Phần Nghe tự chạy, mỗi đoạn chỉ phát một lần.</li>
            <li>Phần Đọc có đồng hồ đếm ngược, phiếu trả lời và đánh dấu câu. Hết giờ bài tự nộp.</li>
            <li>Giải thích và điểm ước lượng hiện sau khi nộp. Câu sai được ghi vào nhật ký lỗi.</li>
          </ul>
          <button onClick={start} className="btn-primary mt-5">Bắt đầu</button>
        </div>
      )}

      {paper && !answers && (
        <div className="mt-5">
          <ExamRunner paper={paper} onFinish={finish} onQuit={() => setPaper(null)} />
        </div>
      )}

      {paper && answers && (
        <div className="mt-5">
          <ExamReview
            paper={paper}
            answers={answers}
            actions={
              <>
                <button onClick={start} className="btn-primary">Làm đề khác</button>
                <Link to="/" className="btn-ghost">Về Dashboard</Link>
              </>
            }
          />
        </div>
      )}
    </div>
  );
}
