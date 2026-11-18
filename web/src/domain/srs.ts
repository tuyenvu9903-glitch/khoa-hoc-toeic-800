// Spaced repetition: a simplified SM-2 with four grades.
export type Grade = "again" | "hard" | "good" | "easy";

export type SrsCard = {
  ease: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  introducedAt: string;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  lastGrade: Grade | null;
};

export const MIN_EASE = 1.3;
export const AGAIN_DELAY_MIN = 10;
export const MATURE_DAYS = 21;
/** Intervals grow geometrically; cap them so dates stay valid and cards come back at least yearly. */
export const MAX_INTERVAL_DAYS = 365;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(d: Date, days: number): Date {
  const x = startOfLocalDay(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function newCard(now: Date): SrsCard {
  return {
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    introducedAt: now.toISOString(),
    nextReviewAt: now.toISOString(),
    lastReviewedAt: null,
    lastGrade: null,
  };
}

/** Next state of a card after grading. Reviews are due from the start of their due day. */
export function reviewCard(card: SrsCard | undefined, grade: Grade, now: Date): SrsCard {
  const c = card ?? newCard(now);
  const base = { introducedAt: c.introducedAt, lastReviewedAt: now.toISOString(), lastGrade: grade };

  if (grade === "again") {
    return {
      ...base,
      ease: Math.max(MIN_EASE, c.ease - 0.2),
      intervalDays: 0,
      repetitions: 0,
      lapses: c.lapses + 1,
      nextReviewAt: new Date(now.getTime() + AGAIN_DELAY_MIN * 60_000).toISOString(),
    };
  }

  let ease = c.ease;
  let days: number;
  if (grade === "hard") {
    ease = Math.max(MIN_EASE, ease - 0.15);
    days = c.repetitions === 0 ? 1 : Math.max(c.intervalDays + 1, Math.round(c.intervalDays * 1.2));
  } else if (grade === "good") {
    days = c.repetitions === 0 ? 1 : c.repetitions === 1 ? 3 : Math.round(c.intervalDays * ease);
  } else {
    ease = Math.min(3.5, ease + 0.15);
    days = c.repetitions === 0 ? 3 : c.repetitions === 1 ? 6 : Math.round(c.intervalDays * ease * 1.3);
  }
  days = Math.min(MAX_INTERVAL_DAYS, Math.max(1, days));
  return {
    ...base,
    ease,
    intervalDays: days,
    repetitions: c.repetitions + 1,
    lapses: c.lapses,
    nextReviewAt: addLocalDays(now, days).toISOString(),
  };
}

export function isDue(card: SrsCard, now: Date): boolean {
  return Date.parse(card.nextReviewAt) <= now.getTime();
}

export function isMature(card: SrsCard): boolean {
  return card.intervalDays >= MATURE_DAYS;
}

export function sameLocalDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return startOfLocalDay(d).getTime() === startOfLocalDay(now).getTime();
}

/** Human label of what a grade would schedule, for the buttons. */
export function intervalLabel(card: SrsCard | undefined, grade: Grade, now: Date): string {
  const next = reviewCard(card, grade, now);
  return next.intervalDays === 0 ? `${AGAIN_DELAY_MIN} phút` : `${next.intervalDays} ngày`;
}
