export type ScoreSummary = {
  current: number;
  target: number;
  listening: number;
  reading: number;
  nextTarget: number;
  gapToTarget: number;
};

export function summarizeScore(listening: number, reading: number, target: number): ScoreSummary {
  const current = listening + reading;
  const nextTarget = Math.min(Math.floor(current / 100) * 100 + 100, target);
  return {
    current,
    target,
    listening,
    reading,
    nextTarget,
    gapToTarget: Math.max(target - current, 0),
  };
}
