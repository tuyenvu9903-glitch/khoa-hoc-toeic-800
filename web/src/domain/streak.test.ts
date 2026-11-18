import { describe, expect, it } from "vitest";
import { currentStreak } from "./streak";

const today = new Date(2026, 2, 10, 15, 0);

describe("currentStreak", () => {
  it("is 0 with no activity", () => {
    expect(currentStreak({}, today)).toBe(0);
  });
  it("counts today alone as 1", () => {
    expect(currentStreak({ "2026-03-10": ["vocab"] }, today)).toBe(1);
  });
  it("counts consecutive days including month boundaries", () => {
    const done = { "2026-03-10": ["a"], "2026-03-09": ["a"], "2026-03-08": ["a"] };
    expect(currentStreak(done, today)).toBe(3);
    expect(currentStreak({ "2026-03-01": ["a"], "2026-02-28": ["a"] }, new Date(2026, 2, 1))).toBe(2);
  });
  it("stops at a gap", () => {
    expect(currentStreak({ "2026-03-10": ["a"], "2026-03-08": ["a"] }, today)).toBe(1);
  });
  it("keeps yesterday's streak alive before studying today", () => {
    expect(currentStreak({ "2026-03-09": ["a"], "2026-03-08": ["a"] }, today)).toBe(2);
  });
  it("loses the streak if yesterday was missed too", () => {
    expect(currentStreak({ "2026-03-08": ["a"] }, today)).toBe(0);
  });
  it("ignores days where every item was un-ticked", () => {
    expect(currentStreak({ "2026-03-10": [], "2026-03-09": ["a"] }, today)).toBe(1);
  });
});
