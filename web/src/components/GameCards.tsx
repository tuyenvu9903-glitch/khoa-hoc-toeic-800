import { Link } from "react-router-dom";
import { levelProgress, questBoard, weeklyBoard, XP } from "../lib/gamify";
import type { AppState } from "../lib/state";

function Bar({ ratio, tone = "bg-brand-600", label }: { ratio: number; tone?: string; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${tone} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Level + XP: compact chip for the navigation, full card for the dashboard. */
export function LevelChip({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const p = levelProgress(xp);
  if (compact) {
    return (
      <Link to="/achievements" className="flex items-center gap-1.5 rounded-full bg-p-cream px-2.5 py-1 text-xs font-bold text-amber-800" title={`${p.title} · ${xp} XP`}>
        <span aria-hidden>⚡</span>Lv {p.level}
      </Link>
    );
  }
  return (
    <Link to="/achievements" className="block rounded-xl bg-slate-50 px-3 py-2.5 hover:bg-slate-100">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-bold text-slate-800">Lv {p.level} · {p.title}</span>
        <span className="text-slate-500">{xp} XP</span>
      </div>
      <div className="mt-1.5">
        <Bar ratio={p.ratio} tone="bg-amber-400" label="Tiến độ lên cấp" />
      </div>
    </Link>
  );
}

export function LevelCard({ state }: { state: AppState }) {
  const p = levelProgress(state.game.xp);
  const badges = Object.keys(state.game.badges).length;
  return (
    <section className="card p-5" aria-labelledby="level-title">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-p-cream text-lg font-extrabold text-amber-800">{p.level}</span>
        <div className="min-w-0">
          <h2 id="level-title" className="truncate font-bold">{p.title}</h2>
          <p className="text-xs text-slate-500">{state.game.xp} XP · {badges} huy hiệu</p>
        </div>
      </div>
      <div className="mt-3">
        <Bar ratio={p.ratio} tone="bg-amber-400" label="Tiến độ lên cấp" />
        <p className="mt-1 text-xs text-slate-500">Còn {p.need - p.into} XP nữa lên Lv {p.level + 1}</p>
      </div>
      <Link to="/achievements" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">Tủ huy hiệu →</Link>
    </section>
  );
}

export function QuestCard({ state }: { state: AppState }) {
  const quests = questBoard(state);
  const weekly = weeklyBoard(state);
  const doneCount = quests.filter((q) => q.done).length;
  return (
    <section className="card p-5" aria-labelledby="quest-title">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="quest-title" className="text-lg font-bold">Nhiệm vụ hôm nay</h2>
        <span className="text-xs font-semibold text-slate-500">{doneCount}/3 · +{XP.quest} XP mỗi cái</span>
      </div>
      <ul className="mt-3 space-y-3">
        {quests.map(({ quest, value, done }) => (
          <li key={quest.id} className="flex items-center gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${done ? "bg-p-mint" : "bg-slate-100"}`} aria-hidden>
              {done ? "✅" : quest.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-sm">
                <span className={`font-medium ${done ? "text-slate-400 line-through" : ""}`}>{quest.title}</span>
                <span className="shrink-0 text-xs text-slate-500">{value}/{quest.target}</span>
              </div>
              <div className="mt-1">
                <Bar ratio={value / quest.target} label={quest.title} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {doneCount === 3 ? (
        <p className="mt-3 rounded-lg bg-p-mint px-3 py-2 text-xs font-semibold text-brand-800">Full combo! Đã nhận thêm {XP.allQuests} XP thưởng.</p>
      ) : (
        <p className="mt-3 text-xs text-slate-500">Xong cả 3 nhiệm vụ để nhận thêm {XP.allQuests} XP.</p>
      )}
      <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-p-cream/60 p-3">
        <div className="flex justify-between gap-2 text-sm">
          <span className="font-semibold">{weekly.challenge.icon} Thử thách tuần: {weekly.challenge.title}</span>
          <span className="shrink-0 text-xs text-slate-600">{weekly.done ? "Xong" : `${weekly.value}/${weekly.challenge.target}`}</span>
        </div>
        <div className="mt-1.5">
          <Bar ratio={weekly.value / weekly.challenge.target} tone="bg-amber-400" label="Thử thách tuần" />
        </div>
        <p className="mt-1 text-xs text-slate-500">Thưởng {XP.weekly} XP. Đổi thử thách vào thứ Hai.</p>
      </div>
    </section>
  );
}
