import { describe, expect, it } from "vitest";
import { vocabById, vocabulary } from "../data/vocabulary";
import {
  answerLearn,
  blankExample,
  gradeFromMistakes,
  initLearn,
  learnProgress,
  makeChoices,
  matchTyped,
  shuffle,
} from "./learn";

/** Deterministic rng (mulberry32). */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const w = (id: string) => vocabById.get(id)!;

describe("shuffle", () => {
  it("keeps the same items and does not mutate the input", () => {
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffle(src, seeded(1));
    expect([...out].sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("makeChoices", () => {
  it("gives 4 unique options containing exactly the right answer at correctIndex", () => {
    for (const dir of ["en2vi", "vi2en"] as const) {
      for (let seed = 1; seed <= 25; seed++) {
        const target = vocabulary[seed * 3]!;
        const { options, correctIndex } = makeChoices(target, vocabulary, dir, seeded(seed));
        expect(options).toHaveLength(4);
        expect(new Set(options).size).toBe(4);
        expect(options[correctIndex]).toBe(dir === "en2vi" ? target.meaningVi : target.word);
      }
    }
  });
  it("copes with a tiny pool", () => {
    const { options } = makeChoices(w("agenda"), [w("agenda"), w("attend")], "en2vi", seeded(3));
    expect(options).toHaveLength(2);
  });
});

describe("matchTyped", () => {
  it("is case/space insensitive, flags one-typo as close, rejects the rest", () => {
    expect(matchTyped("  Agenda ", "agenda")).toBe("exact");
    expect(matchTyped("check  out", "check out")).toBe("exact");
    expect(matchTyped("agendaa", "agenda")).toBe("close");
    expect(matchTyped("agnda", "agenda")).toBe("close");
    expect(matchTyped("agent", "agenda")).toBe("wrong");
    expect(matchTyped("", "agenda")).toBe("wrong");
  });
  it("never calls a short word close (cat vs car)", () => {
    expect(matchTyped("bil", "bill")).toBe("wrong");
  });
});

describe("blankExample", () => {
  it("blanks the exact word", () => {
    expect(blankExample("The agenda was sent to all participants.", "agenda")).toEqual({
      text: "The _____ was sent to all participants.",
      blanked: true,
    });
  });
  it("blanks an inflected form", () => {
    const r = blankExample("The meeting was postponed until Monday.", "postpone");
    expect(r.blanked).toBe(true);
    expect(r.text).toBe("The meeting was _____ until Monday.");
  });
  it("blanks every vocabulary example so the answer is not leaked", () => {
    for (const v of vocabulary) {
      const r = blankExample(v.example, v.word);
      expect(r.blanked, v.id).toBe(true);
    }
  });
});

describe("learn flow", () => {
  it("takes a word through three correct stages to done", () => {
    let s = initLearn(["agenda"]);
    s = answerLearn(s, true);
    s = answerLearn(s, true);
    expect(s.done).toHaveLength(0);
    s = answerLearn(s, true);
    expect(s.done).toEqual([{ id: "agenda", mistakes: 0 }]);
    expect(s.queue).toHaveLength(0);
    expect(learnProgress(s)).toBe(100);
  });

  it("brings a missed word back soon, without advancing its stage", () => {
    let s = initLearn(["a", "b", "c", "d", "e"]);
    s = answerLearn(s, false);
    expect(s.queue.map((i) => i.id)).toEqual(["b", "c", "a", "d", "e"]);
    expect(s.queue[2]).toMatchObject({ stage: 0, mistakes: 1 });
  });

  it("finishes every word eventually and reports mistakes per word", () => {
    let s = initLearn(["a", "b", "c"]);
    let steps = 0;
    while (s.queue.length > 0 && steps++ < 100) {
      s = answerLearn(s, !(s.queue[0]!.id === "b" && s.queue[0]!.mistakes < 2));
    }
    expect(s.done.map((d) => d.id).sort()).toEqual(["a", "b", "c"]);
    expect(s.done.find((d) => d.id === "b")?.mistakes).toBe(2);
    expect(s.done.find((d) => d.id === "a")?.mistakes).toBe(0);
  });

  it("maps mistakes to review grades and ignores answers on an empty queue", () => {
    expect([0, 1, 2, 5].map(gradeFromMistakes)).toEqual(["good", "hard", "again", "again"]);
    const empty = initLearn([]);
    expect(answerLearn(empty, true)).toBe(empty);
    expect(learnProgress(empty)).toBe(100);
  });

  it("progress rises monotonically with correct answers", () => {
    let s = initLearn(["a", "b"]);
    let last = -1;
    while (s.queue.length > 0) {
      s = answerLearn(s, true);
      const p = learnProgress(s);
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
    expect(last).toBe(100);
  });
});

import { shuffleOptions } from "./learn";

describe("shuffleOptions", () => {
  it("keeps the same options and the answer pointing at the same text", () => {
    const item = { options: ["right", "b", "c", "d"] as const, answer: 0, id: "x" };
    for (let s = 1; s < 20; s++) {
      const out = shuffleOptions(item, seeded(s));
      expect([...out.options].sort()).toEqual([...item.options].sort());
      expect(out.options[out.answer]).toBe("right");
      expect(out.id).toBe("x");
    }
  });
});

import { explainWithOptionText } from "./learn";

describe("explanations follow shuffled options", () => {
  it("moves option letters with the options", () => {
    const item = { options: ["right", "b", "c", "d"], answer: 0, explainVi: "(A) đúng; (C) là bẫy." };
    for (let s = 1; s < 20; s++) {
      const out = shuffleOptions(item, seeded(s));
      const a = "ABCD"[out.options.indexOf("right")];
      const c = "ABCD"[out.options.indexOf("c")];
      expect(out.explainVi).toBe(`(${a}) đúng; (${c}) là bẫy.`);
    }
  });
  it("can spell out the option instead of the letter", () => {
    expect(explainWithOptionText("(B) lặp từ.", ["x", "repeat"])).toBe("“repeat” lặp từ.");
  });
});
