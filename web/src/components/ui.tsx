import type { ReactNode } from "react";

/** Circular progress with a gradient stroke. `value` is 0..1. */
export function Ring({
  value,
  size = 132,
  stroke = 12,
  id,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  id: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d63f2" />
            <stop offset="1" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8e8f8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${tone}`} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-2xl font-bold leading-tight">
          {value}
          {hint && <span className="text-sm font-medium text-slate-400">{hint}</span>}
        </dd>
      </div>
    </div>
  );
}
