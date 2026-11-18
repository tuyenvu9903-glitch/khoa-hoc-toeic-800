import { describe, expect, it } from "vitest";
import { isMastered, nextBand, skillPriority, type SkillStat } from "./adaptive.js";

const base: SkillStat = {
  skillCode: "R.P5.wordform",
  attempts: 25,
  accuracyEma: 0.92,
  avgResponseMs: 20000,
  estimatedTimeMs: 25000,
  importance: 1.5,
  daysSincePractice: 1,
  mastered: false,
};

describe("adaptive scoring", () => {
  it("marks high accuracy, enough samples, and on-time as mastered", () => {
    expect(isMastered(base)).toBe(true);
  });

  it("down-ranks mastered skills", () => {
    const weak: SkillStat = { ...base, attempts: 12, accuracyEma: 0.48, mastered: false };
    expect(skillPriority(weak)).toBeGreaterThan(skillPriority({ ...base, mastered: true }));
  });

  it("maps estimated score to the next 100-point target", () => {
    expect(nextBand(400)).toBe(500);
    expect(nextBand(642)).toBe(700);
    expect(nextBand(790)).toBe(800);
  });
});
