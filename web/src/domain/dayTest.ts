// A day's vocabulary test: every word of that day once, as a 4-option question in a random
// direction (English → Vietnamese or Vietnamese → English).
import type { VocabWord } from "../data/vocabulary";
import { makeChoices, shuffle, type Direction, type Rng } from "./learn";

export type DayTestQuestion = {
  wordId: string;
  dir: Direction;
  /** What is shown: the English word (en2vi) or the Vietnamese meaning (vi2en). */
  prompt: string;
  options: string[];
  correctIndex: number;
};

export function buildDayTest(words: readonly VocabWord[], pool: readonly VocabWord[], rng: Rng = Math.random): DayTestQuestion[] {
  return shuffle(words, rng).map((w) => {
    const dir: Direction = rng() < 0.5 ? "en2vi" : "vi2en";
    const { options, correctIndex } = makeChoices(w, pool, dir, rng);
    return { wordId: w.id, dir, prompt: dir === "en2vi" ? w.word : w.meaningVi, options, correctIndex };
  });
}
