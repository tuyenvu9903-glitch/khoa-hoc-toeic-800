// What the mascot says when the learner opens the app, based on their recent behaviour.
import type { VoiceContext } from "./lines";

const pad = (n: number) => String(n).padStart(2, "0");
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Whole days since the last day with any completed step before today (null if never). */
export function daysAway(missionDone: Record<string, string[]>, now: Date): number | null {
  const today = key(now);
  const last = Object.entries(missionDone)
    .filter(([d, items]) => d < today && items.length > 0)
    .map(([d]) => d)
    .sort()
    .pop();
  if (!last) return null;
  const a = new Date(`${last}T12:00:00`).getTime();
  const b = new Date(`${today}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function greetingContext(input: {
  now: Date;
  day: number;
  streak: number;
  stepsDone: number;
  stepsTotal: number;
  missionDone: Record<string, string[]>;
}): VoiceContext {
  const { now, day, streak, stepsDone, stepsTotal, missionDone } = input;
  if (stepsTotal > 0 && stepsDone >= stepsTotal) return "day_done";
  const away = daysAway(missionDone, now);
  if (stepsDone === 0 && away !== null && away >= 3) return "comeback";
  if (streak === 3) return "streak_3";
  if (streak === 7) return "streak_7";
  if (streak === 30) return "streak_30";
  if (streak >= 10 && streak % 5 === 0) return "streak_more";
  if (day === 1 && stepsDone === 0 && away === null) return "first_day";
  if (stepsDone > 0) return "start";
  const h = now.getHours();
  if (h >= 5 && h < 10) return "login_morning";
  if (h >= 22 || h < 4) return "login_night";
  return "login";
}
