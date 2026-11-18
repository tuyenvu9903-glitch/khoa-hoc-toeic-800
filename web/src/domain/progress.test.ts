import { describe, expect, it } from "vitest";
import { vocabulary } from "../data/vocabulary";
import { packByDay } from "../data/dayPacks";
import { listeningUnlocked, miniTestUnlocked, part7BankUnlocked, unlockedGrammar, unlockedWords, wordSchedule, wordsForDay } from "./progress";

describe("word schedule", () => {
  it("gives every word exactly one day", () => {
    const all = wordSchedule.flat();
    expect(all).toHaveLength(vocabulary.length);
    expect(new Set(all).size).toBe(vocabulary.length);
    expect(wordSchedule).toHaveLength(56);
  });

  it("puts each day pack's words on that day", () => {
    for (const [day, pack] of packByDay) {
      const words = new Set(wordsForDay(day).map((w) => w.word));
      for (const [word] of pack.words) expect(words.has(word), `${day}: ${word}`).toBe(true);
    }
  });

  it("only opens words of days already reached", () => {
    expect(unlockedWords(1)).toHaveLength(wordsForDay(1).length);
    expect(unlockedWords(56)).toHaveLength(vocabulary.length);
  });
});

describe("unlocking", () => {
  it("opens parts and skills in plan order", () => {
    expect(listeningUnlocked(1, "2")).toBe(true);
    expect(listeningUnlocked(1, "3")).toBe(false);
    expect(listeningUnlocked(15, "3")).toBe(true);
    expect(unlockedGrammar(1).has("R.P5.wordform")).toBe(true);
    expect(unlockedGrammar(1).has("R.P5.passive")).toBe(false);
    expect(part7BankUnlocked(1)).toBe(false);
    expect(miniTestUnlocked(6)).toBe(false);
    expect(miniTestUnlocked(7)).toBe(true);
  });
});
