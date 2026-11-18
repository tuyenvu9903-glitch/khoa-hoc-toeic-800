// Day-by-day progression. A day must be finished before the next one opens, and the next day
// opens on a later calendar date, so the course really is one lesson per day.
import { dailyPlan, planForDay, type DayPlan } from "../data/dailyPlan";
import { packByDay, type DayPack } from "../data/dayPacks";
import { vocabulary, type VocabWord } from "../data/vocabulary";
import type { SrsCard } from "./srs";

export const PROGRAM_DAYS = 56;

export type Progress = {
  /** The day the learner is on (1..56). */
  day: number;
  /** Local date (YYYY-MM-DD) on which the current day was opened. */
  dayStartedOn: string | null;
  /** Mission kinds finished, keyed by program day. Vocabulary is computed from the SRS cards instead. */
  done: Record<string, string[]>;
};

export const initialProgress = (): Progress => ({ day: 1, dayStartedOn: null, done: {} });

export type MissionKindTracked = "vocab" | "grammar" | "listening" | "reading" | "mini_test";

// ---------------------------------------------------------------- vocabulary schedule

/**
 * Split the whole word list over the 56 days. A day with a pack gets its pack's words; the
 * original topic words are spread over the days whose topic matches, so every word has a day.
 */
export function buildWordSchedule(words: readonly VocabWord[] = vocabulary, days = PROGRAM_DAYS): string[][] {
  const idByWord = new Map(words.map((w) => [w.word, w.id]));
  const packIds = new Set<string>();
  const schedule: string[][] = Array.from({ length: days }, (_, i) => {
    const pack = packByDay.get(i + 1);
    const ids = (pack?.words ?? []).map(([word]) => idByWord.get(word)).filter((id): id is string => !!id);
    ids.forEach((id) => packIds.add(id));
    return ids;
  });

  const queues = new Map<string, string[]>();
  for (const w of words) {
    if (packIds.has(w.id)) continue;
    const q = queues.get(w.topic) ?? [];
    q.push(w.id);
    queues.set(w.topic, q);
  }
  const legacyTotal = [...queues.values()].reduce((n, q) => n + q.length, 0);
  const perDay = Math.ceil(legacyTotal / days);

  for (let d = 0; d < days; d++) {
    const topic = packByDay.get(d + 1)?.topic ?? planForDay(d + 1).vocabTopic;
    let need = perDay;
    const own = queues.get(topic) ?? [];
    while (need > 0 && own.length > 0) {
      schedule[d]!.push(own.shift()!);
      need--;
    }
    while (need > 0) {
      const biggest = [...queues.values()].sort((a, b) => b.length - a.length)[0];
      if (!biggest || biggest.length === 0) break;
      schedule[d]!.push(biggest.shift()!);
      need--;
    }
  }
  // Anything left goes to the lightest days.
  for (const q of queues.values()) {
    while (q.length > 0) {
      const lightest = schedule.reduce((best, s, i) => (s.length < schedule[best]!.length ? i : best), 0);
      schedule[lightest]!.push(q.shift()!);
    }
  }
  return schedule;
}

export const wordSchedule = buildWordSchedule();

const wordById = new Map(vocabulary.map((w) => [w.id, w]));

export function wordsForDay(day: number): VocabWord[] {
  return (wordSchedule[day - 1] ?? []).map((id) => wordById.get(id)!).filter(Boolean);
}

/** Words of every day up to and including `day`. */
export function unlockedWords(day: number): VocabWord[] {
  return wordSchedule.slice(0, Math.max(0, day)).flatMap((ids) => ids.map((id) => wordById.get(id)!));
}

export function dayVocabDone(srs: Record<string, SrsCard>, day: number): boolean {
  return wordsForDay(day).every((w) => srs[w.id]);
}

// ---------------------------------------------------------------- completion

export function requiredKinds(plan: DayPlan): MissionKindTracked[] {
  const kinds: MissionKindTracked[] = ["vocab", "grammar", "listening", "reading"];
  if (plan.test) kinds.push("mini_test");
  return kinds;
}

export function isKindDone(progress: Progress, srs: Record<string, SrsCard>, day: number, kind: string): boolean {
  if (kind === "vocab") return dayVocabDone(srs, day);
  return (progress.done[String(day)] ?? []).includes(kind);
}

export function remainingKinds(progress: Progress, srs: Record<string, SrsCard>, day = progress.day): MissionKindTracked[] {
  return requiredKinds(planForDay(day)).filter((k) => !isKindDone(progress, srs, day, k));
}

export function isDayComplete(progress: Progress, srs: Record<string, SrsCard>, day = progress.day): boolean {
  return remainingKinds(progress, srs, day).length === 0;
}

export function markKindDone(progress: Progress, kind: string): Progress {
  const key = String(progress.day);
  const current = progress.done[key] ?? [];
  return current.includes(kind) ? progress : { ...progress, done: { ...progress.done, [key]: [...current, kind] } };
}

/**
 * Open today's day if needed, and move to the next day when the current one is complete and it
 * was opened on an earlier date. Returns the same object when nothing changes.
 */
export function advanceProgress(progress: Progress, srs: Record<string, SrsCard>, today: string): Progress {
  if (progress.dayStartedOn === null) return { ...progress, dayStartedOn: today };
  if (progress.day >= PROGRAM_DAYS) return progress;
  if (today > progress.dayStartedOn && isDayComplete(progress, srs)) {
    return { ...progress, day: progress.day + 1, dayStartedOn: today };
  }
  return progress;
}

export function programFinished(progress: Progress, srs: Record<string, SrsCard>): boolean {
  return progress.day >= PROGRAM_DAYS && isDayComplete(progress, srs);
}

// ---------------------------------------------------------------- what is open

const plansUpTo = (day: number) => dailyPlan.filter((p) => p.day <= day);
const packsUpTo = (day: number): DayPack[] => plansUpTo(day).flatMap((p) => packByDay.get(p.day) ?? []);

/** First day on which a listening part is studied (null if never). */
export function firstListeningDay(part: "2" | "3" | "4"): number | null {
  return dailyPlan.find((p) => p.listeningPart === part)?.day ?? null;
}

export function listeningUnlocked(day: number, part: "2" | "3" | "4"): boolean {
  const first = firstListeningDay(part);
  return first !== null && first <= day;
}

/** Part 5 skills studied so far (from the plan and from the packs' questions). */
export function unlockedGrammar(day: number): Set<string> {
  const skills = new Set(plansUpTo(day).map((p) => p.grammar));
  for (const pack of packsUpTo(day)) pack.part5.forEach((i) => skills.add(i.skill));
  return skills;
}

export function firstGrammarDay(skill: string): number | null {
  return dailyPlan.find((p) => p.grammar === skill)?.day ?? null;
}

/** The general Part 7 bank opens with the first Part 7 day; packs bring their own passage earlier. */
export function part7BankUnlocked(day: number): boolean {
  const first = dailyPlan.find((p) => p.readingPart === "7")?.day;
  return first !== undefined && first <= day;
}

export function firstTestDay(): number {
  return dailyPlan.find((p) => p.test)?.day ?? PROGRAM_DAYS;
}

export function miniTestUnlocked(day: number): boolean {
  return firstTestDay() <= day;
}

/** Listening parts studied so far, for building a mini test from known material only. */
export function studiedListeningParts(day: number): ("2" | "3" | "4")[] {
  return (["2", "3", "4"] as const).filter((p) => listeningUnlocked(day, p));
}
