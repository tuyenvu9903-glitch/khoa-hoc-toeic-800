import type { ReactNode } from "react";
import type { Mood } from "../voice/lines";

/**
 * "Tám": the bootcamp chick (an "800" headband, because every gà mờ wants to stop being one).
 * Pure SVG with flat colours; the face changes with the mood.
 */
export function Mascot({ mood = "neutral", size = 72, className = "" }: { mood?: Mood; size?: number; className?: string }) {
  const motion =
    mood === "sad" || mood === "helpless" ? "mascot-droop" : mood === "confused" ? "mascot-tilt" : mood === "sleepy" ? "" : "mascot-bounce";
  return (
    <svg
      key={mood}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Tám, linh vật của TOEIC 800 (${MOOD_LABEL[mood]})`}
      className={`shrink-0 overflow-visible ${motion} ${className}`}
    >
      {/* feet */}
      <path d="M46 104 l-6 8 M46 104 l0 9 M46 104 l6 8" stroke="#f08c2a" strokeWidth="4" strokeLinecap="round" />
      <path d="M74 104 l-6 8 M74 104 l0 9 M74 104 l6 8" stroke="#f08c2a" strokeWidth="4" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="60" cy="68" rx="40" ry="38" fill="#ffd23f" />
      <ellipse cx="60" cy="82" rx="24" ry="18" fill="#ffe68a" />
      {/* wings */}
      <g className={mood === "happy" || mood === "proud" || mood === "cool" ? "mascot-flap" : ""}>
        <ellipse cx="20" cy="72" rx="9" ry="15" fill="#f5c21b" transform={mood === "helpless" ? "rotate(-35 20 72)" : "rotate(18 20 72)"} />
        <ellipse cx="100" cy="72" rx="9" ry="15" fill="#f5c21b" transform={mood === "helpless" ? "rotate(35 100 72)" : "rotate(-18 100 72)"} />
      </g>
      {/* tuft */}
      <path d="M54 32 q2 -14 8 -16 q-2 8 2 16 q4 -10 10 -10 q-6 6 -6 12" fill="#f5c21b" />
      {/* headband */}
      <path d="M24 46 q36 -16 72 0 l-2 9 q-34 -14 -68 0 z" fill="#15803d" />
      <text x="60" y="47" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="inherit">800</text>
      <Face mood={mood} />
    </svg>
  );
}

const MOOD_LABEL: Record<Mood, string> = {
  happy: "vui",
  proud: "tự hào",
  cool: "ngầu",
  neutral: "bình thường",
  confused: "ngơ ngác",
  sad: "buồn",
  helpless: "bất lực",
  sleepy: "buồn ngủ",
};

function Face({ mood }: { mood: Mood }) {
  const ink = "#1f2937";
  const beakOpen = <path d="M52 76 l8 -4 l8 4 l-8 8 z" fill="#f08c2a" />;
  const beakShut = <path d="M52 75 l8 -4 l8 4 l-8 5 z" fill="#f08c2a" />;
  const cheeks = (
    <>
      <circle cx="36" cy="74" r="5" fill="#ff9aa2" />
      <circle cx="84" cy="74" r="5" fill="#ff9aa2" />
    </>
  );
  const parts: Record<Mood, ReactNode> = {
    happy: (
      <>
        <path d="M38 64 q6 -8 12 0 M70 64 q6 -8 12 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
        {cheeks}
        {beakOpen}
      </>
    ),
    proud: (
      <>
        <path d="M38 63 q6 -6 12 0 M70 63 q6 -6 12 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M36 54 l12 3 M84 54 l-12 3" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        {cheeks}
        {beakOpen}
        <path d="M96 30 l3 6 l6 1 l-5 4 l1 6 l-5 -3 l-5 3 l1 -6 l-5 -4 l6 -1 z" fill="#f59e0b" className="mascot-twinkle" />
      </>
    ),
    cool: (
      <>
        <path d="M32 58 h24 v6 q0 8 -12 8 q-12 0 -12 -8 z M64 58 h24 v6 q0 8 -12 8 q-12 0 -12 -8 z" fill={ink} />
        <path d="M56 61 h8" stroke={ink} strokeWidth="3" />
        <path d="M36 61 l6 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        {beakShut}
        <path d="M66 86 q6 3 10 -2" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
    neutral: (
      <>
        <circle cx="44" cy="63" r="5" fill={ink} />
        <circle cx="76" cy="63" r="5" fill={ink} />
        <circle cx="46" cy="61" r="1.6" fill="#fff" />
        <circle cx="78" cy="61" r="1.6" fill="#fff" />
        {beakShut}
      </>
    ),
    confused: (
      <>
        <circle cx="44" cy="63" r="6.5" fill="#fff" stroke={ink} strokeWidth="2" />
        <circle cx="45" cy="64" r="3" fill={ink} />
        <circle cx="76" cy="64" r="3.5" fill={ink} />
        <path d="M68 52 l14 -4" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        {beakShut}
        <text x="100" y="34" fontSize="22" fontWeight="800" fill="#2563eb" fontFamily="inherit" className="mascot-twinkle">?</text>
      </>
    ),
    sad: (
      <>
        <circle cx="44" cy="65" r="4.5" fill={ink} />
        <circle cx="76" cy="65" r="4.5" fill={ink} />
        <path d="M36 56 l12 -4 M84 56 l-12 -4" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M40 72 q-3 6 0 9 q3 -3 0 -9" fill="#60a5fa" className="mascot-tear" />
        {beakShut}
      </>
    ),
    helpless: (
      <>
        <path d="M38 64 h12 M70 64 h12" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        <path d="M54 82 q6 -4 12 0" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M52 75 l8 -4 l8 4 l-8 4 z" fill="#f08c2a" />
        <path d="M90 44 q-4 7 0 10 q4 -3 0 -10" fill="#93c5fd" className="mascot-tear" />
      </>
    ),
    sleepy: (
      <>
        <path d="M38 65 q6 4 12 0 M70 65 q6 4 12 0" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {beakShut}
        <text x="92" y="36" fontSize="14" fontWeight="800" fill="#64748b" fontFamily="inherit" className="mascot-twinkle">z</text>
        <text x="102" y="24" fontSize="10" fontWeight="800" fill="#94a3b8" fontFamily="inherit" className="mascot-twinkle">z</text>
      </>
    ),
  };
  return <g>{parts[mood]}</g>;
}

/** Mascot with a speech bubble. Use for greetings, answer reactions and results. */
export function CoachBubble({
  mood,
  text,
  tip,
  size = 64,
  className = "",
  tone = "white",
}: {
  mood: Mood;
  text: ReactNode;
  tip?: string;
  size?: number;
  className?: string;
  tone?: "white" | "mint" | "cream" | "coral";
}) {
  const bg = { white: "bg-white border-slate-200", mint: "bg-p-mint border-brand-200", cream: "bg-p-cream border-amber-200", coral: "bg-p-coral border-rose-200" }[tone];
  return (
    <div className={`flex items-end gap-3 ${className}`} role="status" aria-live="polite">
      <Mascot mood={mood} size={size} />
      <div className={`bubble relative min-w-0 flex-1 rounded-2xl border px-4 py-2.5 text-sm ${bg}`}>
        <p className="font-semibold text-slate-800">{text}</p>
        {tip && (
          <p className="mt-1 text-[13px] text-slate-600">
            <span className="font-semibold text-brand-800">Mẹo: </span>
            {tip}
          </p>
        )}
      </div>
    </div>
  );
}
