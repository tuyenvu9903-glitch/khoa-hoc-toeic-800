import { Link } from "react-router-dom";
import { missionLink, planForDay } from "../data/dailyPlan";
import { packByDay } from "../data/dayPacks";
import { TOPIC_ICON, TOPIC_LABEL } from "../data/vocabulary";
import { isKindDone, requiredKinds, wordsForDay } from "../domain/progress";
import { Ring } from "../components/ui";
import { weeks } from "../data/curriculum";
import { currentStreak } from "../domain/streak";
import { buildDashboard, type DashboardView } from "../lib/dashboard";
import { localDateKey, toggleMissionItem, type Profile } from "../lib/state";
import { getSaveError, update, useAppState } from "../lib/store";

const KIND: Record<string, { label: string; icon: string; chip: string }> = {
  vocab: { label: "Từ vựng", icon: "📚", chip: "bg-violet-100" },
  grammar: { label: "Ngữ pháp", icon: "✏️", chip: "bg-sky-100" },
  listening: { label: "Nghe", icon: "🎧", chip: "bg-emerald-100" },
  reading: { label: "Đọc", icon: "📖", chip: "bg-amber-100" },
  error_review: { label: "Ôn câu sai", icon: "🔁", chip: "bg-rose-100" },
  mini_test: { label: "Mini test", icon: "⏱️", chip: "bg-indigo-100" },
  mock: { label: "Thi thử", icon: "📝", chip: "bg-fuchsia-100" },
  analysis: { label: "Phân tích", icon: "📊", chip: "bg-cyan-100" },
};

function ScoreCard({ score }: { score: DashboardView["score"] }) {
  const pct = Math.min(1, score.current / score.target);
  return (
    <section className="card p-6" aria-label="Điểm ước tính">
      <h2 className="text-sm font-semibold text-slate-500">Điểm ước tính</h2>
      <div className="mt-3 flex items-center gap-5">
        <Ring value={pct} id="score-ring">
          <div>
            <p className="text-3xl font-extrabold leading-none">{score.current}</p>
            <p className="mt-1 text-xs text-slate-400">/ {score.target}</p>
          </div>
        </Ring>
        <dl className="grid flex-1 gap-2 text-sm">
          <div className="flex justify-between rounded-lg bg-brand-50 px-3 py-1.5">
            <dt className="text-slate-500">Nghe</dt>
            <dd className="font-semibold">{score.listening}</dd>
          </div>
          <div className="flex justify-between rounded-lg bg-brand-50 px-3 py-1.5">
            <dt className="text-slate-500">Đọc</dt>
            <dd className="font-semibold">{score.reading}</dd>
          </div>
          <div className="flex justify-between rounded-lg bg-amber-50 px-3 py-1.5">
            <dt className="text-slate-500">Mốc tiếp</dt>
            <dd className="font-semibold text-amber-700">{score.nextTarget}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function WeekTrack({ week }: { week: number }) {
  return (
    <ol className="grid grid-cols-8 gap-1.5" aria-label="Lộ trình 8 tuần">
      {weeks.map((w) => {
        const state = w.weekNumber < week ? "done" : w.weekNumber === week ? "now" : "todo";
        return (
          <li
            key={w.weekNumber}
            title={`Tuần ${w.weekNumber}: ${w.title}`}
            aria-current={state === "now" ? "step" : undefined}
            className={`rounded-lg px-1 py-2 text-center text-xs font-semibold transition ${
              state === "done"
                ? "bg-brand-600 text-white"
                : state === "now"
                  ? "bg-brand-600 text-white"
                  : "bg-white/70 text-slate-400"
            }`}
          >
            <span className="hidden sm:inline">Tuần </span>
            {w.weekNumber}
          </li>
        );
      })}
    </ol>
  );
}

export function DashboardPage({ profile }: { profile: Profile }) {
  const state = useAppState();
  const now = new Date();
  const view = buildDashboard(state, profile, now);
  const plan = planForDay(view.day);
  const dateKey = localDateKey(now);
  const pack = packByDay.get(view.day);
  const todayWords = wordsForDay(view.day);
  const learnedToday = todayWords.filter((w) => state.srs[w.id]).length;
  const tracked = new Set<string>(requiredKinds(plan));
  const manualDone = new Set(state.missionDone[dateKey] ?? []);
  const isDone = (kind: string) =>
    tracked.has(kind) ? isKindDone(state.progress, state.srs, view.day, kind) : manualDone.has(kind);
  // The mini test only counts on the weekly checkpoint days.
  const items = view.mission.items.filter((i) => i.kind !== "mini_test" || plan.test);
  const done = new Set(items.filter((i) => isDone(i.kind)).map((i) => i.kind));
  const dayComplete = [...tracked].every((k) => isDone(k));
  const doneMinutes = items.filter((i) => done.has(i.kind)).reduce((n, i) => n + i.minutes, 0);
  const dayPct = view.mission.totalMinutes === 0 ? 0 : Math.round((doneMinutes / view.mission.totalMinutes) * 100);
  const allDone = dayComplete;
  const streak = currentStreak(state.missionDone, now);
  const saveError = getSaveError();

  return (
    <div className="space-y-5">
      {saveError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Không lưu được tiến độ vào trình duyệt ({saveError}). Hãy tải file sao lưu ở trang Dữ liệu.
        </p>
      )}

      <section className="relative overflow-hidden rounded-3xl bg-brand-700 p-6 text-white sm:p-8">
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">Chào {profile.displayName} 👋</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ngày {view.day}
              <span className="text-white/60">/56</span>
            </h1>
            <p className="mt-1 text-white/85">
              Tuần {view.week}
              {view.weekTitle ? ` · ${view.weekTitle}` : ""}
            </p>
            <p className="mt-0.5 text-sm text-white/80">Hôm nay: <strong className="text-white">{plan.title}</strong></p>
          </div>
          <div
            className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5"
            title="Số ngày liên tiếp có hoàn thành ít nhất một nhiệm vụ"
          >
            <span className="text-2xl" aria-hidden>🔥</span>
            <div className="leading-tight">
              <p className="text-xl font-extrabold">{streak}</p>
              <p className="text-xs text-white/75">ngày liên tiếp</p>
            </div>
          </div>
        </div>
        <div className="relative mt-6">
          <div className="mb-1.5 flex justify-between text-sm text-white/85">
            <span>{allDone ? "Hoàn thành nhiệm vụ hôm nay 🎉" : "Tiến độ hôm nay"}</span>
            <span>{doneMinutes}/{view.mission.totalMinutes} phút</span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-white/25"
            role="progressbar"
            aria-label="Tiến độ hôm nay"
            aria-valuenow={dayPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${dayPct}%` }} />
          </div>
        </div>
      </section>

      <WeekTrack week={view.week} />

      <section className="card p-6" aria-labelledby="lesson-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="lesson-title" className="text-lg font-bold">
            📘 Bài học hôm nay · <span className="text-brand-700">Tuần {plan.week} · Ngày {plan.day}</span>
          </h2>
          <Link to="/plan" className="text-sm font-medium text-brand-700 hover:underline">Xem cả lộ trình →</Link>
        </div>
        <p className="mt-1 font-semibold text-slate-800">{plan.title}</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {plan.lesson.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-base" aria-hidden>
            {TOPIC_ICON[pack?.topic ?? plan.vocabTopic]}
          </span>
          Chủ đề hôm nay: <strong className="text-slate-800">{pack?.theme ?? TOPIC_LABEL[plan.vocabTopic]}</strong>
          <span className="text-slate-400">·</span>
          {todayWords.length} từ mới, bài nghe và bài đọc cùng chủ đề
        </p>
      </section>

      {dayComplete && !view.finished && (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          🎉 Bạn đã hoàn thành <strong>Ngày {view.day}</strong>. Ngày {view.day + 1} sẽ mở vào ngày mai, hãy ôn lại từ vựng đến hạn nếu còn thời gian.
        </div>
      )}

      {!view.placementDone && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900">
          <span className="text-xl" aria-hidden>🧭</span>
          <p>
            Bạn chưa làm <strong>Placement Test</strong>. Bài này sẽ xác định điểm yếu ban đầu (sắp có ở Phase 3).
          </p>
        </div>
      )}
      {view.finished && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Bạn đã đi hết 56 ngày. Có thể bắt đầu lại ở trang Dữ liệu.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <section className="card p-6 md:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-bold">Hôm nay tôi phải học gì?</h2>
            <p className="text-xs text-slate-500">
              {Math.round(view.mission.learningRatio * 100)}% học · {Math.round(view.mission.practiceRatio * 100)}% luyện
            </p>
          </div>
          <ol className="mt-4 space-y-2">
            {items.map((item) => {
              const checked = done.has(item.kind);
              const k = KIND[item.kind] ?? { label: item.title, icon: "•", chip: "bg-slate-100" };
              return (
                <li
                  key={item.kind}
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-3.5 py-3 transition ${
                    checked ? "border-transparent bg-brand-50/70" : "border-slate-200/80 bg-white hover:border-brand-200 hover:shadow-sm"
                  }`}
                >
                  <input
                    id={`m-${item.kind}`}
                    type="checkbox"
                    className="check disabled:cursor-default"
                    checked={checked}
                    disabled={tracked.has(item.kind)}
                    title={tracked.has(item.kind) ? "Tự đánh dấu khi bạn làm xong bài luyện" : undefined}
                    onChange={() => update((s) => toggleMissionItem(s, dateKey, item.kind))}
                  />
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${k.chip}`} aria-hidden>
                    {k.icon}
                  </span>
                  <label htmlFor={`m-${item.kind}`} className="min-w-[8rem] flex-1 cursor-pointer">
                    <span className={`block whitespace-nowrap font-semibold ${checked ? "text-slate-400 line-through" : ""}`}>{k.label}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {item.kind === "vocab"
                        ? `${learnedToday}/${todayWords.length} từ mới hôm nay${view.vocab.due > 0 ? ` · ${view.vocab.due} từ cần ôn` : ""}`
                        : (item.reason ?? `${item.itemCount} câu · ${item.minutes} phút`)}
                    </span>
                  </label>
                  {missionLink(item.kind, plan) && !checked && (
                    <Link to={missionLink(item.kind, plan)!} className="btn-primary ml-auto shrink-0 !px-3 !py-1.5 !text-xs">
                      Luyện ngay
                    </Link>
                  )}
                  <p className="hidden shrink-0 text-right text-sm font-medium text-slate-600 sm:block">
                    {item.itemCount} câu
                    <span className="block text-xs font-normal text-slate-400">{item.minutes} phút</span>
                  </p>
                </li>
              );
            })}
          </ol>
          {view.weekendGate && (
            <p className="mt-4 rounded-xl bg-slate-100 px-4 py-2.5 text-xs text-slate-600">
              🏁 Cuối tuần: <strong>{view.weekendGate}</strong>
            </p>
          )}
        </section>

        <aside className="space-y-5">
          <ScoreCard score={view.score} />
          <section className="card p-6">
            <h2 className="text-sm font-semibold text-slate-500">Top điểm yếu</h2>
            {view.weaknesses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Chưa có dữ liệu. Làm bài đầu tiên để hệ thống phân tích.</p>
            ) : (
              <ol className="mt-3 space-y-3 text-sm">
                {view.weaknesses.slice(0, 5).map((w, i) => (
                  <li key={w.skillCode}>
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{i + 1}. {w.name}</span>
                      <span className="text-slate-500">{Math.round(w.accuracy * 100)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.round(w.accuracy * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 text-xs text-slate-500">Câu sai chưa ôn: <strong>{view.openErrors}</strong></p>
          </section>
        </aside>
      </div>
    </div>
  );
}
