const pad = (n: number) => String(n).padStart(2, "0");
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Consecutive days (ending today) with at least one mission item done.
 * If nothing is done yet today the streak is still alive: it counts back from yesterday.
 */
export function currentStreak(missionDone: Record<string, string[]>, today: Date): number {
  const has = (d: Date) => (missionDone[key(d)]?.length ?? 0) > 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!has(cursor)) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (has(cursor)) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}
