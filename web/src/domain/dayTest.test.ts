import { describe, expect, it } from "vitest";
import { answerText } from "./learn";
import { buildDayTest } from "./dayTest";
import { unlockedWords, wordsForDay } from "./progress";
import { vocabById } from "../data/vocabulary";

describe("buildDayTest", () => {
  it("asks every word of the day once, with the right answer among 4 options", () => {
    const words = wordsForDay(1);
    const qs = buildDayTest(words, unlockedWords(3));
    expect(qs.map((q) => q.wordId).sort()).toEqual(words.map((w) => w.id).sort());
    for (const q of qs) {
      const w = vocabById.get(q.wordId)!;
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.correctIndex]).toBe(answerText(w, q.dir));
      expect(q.prompt).toBe(q.dir === "en2vi" ? w.word : w.meaningVi);
    }
  });
});
