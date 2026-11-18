import type { VocabWord } from "../data/vocabulary";
import { shuffle, type Rng } from "./learn";
import type { SrsCard } from "./srs";

export const MATCH_PAIRS = 6;
export const MISMATCH_PENALTY_SEC = 0.5;

export type Tile = { key: string; pairId: string; kind: "word" | "meaning"; text: string };

/** Prefer words the learner has already met; top up with other words if fewer than `n`. */
export function pickMatchWords(
  srs: Record<string, SrsCard>,
  words: readonly VocabWord[],
  n = MATCH_PAIRS,
  rng: Rng = Math.random,
): VocabWord[] {
  const known = shuffle(words.filter((w) => srs[w.id]), rng);
  const others = shuffle(words.filter((w) => !srs[w.id]), rng);
  return [...known, ...others].slice(0, n);
}

export function buildMatchTiles(words: readonly VocabWord[], rng: Rng = Math.random): Tile[] {
  return shuffle(
    words.flatMap((w) => [
      { key: `${w.id}:w`, pairId: w.id, kind: "word" as const, text: w.word },
      { key: `${w.id}:m`, pairId: w.id, kind: "meaning" as const, text: w.meaningVi },
    ]),
    rng,
  );
}

export type PickResult = "select" | "deselect" | "match" | "mismatch";

/** Decide what picking `tile` does given the currently selected tile (if any). */
export function resolvePick(selected: Tile | null, tile: Tile): PickResult {
  if (!selected) return "select";
  if (selected.key === tile.key) return "deselect";
  return selected.pairId === tile.pairId && selected.kind !== tile.kind ? "match" : "mismatch";
}

export function finalSeconds(elapsedMs: number, mismatches: number): number {
  return Math.round((elapsedMs / 1000 + mismatches * MISMATCH_PENALTY_SEC) * 10) / 10;
}
