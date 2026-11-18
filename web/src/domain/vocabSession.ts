import type { VocabWord } from "../data/vocabulary";
import { isDue, isMature, sameLocalDay, type SrsCard } from "./srs";

export const DEFAULT_SESSION_LIMIT = 25;
export const DEFAULT_NEW_PER_DAY = 15;

export type VocabCounts = {
  total: number;
  learned: number;
  mature: number;
  due: number;
  newToday: number;
  newAvailable: number;
};

export function vocabCounts(
  srs: Record<string, SrsCard>,
  words: VocabWord[],
  now: Date,
  newPerDay = DEFAULT_NEW_PER_DAY,
): VocabCounts {
  const known = words.filter((w) => srs[w.id]);
  const cards = known.map((w) => srs[w.id]!);
  const newToday = cards.filter((c) => sameLocalDay(c.introducedAt, now)).length;
  const unseen = words.length - known.length;
  return {
    total: words.length,
    learned: known.length,
    mature: cards.filter(isMature).length,
    due: cards.filter((c) => isDue(c, now)).length,
    newToday,
    newAvailable: Math.min(unseen, Math.max(0, newPerDay - newToday)),
  };
}

/** Unseen words, interleaving topics so a session is never one topic only. */
export function nextNewWords(srs: Record<string, SrsCard>, words: VocabWord[]): VocabWord[] {
  const byTopic = new Map<string, VocabWord[]>();
  for (const w of words) {
    if (srs[w.id]) continue;
    const list = byTopic.get(w.topic) ?? [];
    list.push(w);
    byTopic.set(w.topic, list);
  }
  const lists = [...byTopic.values()];
  const out: VocabWord[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) {
    for (const l of lists) {
      const w = l[i];
      if (w) out.push(w);
    }
  }
  return out;
}

/**
 * Today's session: due reviews first (oldest due first), then new words,
 * capped by `limit` and by the daily new-word budget.
 */
export function buildVocabSession(
  srs: Record<string, SrsCard>,
  words: VocabWord[],
  now: Date,
  opts: { limit?: number; newPerDay?: number } = {},
): string[] {
  const limit = opts.limit ?? DEFAULT_SESSION_LIMIT;
  const counts = vocabCounts(srs, words, now, opts.newPerDay);
  const due = words
    .filter((w) => srs[w.id] && isDue(srs[w.id]!, now))
    .sort((a, b) => Date.parse(srs[a.id]!.nextReviewAt) - Date.parse(srs[b.id]!.nextReviewAt))
    .slice(0, limit);
  const room = Math.max(0, limit - due.length);
  const fresh = nextNewWords(srs, words).slice(0, Math.min(room, counts.newAvailable));
  return [...due, ...fresh].map((w) => w.id);
}
