const DAY_MS = 86_400_000;
export const PROGRAM_DAYS = 56;

export type ProgramPosition = {
  day: number;
  week: number;
  finished: boolean;
};

/** Day 1 is the start date. Clamped to 1..56; `finished` once past day 56. */
export function programPosition(start: Date | null, now: Date = new Date()): ProgramPosition {
  if (!start) return { day: 1, week: 1, finished: false };
  const elapsed = Math.floor((now.getTime() - start.getTime()) / DAY_MS);
  const raw = Math.max(elapsed, 0) + 1;
  const day = Math.min(raw, PROGRAM_DAYS);
  return { day, week: Math.ceil(day / 7), finished: raw > PROGRAM_DAYS };
}

/** Learning share of the day: 30% in weeks 1-4, 20% from week 5. */
export function learningRatioForWeek(week: number): number {
  return week >= 5 ? 0.2 : 0.3;
}
