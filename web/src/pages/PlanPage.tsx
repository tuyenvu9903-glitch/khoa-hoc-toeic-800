import { Link } from "react-router-dom";
import { dailyPlan, missionLink, type DayPlan } from "../data/dailyPlan";
import { weeks } from "../data/curriculum";
import { PART5_SKILLS } from "../data/reading";
import { TOPIC_LABEL } from "../data/vocabulary";
import { useAppState } from "../lib/store";
import type { Profile } from "../lib/state";

const PART_LABEL: Record<string, string> = {
  "2": "Part 2 · Hỏi – đáp",
  "3": "Part 3 · Hội thoại",
  "4": "Part 4 · Bài nói",
  "5": "Part 5 · Điền câu",
  "7": "Part 7 · Đọc hiểu",
};

function PracticeLinks({ plan }: { plan: DayPlan }) {
  const grammar = PART5_SKILLS.find((s) => s.code === plan.grammar)?.label ?? "Ngữ pháp";
  const links = [
    { to: missionLink("vocab", plan)!, label: `📚 Từ vựng · ${TOPIC_LABEL[plan.vocabTopic]}`, tone: "bg-p-purple text-violet-900" },
    { to: missionLink("grammar", plan)!, label: `✏️ Ngữ pháp · ${grammar}`, tone: "bg-p-blue text-sky-900" },
    { to: missionLink("listening", plan)!, label: `🎧 ${PART_LABEL[plan.listeningPart]}`, tone: "bg-p-mint text-emerald-900" },
    { to: missionLink("reading", plan)!, label: `📖 ${PART_LABEL[plan.readingPart]}`, tone: "bg-p-cream text-amber-900" },
  ];
  if (plan.test) links.push({ to: "/mini-test", label: "⏱️ Mini test", tone: "bg-p-blue text-indigo-900" });
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((l) => (
        <Link key={l.label} to={l.to} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition hover:brightness-95 ${l.tone}`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

/** The full 8-week plan, day by day. */
export function PlanPage(_props: { profile: Profile }) {
  const today = useAppState().progress.day;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Lộ trình 8 tuần</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mỗi ngày: học 3 ý chính rồi luyện đúng dạng bài của ngày. Làm xong hết nhiệm vụ của một ngày thì ngày sau mới mở (từ hôm sau). Bạn đang ở Ngày {today}.
      </p>

      <div className="mt-5 space-y-4">
        {weeks.map((w) => {
          const daysOfWeek = dailyPlan.filter((d) => d.week === w.weekNumber);
          const current = daysOfWeek.some((d) => d.day === today);
          return (
            <details key={w.weekNumber} open={current} className="card group overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
                    current ? "bg-brand-700 text-white" : w.weekNumber * 7 < today ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  T{w.weekNumber}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">Tuần {w.weekNumber}: {w.title}</span>
                  <span className="block truncate text-xs text-slate-500">Cuối tuần: {w.weekendGate}</span>
                </span>
                <span className="text-slate-400 transition group-open:rotate-90" aria-hidden>▶</span>
              </summary>
              <ol className="space-y-2 border-t border-slate-100 px-5 py-4">
                {daysOfWeek.map((d) => {
                  const isToday = d.day === today;
                  if (d.day > today) {
                    return (
                      <li key={d.day} className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-slate-400">
                        <span className="w-16 shrink-0 text-xs font-semibold">Ngày {d.day}</span>
                        <span className="flex-1">{d.title}</span>
                        <span aria-label="Chưa mở">🔒</span>
                      </li>
                    );
                  }
                  return (
                    <li key={d.day}>
                      <details open={isToday} className={`rounded-xl border px-4 py-3 ${isToday ? "border-brand-300 bg-brand-50" : "border-slate-200"}`}>
                        <summary className="flex cursor-pointer list-none items-center gap-3">
                          <span className={`w-16 shrink-0 text-xs font-semibold ${d.day < today ? "text-emerald-700" : "text-slate-500"}`}>
                            {d.day < today ? "✓ " : ""}Ngày {d.day}
                          </span>
                          <span className="flex-1 font-medium text-slate-900">{d.title}</span>
                          {isToday && <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">Hôm nay</span>}
                          {d.test && !isToday && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">Kiểm tra</span>}
                        </summary>
                        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                          {d.lesson.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                        <PracticeLinks plan={d} />
                      </details>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </div>
    </div>
  );
}
