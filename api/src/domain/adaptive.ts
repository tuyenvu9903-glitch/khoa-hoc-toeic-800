export type SkillStat = {
  skillCode: string;
  attempts: number;
  accuracyEma: number;
  avgResponseMs: number;
  estimatedTimeMs: number;
  importance: number;
  daysSincePractice: number;
  mastered: boolean;
};

export function isMastered(stat: SkillStat): boolean {
  return (
    stat.attempts >= 20 &&
    stat.accuracyEma >= 0.9 &&
    stat.avgResponseMs <= stat.estimatedTimeMs * 1.2
  );
}

export function skillPriority(stat: SkillStat): number {
  const recency = 1 + Math.min(stat.daysSincePractice, 14) / 14;
  const slow =
    stat.avgResponseMs > stat.estimatedTimeMs * 1.2 && stat.attempts >= 8 ? 1.35 : 1;
  const masterPenalty = stat.mastered || isMastered(stat) ? 0.15 : 1;
  return (1 - stat.accuracyEma) * stat.importance * recency * slow * masterPenalty;
}

export function nextBand(total: number): 500 | 600 | 700 | 800 {
  if (total < 500) return 500;
  if (total < 600) return 600;
  if (total < 700) return 700;
  return 800;
}
