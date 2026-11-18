import { Link } from "react-router-dom";
import { Ring } from "../components/ui";
import { planForDay } from "../data/dailyPlan";
import { packByDay } from "../data/dayPacks";
import { TOPIC_ICON } from "../data/vocabulary";
import { PROGRAM_DAYS } from "../domain/progress";
import { currentStreak } from "../domain/streak";
import { buildDashboard, type DashboardView } from "../lib/dashboard";
import { buildJourney, minutesLeft, nextStep } from "../lib/journey";
import { scoreSourceLabel, type Profile } from "../lib/state";
import { getSaveError, useAppState } from "../lib/store";

function greeting(now: Date): string {
  const h = now.getHours();
  return h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
}

function ScoreCard({ score, target }: { score: DashboardView["score"]; target: number }) {
  if (!score) {
    return (
      <section className="card p-5" aria-label="Điểm">
        <h2 className="text-sm font-semibold text-slate-500">Điểm TOEIC</h2>
        <p className="mt-3 text-sm text-slate-600">
          Chưa có điểm. Điểm ước lượng sẽ xuất hiện sau Mini test cuối tuần đầu tiên (Ngày 7). Nếu đã từng thi TOEIC thật, bạn có thể nhập điểm ở
          trang <Link to="/progress" className="font-medium text-brand-700 underline">Tiến độ</Link>.
        </p>
        <p className="mt-3 text-xs text-slate-500">Mục tiêu: {target}</p>
      </section>
    );
  }
  const src = scoreSourceLabel(score.source);
  return (
    <section className="card p-5" aria-label="Điểm">
      <h2 className="text-sm font-semibold text-slate-500">{src.official ? "Điểm thi chính thức gần nhất" : "Điểm ước lượng gần nhất"}</h2>
      <div className="mt-3 flex items-center gap-4">
        <Ring value={Math.min(1, score.current / score.target)} id="score-ring" size={112} stroke={10}>
          <div>
            <p className="text-2xl font-extrabold leading-none">{score.current}</p>
            <p className="mt-1 text-xs text-slate-400">/ {score.target}</p>
          </div>
        </Ring>
        <dl className="grid flex-1 gap-1.5 text-sm">
          <div className="flex justify-between rounded-lg bg-p-mint px-3 py-1.5"><dt className="text-slate-600">Nghe</dt><dd className="font-semibold">{score.listening}</dd></div>
          <div className="flex justify-between rounded-lg bg-p-cream px-3 py-1.5"><dt className="text-slate-600">Đọc</dt><dd className="font-semibold">{score.reading}</dd></div>
          <div className="flex justify-between px-3 text-xs"><dt className="text-slate-500">Còn thiếu</dt><dd className="font-semibold">{score.gapToTarget}</dd></div>
        </dl>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {src.label} · {new Date(score.at).toLocaleDateString("vi-VN")}
      </p>
    </section>
  );
}

export function DashboardPage({ profile }: { profile: Profile }) {
  const state = useAppState();
  const now = new Date();
  const view = buildDashboard(state, profile, now);
  const day = view.day;
  const plan = planForDay(day);
  const pack = packByDay.get(day);
  const steps = buildJourney(state);
  const next = nextStep(steps);
  const doneCount = steps.filter((s) => s.done).length;
  const streak = currentStreak(state.missionDone, now);
  const saveError = getSaveError();
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="space-y-5">
      {saveError && (
        <p role="alert" className="rounded-xl bg-p-coral px-4 py-3 text-sm text-rose-800">
          Không lưu được tiến độ vào trình duyệt ({saveError}). Hãy tải file sao lưu ở trang Dữ liệu.
        </p>
      )}

      {/* Hero: who, where in the course, and the one main action */}
      <section className="card overflow-hidden">
        <div className="bg-p-mint p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-800">{greeting(now)}, {profile.displayName} 👋</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                Ngày {day}<span className="text-slate-400">/{PROGRAM_DAYS}</span>
              </h1>
              <p className="mt-1 flex items-center gap-2 text-slate-700">
                <span aria-hidden>{TOPIC_ICON[pack?.topic ?? plan.vocabTopic]}</span>
                Tuần {view.week} · {pack?.theme ?? plan.title}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-2.5 text-center" title="Số ngày liên tiếp có học">
              <p className="text-xl font-extrabold">🔥 {streak}</p>
              <p className="text-xs text-slate-500">ngày liên tiếp</p>
            </div>
          </div>

          <div className="mt-6">
            {next ? (
              <Link to={next.to} className="btn-primary w-full !py-3.5 text-base sm:w-auto sm:!px-6">
                ▶ {doneCount === 0 ? "Bắt đầu học hôm nay" : `Tiếp tục: Bước ${next.n} · ${next.title}`}
              </Link>
            ) : (
              <p role="status" className="rounded-xl bg-white/80 px-4 py-3 text-sm text-brand-800">
                🎉 Bạn đã xong Ngày {day}. {day < PROGRAM_DAYS ? `Ngày ${day + 1} mở vào ngày mai.` : ""}
              </p>
            )}
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{doneCount}/{steps.length} bước hôm nay</span>
                <span>{next ? `còn ~${minutesLeft(steps)} phút` : "hoàn thành"}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Tiến độ hôm nay" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-brand-600 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2" aria-labelledby="plan-title">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="plan-title" className="text-lg font-bold">Kế hoạch hôm nay</h2>
            <Link to="/today" className="text-sm font-medium text-brand-700 hover:underline">Xem chi tiết →</Link>
          </div>
          <ol className="mt-4 space-y-2">
            {steps.map((s) => (
              <li key={s.kind}>
                <Link
                  to={s.to}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                    s.done ? "border-transparent bg-slate-50" : s === next ? "border-brand-300 bg-white" : "border-slate-200 bg-white hover:border-brand-200"
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${s.tone}`} aria-hidden>{s.done ? "✅" : s.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-semibold ${s.done ? "text-slate-400" : "text-slate-900"}`}>{s.n}. {s.title}</span>
                    <span className="block truncate text-xs text-slate-500">{s.detail}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{s.done ? "Đã xong" : `~${s.minutes}'`}</span>
                </Link>
              </li>
            ))}
          </ol>
          <details className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
            <summary className="cursor-pointer font-medium text-slate-700">📘 3 ý chính hôm nay</summary>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-700">
              {plan.lesson.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </details>
        </section>

        <aside className="space-y-5">
          <ScoreCard score={view.score} target={profile.targetScore} />

          <section className="card p-5">
            <h2 className="text-sm font-semibold text-slate-500">Ôn từ vựng</h2>
            {view.vocab.due > 0 ? (
              <>
                <p className="mt-2 text-sm text-slate-700"><strong className="text-lg">{view.vocab.due}</strong> từ đến hạn ôn hôm nay.</p>
                <Link to="/vocab" className="btn-ghost mt-3 !py-1.5">Ôn ngay</Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Không có từ nào đến hạn ôn. Đã học {view.vocab.learned} từ.</p>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-slate-500">Cần cải thiện</h2>
              <Link to="/progress" className="text-xs font-medium text-brand-700 hover:underline">Tiến độ →</Link>
            </div>
            {view.weaknesses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Chưa đủ dữ liệu. Sau vài bài luyện, các dạng bạn hay sai sẽ hiện ở đây.</p>
            ) : (
              <ol className="mt-3 space-y-2.5 text-sm">
                {view.weaknesses.slice(0, 3).map((w) => (
                  <li key={w.skillCode}>
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{w.name}</span>
                      <span className="text-slate-500">{Math.round(w.accuracy * 100)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.round(w.accuracy * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
