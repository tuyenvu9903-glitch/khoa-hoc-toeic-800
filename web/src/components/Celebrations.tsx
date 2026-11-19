import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { GameEvent } from "../lib/gamify";
import { onGameEvents, useAppState } from "../lib/store";
import { pickLine, type HumorLevel } from "../voice/engine";
import type { Mood } from "../voice/lines";
import { Mascot } from "./Mascot";

type Big = { id: number; icon: string; title: string; text: string; mood: Mood; sub?: string };
type Toast = { id: number; text: string };

const COLORS = ["#16a34a", "#f59e0b", "#2563eb", "#ec4899", "#ffd23f"];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden>
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 7) * 60}ms`,
            ["--dx" as string]: `${((i * 53) % 120) - 60}px`,
          }}
        />
      ))}
    </div>
  );
}

let nextId = 1;

function toBig(e: GameEvent, humor: HumorLevel): Big | null {
  switch (e.type) {
    case "level": {
      const l = pickLine("level_up", { humor, vars: { level: e.level, title: e.title } });
      return { id: nextId++, icon: "⬆️", title: `Level ${e.level}`, text: l.text, mood: l.mood, sub: e.title };
    }
    case "badge": {
      const l = pickLine("badge", { humor, vars: { badge: e.badge.name } });
      return { id: nextId++, icon: e.badge.icon, title: e.badge.name, text: l.text, mood: l.mood, sub: `${e.badge.flavor} (+${e.badge.xp} XP)` };
    }
    case "all_quests": {
      const l = pickLine("all_quests", { humor });
      return { id: nextId++, icon: "🌟", title: "Full nhiệm vụ hôm nay", text: l.text, mood: l.mood };
    }
    case "weekly": {
      const l = pickLine("weekly_done", { humor });
      return { id: nextId++, icon: e.challenge.icon, title: "Thử thách tuần", text: l.text, mood: l.mood, sub: e.challenge.title };
    }
    default:
      return null;
  }
}

function toToast(e: GameEvent, humor: HumorLevel): Toast | null {
  if (e.type === "xp") return { id: nextId++, text: `+${e.amount} XP · ${e.reason}` };
  if (e.type === "quest") return { id: nextId++, text: `${e.quest.icon} ${pickLine("quest_done", { humor }).text} ${e.quest.title}` };
  return null;
}

/** Shows level-ups, badges and quests as they happen anywhere in the app. */
export function Celebrations() {
  const { prefs } = useAppState();
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const [bigs, setBigs] = useState<Big[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      onGameEvents((events) => {
        const { humor, celebrations } = prefsRef.current;
        const newBigs: Big[] = [];
        const newToasts: Toast[] = [];
        for (const e of events) {
          const big = toBig(e, humor);
          if (big && celebrations) newBigs.push(big);
          else if (big) newToasts.push({ id: big.id, text: `${big.icon} ${big.title}${big.sub ? ` · ${big.sub}` : ""}` });
          const t = toToast(e, humor);
          if (t) newToasts.push(t);
        }
        if (newBigs.length) setBigs((b) => [...b, ...newBigs]);
        if (newToasts.length) {
          setToasts((t) => [...t, ...newToasts].slice(-3));
          for (const t of newToasts) setTimeout(() => setToasts((all) => all.filter((x) => x.id !== t.id)), 3200);
        }
      }),
    [],
  );

  const current = bigs[0];
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setBigs((b) => b.slice(1)), 4500);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <>
      {current && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 px-4" onClick={() => setBigs((b) => b.slice(1))}>
          <div
            key={current.id}
            role="dialog"
            aria-live="assertive"
            aria-label={current.title}
            className="pop-in relative w-full max-w-sm overflow-visible rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Confetti />
            <div className="mx-auto w-fit">
              <Mascot mood={current.mood} size={96} />
            </div>
            <p className="mt-2 text-3xl" aria-hidden>{current.icon}</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{current.title}</h2>
            <p className="mt-2 font-medium text-slate-700">{current.text}</p>
            {current.sub && <p className="mt-1 text-sm text-slate-500">{current.sub}</p>}
            <div className="mt-5 flex justify-center gap-2">
              <button className="btn-primary" onClick={() => setBigs((b) => b.slice(1))}>
                {bigs.length > 1 ? `Tiếp (${bigs.length - 1})` : "Ngon lành"}
              </button>
              <Link to="/achievements" className="btn-ghost" onClick={() => setBigs([])}>
                Xem thành tích
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6">
        {toasts.map((t) => (
          <p key={t.id} role="status" className="toast-in rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {t.text}
          </p>
        ))}
      </div>
    </>
  );
}
