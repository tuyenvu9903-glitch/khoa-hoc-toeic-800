import { describe, expect, it } from "vitest";
import { part2Items, part3Sets } from "../data/listening";
import { part5Items, part7Sets } from "../data/reading";
import {
  answerWindowSeconds,
  buildPaper,
  estimateScaled,
  groupFromPart2,
  groupFromPart5,
  groupFromPart7,
  groupFromTalk,
  paperQuestions,
  scorePaper,
} from "./exam";

const rng = () => 0.42;

function smallPaper() {
  return buildPaper("t", "Test", [
    { kind: "listening", minutes: 10, groups: [groupFromPart2(part2Items[0]!, rng), groupFromTalk(part3Sets[0]!, rng)] },
    { kind: "reading", minutes: 10, groups: [groupFromPart5(part5Items[0]!, rng), groupFromPart7(part7Sets[0]!, rng)] },
  ]);
}

describe("exam paper", () => {
  it("numbers questions in order across sections", () => {
    const qs = paperQuestions(smallPaper());
    expect(qs.map((q) => q.number)).toEqual(qs.map((_, i) => i + 1));
    expect(qs[0]!.part).toBe("2");
    expect(qs.at(-1)!.part).toBe("7");
  });

  it("reads Part 2 options aloud in their shuffled order, keeping the answer right", () => {
    const g = groupFromPart2(part2Items[0]!, rng);
    const q = g.questions[0]!;
    expect(g.script!.slice(1).map((l) => l.text)).toEqual(q.options.map((o, i) => `${"ABC"[i]}. ${o}`));
    expect(q.options[q.answer]).toBe(part2Items[0]!.options[part2Items[0]!.answer]);
  });

  it("gives realistic answer windows", () => {
    expect(answerWindowSeconds(groupFromPart2(part2Items[0]!))).toBe(5);
    expect(answerWindowSeconds(groupFromTalk(part3Sets[0]!))).toBe(24);
  });
});

describe("scoring", () => {
  it("scores sections and parts separately", () => {
    const paper = smallPaper();
    const all = paperQuestions(paper);
    const answers = Object.fromEntries(all.map((q) => [q.id, q.answer]));
    const r = scorePaper(paper, answers);
    expect(r.listening).toMatchObject({ correct: 4, total: 4, estimated: 495 });
    expect(r.reading!.correct).toBe(r.reading!.total);
    expect(r.byPart["5"]).toEqual({ correct: 1, total: 1 });
    expect(r.answered).toBe(all.length);
    expect(scorePaper(paper, {}).listening!.estimated).toBe(5);
  });

  it("estimates scaled scores monotonically within 5–495", () => {
    let prevL = 0;
    let prevR = 0;
    for (let c = 0; c <= 100; c++) {
      const l = estimateScaled("listening", c, 100);
      const rd = estimateScaled("reading", c, 100);
      expect(l).toBeGreaterThanOrEqual(prevL);
      expect(rd).toBeGreaterThanOrEqual(prevR);
      expect(l % 5).toBe(0);
      prevL = l;
      prevR = rd;
    }
    expect(estimateScaled("listening", 85, 100) + estimateScaled("reading", 78, 100)).toBeGreaterThanOrEqual(780);
  });
});

import { buildMiniPaper, buildShortMock, recordExam } from "../lib/papers";
import { emptyState } from "../lib/state";

describe("papers", () => {
  it("builds the day-7 mini test from week 1 material only (no Part 3 yet)", () => {
    const paper = buildMiniPaper(7);
    const parts = new Set(paperQuestions(paper).map((q) => q.part));
    expect(parts.has("3")).toBe(false);
    expect(paperQuestions(paper).length).toBeGreaterThanOrEqual(14);
    expect(paper.sections.map((s) => s.kind)).toEqual(["listening", "reading"]);
  });

  it("builds a 50-ish question short mock with unique question ids", () => {
    const qs = paperQuestions(buildShortMock());
    expect(qs.filter((q) => Number(q.part) <= 4)).toHaveLength(25);
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
  });

  it("records answers and an estimated score", () => {
    const paper = buildShortMock();
    const s = recordExam(emptyState(), paper, {}, { listening: 200, reading: 150 }, new Date("2026-05-01T10:00:00Z"));
    expect(s.scores.at(-1)).toMatchObject({ listening: 200, reading: 150, total: 350 });
    expect(s.errors.length).toBe(paperQuestions(paper).length);
  });
});
