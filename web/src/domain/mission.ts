import { skillPriority, type SkillStat } from "./adaptive";
import { learningRatioForWeek } from "./program";

export type MissionKind =
  | "vocab"
  | "grammar"
  | "listening"
  | "reading"
  | "error_review"
  | "mini_test"
  | "mock"
  | "analysis";

export type MissionTemplate = {
  kind: MissionKind;
  title: string;
  itemCount: number;
  minutes: number;
  sortOrder: number;
};

export type Weakness = {
  skillCode: string;
  name: string;
  part: string | null;
  priority: number;
  accuracy: number;
};

export type MissionItem = {
  kind: MissionKind;
  title: string;
  itemCount: number;
  minutes: number;
  focus: string | null;
  reason: string | null;
};

export type DailyMission = {
  items: MissionItem[];
  totalMinutes: number;
  learningRatio: number;
  practiceRatio: number;
};

export type MissionInput = {
  week: number;
  day: number;
  templates: MissionTemplate[];
  weaknesses: Weakness[];
  openErrors: number;
  dueVocab: number;
  dailyMinutesTarget: number;
};

const LISTENING_PARTS = new Set(["1", "2", "3", "4"]);

/** Rank weaknesses by adaptive priority (highest first). */
export function rankWeaknesses(
  stats: (SkillStat & { name: string; part: string | null })[],
  limit = 10,
): Weakness[] {
  return stats
    .filter((s) => s.attempts > 0)
    .map((s) => ({
      skillCode: s.skillCode,
      name: s.name,
      part: s.part,
      priority: skillPriority(s),
      accuracy: s.accuracyEma,
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/**
 * Build today's mission from the week's templates and the learner's profile.
 *
 * - Listening/Reading items are tuned toward the learner's weakest part of that section.
 * - Error review is sized to open errors (skipped when none, capped at the template size).
 * - Vocabulary grows when many SRS cards are due.
 * - From week 6 the plan stops being even: top weaknesses get extra items.
 * - Sunday-style weekend gate (day 7 of a week) adds nothing here; the gate is shown by the roadmap.
 */
export function buildDailyMission(input: MissionInput): DailyMission {
  const { week, templates, weaknesses, openErrors, dueVocab } = input;
  const ordered = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
  const weakListening = weaknesses.find((w) => w.part !== null && LISTENING_PARTS.has(w.part));
  const weakReading = weaknesses.find(
    (w) => w.part !== null && !LISTENING_PARTS.has(w.part) && w.accuracy < 0.9,
  );
  const focusMore = week >= 6;

  const items: MissionItem[] = [];
  for (const t of ordered) {
    let itemCount = t.itemCount;
    let minutes = t.minutes;
    let focus: string | null = null;
    let reason: string | null = null;

    if (t.kind === "error_review") {
      if (openErrors === 0) continue;
      itemCount = Math.min(t.itemCount, openErrors);
      minutes = Math.max(5, Math.round((t.minutes * itemCount) / t.itemCount));
      reason = `${openErrors} câu sai chưa ôn`;
    } else if (t.kind === "vocab") {
      if (dueVocab > t.itemCount) {
        itemCount = Math.min(30, dueVocab);
        reason = `${dueVocab} từ đến hạn ôn`;
      }
    } else if (t.kind === "listening" && weakListening && weakListening.accuracy < 0.9) {
      focus = weakListening.name;
      reason = `Yếu: ${weakListening.name} (${Math.round(weakListening.accuracy * 100)}%)`;
      if (focusMore) itemCount += 10;
    } else if (t.kind === "reading" && weakReading) {
      focus = weakReading.name;
      reason = `Yếu: ${weakReading.name} (${Math.round(weakReading.accuracy * 100)}%)`;
      if (focusMore) itemCount += 10;
    }

    if (itemCount !== t.itemCount && t.kind !== "error_review") {
      minutes = Math.round((t.minutes * itemCount) / t.itemCount);
    }
    items.push({ kind: t.kind, title: t.title, itemCount, minutes, focus, reason });
  }

  const totalMinutes = items.reduce((sum, i) => sum + i.minutes, 0);
  const learningRatio = learningRatioForWeek(week);
  return { items, totalMinutes, learningRatio, practiceRatio: 1 - learningRatio };
}
