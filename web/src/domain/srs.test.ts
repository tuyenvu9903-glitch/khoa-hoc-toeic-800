import { describe, expect, it } from "vitest";
import { intervalLabel, isDue, isMature, newCard, reviewCard, sameLocalDay } from "./srs";

const now = new Date(2026, 2, 10, 22, 30); // 10 Mar 2026, 22:30 local

describe("reviewCard", () => {
  it("good on a new card schedules tomorrow, then 3 days, then grows by ease", () => {
    const c1 = reviewCard(undefined, "good", now);
    expect(c1).toMatchObject({ intervalDays: 1, repetitions: 1 });
    const c2 = reviewCard(c1, "good", now);
    expect(c2.intervalDays).toBe(3);
    const c3 = reviewCard(c2, "good", now);
    expect(c3.intervalDays).toBe(Math.round(3 * c3.ease));
    expect(c3.intervalDays).toBeGreaterThan(c2.intervalDays);
  });

  it("is due from the start of the due day, not the same clock time", () => {
    const c = reviewCard(undefined, "good", now);
    expect(isDue(c, now)).toBe(false);
    expect(isDue(c, new Date(2026, 2, 11, 0, 5))).toBe(true);
    expect(isDue(c, new Date(2026, 2, 10, 23, 59))).toBe(false);
  });

  it("again resets progress, counts a lapse, lowers ease (floor 1.3) and returns in 10 minutes", () => {
    let c = reviewCard(reviewCard(undefined, "good", now), "good", now);
    c = reviewCard(c, "again", now);
    expect(c).toMatchObject({ intervalDays: 0, repetitions: 0, lapses: 1 });
    expect(Date.parse(c.nextReviewAt) - now.getTime()).toBe(10 * 60_000);
    let low = c;
    for (let i = 0; i < 20; i++) low = reviewCard(low, "again", now);
    expect(low.ease).toBe(1.3);
  });

  it("easy jumps further than good; hard stays shorter and lowers ease", () => {
    const base = reviewCard(reviewCard(undefined, "good", now), "good", now);
    const easy = reviewCard(base, "easy", now);
    const good = reviewCard(base, "good", now);
    const hard = reviewCard(base, "hard", now);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
    expect(hard.intervalDays).toBeLessThanOrEqual(good.intervalDays);
    expect(hard.ease).toBeLessThan(base.ease);
    expect(easy.ease).toBeGreaterThan(base.ease);
  });

  it("always schedules at least one day for passing grades and caps ease", () => {
    let c = newCard(now);
    for (let i = 0; i < 30; i++) c = reviewCard(c, "easy", now);
    expect(c.ease).toBeLessThanOrEqual(3.5);
    expect(c.intervalDays).toBe(365);
    expect(Number.isNaN(Date.parse(c.nextReviewAt))).toBe(false);
    expect(reviewCard(newCard(now), "hard", now).intervalDays).toBeGreaterThanOrEqual(1);
  });

  it("does not mutate the input card", () => {
    const c = newCard(now);
    const copy = { ...c };
    reviewCard(c, "good", now);
    expect(c).toEqual(copy);
  });
});

describe("helpers", () => {
  it("labels button intervals", () => {
    expect(intervalLabel(undefined, "again", now)).toBe("10 phút");
    expect(intervalLabel(undefined, "good", now)).toBe("1 ngày");
    expect(intervalLabel(undefined, "easy", now)).toBe("3 ngày");
  });
  it("detects mature cards at 21+ days", () => {
    expect(isMature({ ...newCard(now), intervalDays: 21 })).toBe(true);
    expect(isMature({ ...newCard(now), intervalDays: 20 })).toBe(false);
  });
  it("compares local calendar days", () => {
    expect(sameLocalDay(new Date(2026, 2, 10, 1).toISOString(), now)).toBe(true);
    expect(sameLocalDay(new Date(2026, 2, 9, 23).toISOString(), now)).toBe(false);
  });
});
