import { describe, expect, it } from "vitest";
import { buildDailyMission, rankWeaknesses, type MissionTemplate } from "./mission";
import { learningRatioForWeek, programPosition } from "./program";
import { summarizeScore } from "./score";

const templates: MissionTemplate[] = [
  { kind: "vocab", title: "Vocabulary", itemCount: 25, minutes: 20, sortOrder: 1 },
  { kind: "grammar", title: "Grammar", itemCount: 15, minutes: 20, sortOrder: 2 },
  { kind: "listening", title: "Listening", itemCount: 25, minutes: 35, sortOrder: 3 },
  { kind: "reading", title: "Reading", itemCount: 25, minutes: 40, sortOrder: 4 },
  { kind: "error_review", title: "Error review", itemCount: 10, minutes: 15, sortOrder: 5 },
  { kind: "mini_test", title: "Mini test", itemCount: 15, minutes: 20, sortOrder: 6 },
];

const base = {
  week: 1,
  day: 1,
  templates,
  weaknesses: [],
  openErrors: 0,
  dueVocab: 0,
  dailyMinutesTarget: 150,
};

describe("programPosition", () => {
  const start = new Date("2026-01-01T00:00:00Z");
  it("starts on day 1 / week 1", () => {
    expect(programPosition(start, start)).toEqual({ day: 1, week: 1, finished: false });
  });
  it("maps day 8 to week 2 and day 50 to week 8", () => {
    expect(programPosition(start, new Date("2026-01-08T10:00:00Z")).week).toBe(2);
    expect(programPosition(start, new Date("2026-02-19T10:00:00Z"))).toMatchObject({ day: 50, week: 8 });
  });
  it("clamps after day 56 and flags finished", () => {
    expect(programPosition(start, new Date("2026-06-01T00:00:00Z"))).toEqual({
      day: 56,
      week: 8,
      finished: true,
    });
  });
  it("uses 30% learning until week 4 and 20% after", () => {
    expect(learningRatioForWeek(4)).toBe(0.3);
    expect(learningRatioForWeek(5)).toBe(0.2);
  });
});

describe("buildDailyMission", () => {
  it("skips error review when there are no open errors", () => {
    const m = buildDailyMission(base);
    expect(m.items.map((i) => i.kind)).not.toContain("error_review");
    expect(m.totalMinutes).toBe(135);
  });

  it("sizes error review to open errors", () => {
    const m = buildDailyMission({ ...base, openErrors: 4 });
    const er = m.items.find((i) => i.kind === "error_review");
    expect(er?.itemCount).toBe(4);
    expect(er?.reason).toContain("4");
  });

  it("targets the weakest listening part and the weakest reading part", () => {
    const m = buildDailyMission({
      ...base,
      weaknesses: [
        { skillCode: "L.P3.purpose", name: "P3 Main purpose", part: "3", priority: 2, accuracy: 0.48 },
        { skillCode: "R.P5.wordform", name: "Word forms", part: "5", priority: 1.5, accuracy: 0.55 },
      ],
    });
    expect(m.items.find((i) => i.kind === "listening")?.focus).toBe("P3 Main purpose");
    expect(m.items.find((i) => i.kind === "reading")?.focus).toBe("Word forms");
  });

  it("does not drill a section the learner has mastered", () => {
    const m = buildDailyMission({
      ...base,
      weaknesses: [{ skillCode: "R.P5", name: "Part 5", part: "5", priority: 0.1, accuracy: 0.95 }],
    });
    expect(m.items.find((i) => i.kind === "reading")?.focus).toBeNull();
  });

  it("adds extra items on weaknesses from week 6", () => {
    const weaknesses = [
      { skillCode: "L.P3", name: "Part 3", part: "3", priority: 2, accuracy: 0.5 },
    ];
    const early = buildDailyMission({ ...base, week: 3, weaknesses });
    const late = buildDailyMission({ ...base, week: 6, weaknesses });
    expect(late.items.find((i) => i.kind === "listening")?.itemCount).toBe(
      (early.items.find((i) => i.kind === "listening")?.itemCount ?? 0) + 10,
    );
    expect(late.practiceRatio).toBeCloseTo(0.8);
  });

  it("grows vocabulary when many cards are due", () => {
    const m = buildDailyMission({ ...base, dueVocab: 40 });
    expect(m.items.find((i) => i.kind === "vocab")?.itemCount).toBe(30);
  });
});

describe("rankWeaknesses", () => {
  const stat = (skillCode: string, accuracyEma: number) => ({
    skillCode,
    name: skillCode,
    part: "3",
    attempts: 20,
    accuracyEma,
    avgResponseMs: 30000,
    estimatedTimeMs: 30000,
    importance: 1,
    daysSincePractice: 1,
    mastered: false,
  });
  it("puts the lowest accuracy first and ignores untouched skills", () => {
    const ranked = rankWeaknesses([
      stat("a", 0.8),
      stat("b", 0.4),
      { ...stat("c", 0), attempts: 0 },
    ]);
    expect(ranked.map((r) => r.skillCode)).toEqual(["b", "a"]);
  });
});

describe("summarizeScore", () => {
  it("computes current, next 100 milestone and gap", () => {
    expect(summarizeScore(310, 332, 800)).toMatchObject({
      current: 642,
      nextTarget: 700,
      gapToTarget: 158,
    });
  });
  it("never exceeds the target", () => {
    expect(summarizeScore(400, 390, 800).nextTarget).toBe(800);
  });
});
