import { describe, expect, it } from "vitest";
import { TOPIC_LABEL, vocabulary, vocabById } from "../data/vocabulary";
import { reviewCard } from "./srs";
import { buildVocabSession, nextNewWords, vocabCounts } from "./vocabSession";

const now = new Date(2026, 2, 10, 9, 0);
const later = new Date(2026, 2, 12, 9, 0);

describe("vocabulary data", () => {
  it("has unique ids and no empty fields", () => {
    expect(new Set(vocabulary.map((w) => w.id)).size).toBe(vocabulary.length);
    for (const w of vocabulary) {
      expect(w.word.trim(), w.id).not.toBe("");
      expect(w.meaningVi.trim(), w.id).not.toBe("");
      expect(w.meaningEn.trim(), w.id).not.toBe("");
      expect(w.example.trim(), w.id).not.toBe("");
      expect(w.topic in TOPIC_LABEL, w.id).toBe(true);
    }
  });
  it("gives every topic that has words a useful number of them", () => {
    expect(vocabulary.length).toBeGreaterThanOrEqual(120);
    for (const topic of Object.keys(TOPIC_LABEL)) {
      const n = vocabulary.filter((w) => w.topic === topic).length;
      // A topic may stay empty until its day packs are written.
      if (n > 0) expect(n, topic).toBeGreaterThanOrEqual(10);
    }
  });
  it("includes the paraphrase pairs from the course spec", () => {
    const pair = (w: string) => vocabById.get(w)?.paraphrase;
    expect(pair("purchase")).toBe("buy");
    expect(pair("postpone")).toBe("delay");
    expect(pair("approximately")).toBe("about");
    expect(pair("participate")).toBe("take part in");
  });
  it("each example sentence contains its word (or a form of it)", () => {
    for (const w of vocabulary) {
      const stem = w.word.toLowerCase().split(" ")[0]!.slice(0, Math.max(4, w.word.length - 3));
      expect(w.example.toLowerCase(), w.id).toContain(stem.slice(0, 4));
    }
  });
});

describe("vocabCounts", () => {
  it("fresh learner: nothing due, 15 new words allowed per day", () => {
    expect(vocabCounts({}, vocabulary, now)).toMatchObject({
      learned: 0,
      due: 0,
      newToday: 0,
      newAvailable: 15,
    });
  });
  it("counts today's introductions against the daily new-word budget", () => {
    const srs: Record<string, ReturnType<typeof reviewCard>> = {};
    for (const w of vocabulary.slice(0, 15)) srs[w.id] = reviewCard(undefined, "good", now);
    const c = vocabCounts(srs, vocabulary, now);
    expect(c).toMatchObject({ learned: 15, newToday: 15, newAvailable: 0, due: 0 });
    expect(vocabCounts(srs, vocabulary, later)).toMatchObject({ newToday: 0, newAvailable: 15, due: 15 });
  });
});

describe("buildVocabSession", () => {
  it("starts a new learner with 15 interleaved-topic new words", () => {
    const ids = buildVocabSession({}, vocabulary, now);
    expect(ids).toHaveLength(15);
    const topics = new Set(ids.map((id) => vocabById.get(id)!.topic));
    expect(topics.size).toBeGreaterThanOrEqual(8);
  });

  it("puts due reviews before new words and respects the limit", () => {
    const srs: Record<string, ReturnType<typeof reviewCard>> = {};
    const first = vocabulary.slice(0, 10);
    for (const w of first) srs[w.id] = reviewCard(undefined, "good", now);
    const ids = buildVocabSession(srs, vocabulary, later, { limit: 12 });
    expect(ids).toHaveLength(12);
    expect(ids.slice(0, 10).sort()).toEqual(first.map((w) => w.id).sort());
    expect(ids.slice(10).every((id) => !srs[id])).toBe(true);
  });

  it("returns nothing when everything is learned and not due", () => {
    const srs: Record<string, ReturnType<typeof reviewCard>> = {};
    for (const w of vocabulary) srs[w.id] = reviewCard(undefined, "easy", now);
    expect(buildVocabSession(srs, vocabulary, now)).toEqual([]);
  });

  it("never offers a word twice and never an already-seen word as new", () => {
    const srs = { [vocabulary[0]!.id]: reviewCard(undefined, "good", now) };
    expect(nextNewWords(srs, vocabulary).some((w) => w.id === vocabulary[0]!.id)).toBe(false);
    const ids = buildVocabSession(srs, vocabulary, later);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
