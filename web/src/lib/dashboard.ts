import { days, missionTemplates, skillRows, weeks } from "../data/curriculum";
import { buildDailyMission, rankWeaknesses, type DailyMission, type Weakness } from "../domain/mission";
import { programFinished, unlockedWords } from "../domain/progress";
import { vocabCounts, type VocabCounts } from "../domain/vocabSession";
import { summarizeScore, type ScoreSummary } from "../domain/score";
import type { AppState, Profile } from "./state";

export type DashboardView = {
  day: number;
  week: number;
  finished: boolean;
  weekTitle: string | null;
  focus: string | null;
  weekendGate: string | null;
  placementDone: boolean;
  mission: DailyMission;
  score: ScoreSummary;
  weaknesses: Weakness[];
  openErrors: number;
  vocab: VocabCounts;
};

const skillByCode = new Map(skillRows.map((s) => [s.code, s]));

export function buildDashboard(state: AppState, profile: Profile, now: Date = new Date()): DashboardView {
  const day = state.progress.day;
  const position = { day, week: Math.ceil(day / 7), finished: programFinished(state.progress, state.srs) };
  const week = weeks.find((w) => w.weekNumber === position.week);
  const dayDef = days.find((d) => d.dayNumber === position.day);

  const weaknesses = rankWeaknesses(
    Object.entries(state.skillStats).flatMap(([skillCode, s]) => {
      const def = skillByCode.get(skillCode);
      if (!def) return [];
      return [
        {
          skillCode,
          name: def.name,
          part: def.part ?? null,
          attempts: s.attempts,
          accuracyEma: s.accuracyEma,
          avgResponseMs: s.avgResponseMs,
          estimatedTimeMs: 30_000,
          importance: def.importance,
          daysSincePractice: s.lastPracticedAt
            ? Math.floor((now.getTime() - Date.parse(s.lastPracticedAt)) / 86_400_000)
            : 14,
          mastered: s.mastered,
        },
      ];
    }),
  );

  const openErrors = state.errors.filter((e) => e.resolvedAt === null).length;
  const vocab = vocabCounts(state.srs, unlockedWords(day), now, Infinity);
  const mission = buildDailyMission({
    week: position.week,
    day: position.day,
    templates: missionTemplates,
    weaknesses,
    openErrors,
    dueVocab: vocab.due,
    dailyMinutesTarget: profile.dailyMinutesTarget,
  });

  const latest = [...state.scores].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
  const score = summarizeScore(
    latest?.listening ?? profile.estimatedListening,
    latest?.reading ?? profile.estimatedReading,
    profile.targetScore,
  );

  return {
    day: position.day,
    week: position.week,
    finished: position.finished,
    weekTitle: week?.title ?? null,
    focus: dayDef?.focus ?? null,
    weekendGate: week?.weekendGate ?? null,
    placementDone: profile.placementCompletedAt !== null,
    mission,
    score,
    weaknesses,
    openErrors,
    vocab,
  };
}

