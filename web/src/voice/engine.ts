// Message engine: picks a line for a situation, honouring the humour setting and avoiding repeats.
import { DEFAULT_MOOD, LINES, type Mood, type VoiceContext } from "./lines";

export type HumorLevel = "off" | "chill" | "normal" | "max";

export const HUMOR_OPTIONS: { value: HumorLevel; label: string; hint: string }[] = [
  { value: "off", label: "Nghiêm túc", hint: "Thông báo ngắn gọn, trung tính." },
  { value: "chill", label: "Nhẹ nhàng", hint: "Thân thiện, đùa rất nhẹ." },
  { value: "normal", label: "Vừa đủ", hint: "Gen Z, cà khịa đáng yêu. Mặc định." },
  { value: "max", label: "Lầy hết cỡ", hint: "Nhây tối đa, vẫn tử tế." },
];

const MAX_SPICE: Record<HumorLevel, number> = { off: 0, chill: 1, normal: 2, max: 3 };

export type Line = { id: string; text: string; mood: Mood; context: VoiceContext };
export type Vars = Record<string, string | number | undefined>;

/** Ids of recently shown lines per context, so the same line does not come back right away. */
export type History = Record<string, string[]>;

const HISTORY_KEY = "toeic800.voice.recent";

function loadHistory(): History {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as History) : {};
  } catch {
    return {};
  }
}

let history: History = loadHistory();

function saveHistory(): void {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage unavailable: repeats are only avoided in memory.
  }
}

export function fill(text: string, vars: Vars = {}): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : String(vars[k])));
}

/** Lines allowed at this humour level. "off" uses only neutral lines; others prefer playful ones. */
export function poolFor(context: VoiceContext, humor: HumorLevel) {
  const rows = LINES[context].map((r, i) => ({ id: `${context}#${i}`, spice: r[0], text: r[1], mood: r[2] ?? DEFAULT_MOOD[context] }));
  const max = MAX_SPICE[humor];
  const pool = max === 0 ? rows.filter((r) => r.spice === 0) : rows.filter((r) => r.spice >= 1 && r.spice <= max);
  return pool.length > 0 ? pool : rows.filter((r) => r.spice === 0);
}

/**
 * Pick a line. Pure when `hist` and `rand` are passed (tests); by default it uses the session
 * history so a line is not repeated until most of the pool has been seen.
 */
export function pickLine(
  context: VoiceContext,
  opts: { humor: HumorLevel; vars?: Vars; hist?: History; rand?: () => number },
): Line {
  const hist = opts.hist ?? history;
  const rand = opts.rand ?? Math.random;
  const pool = poolFor(context, opts.humor);
  const recent = hist[context] ?? [];
  const fresh = pool.filter((r) => !recent.includes(r.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const row = candidates[Math.floor(rand() * candidates.length)] ?? pool[0]!;
  const keep = Math.max(0, pool.length - 1);
  hist[context] = keep === 0 ? [] : [...recent.filter((id) => id !== row.id), row.id].slice(-keep);
  if (!opts.hist) saveHistory();
  return { id: row.id, text: fill(row.text, opts.vars), mood: row.mood, context };
}
