import { describe, expect, it } from "vitest";
import { buildDashboard } from "./dashboard";
import {
  createProfile,
  emptyState,
  localDateKey,
  parseState,
  restartProgram,
  toggleMissionItem,
} from "./state";

const start = new Date("2026-03-02T08:00:00Z");
const withProfile = () =>
  createProfile(emptyState(), { displayName: " Lan ", targetScore: 800, dailyMinutesTarget: 150 }, start);

describe("state", () => {
  it("creates a trimmed profile starting at the given time", () => {
    const s = withProfile();
    expect(s.profile?.displayName).toBe("Lan");
    expect(s.profile?.programStartDate).toBe(start.toISOString());
  });

  it("round-trips through JSON (export then import)", () => {
    const s = toggleMissionItem(withProfile(), "2026-03-02", "vocab");
    const back = parseState(JSON.parse(JSON.stringify({ ...s, exportedAt: "x" })));
    expect(back).toEqual(s);
  });

  it("rejects malformed or foreign-version files", () => {
    expect(() => parseState({})).toThrow();
    expect(() => parseState({ ...emptyState(), version: 99 })).toThrow();
    expect(() => parseState({ ...withProfile(), scores: [{ at: "nope" }] })).toThrow();
  });

  it("toggles a mission item on and off without touching other days", () => {
    let s = toggleMissionItem(withProfile(), "2026-03-02", "vocab");
    s = toggleMissionItem(s, "2026-03-03", "vocab");
    expect(s.missionDone).toEqual({ "2026-03-02": ["vocab"], "2026-03-03": ["vocab"] });
    s = toggleMissionItem(s, "2026-03-02", "vocab");
    expect(s.missionDone["2026-03-02"]).toEqual([]);
  });

  it("restart keeps scores and errors but resets the day count and ticks", () => {
    const s0 = { ...withProfile(), scores: [{ at: start.toISOString(), listening: 250, reading: 240, total: 490, source: "placement" }] };
    const s1 = restartProgram(toggleMissionItem(s0, "2026-03-02", "vocab"), new Date("2026-04-01T00:00:00Z"));
    expect(s1.scores).toHaveLength(1);
    expect(s1.missionDone).toEqual({});
    expect(s1.profile?.programStartDate).toBe("2026-04-01T00:00:00.000Z");
  });

  it("formats local date keys with zero padding", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("buildDashboard", () => {
  it("shows day 1 / week 1 with the full default mission for a new learner", () => {
    const s = withProfile();
    const v = buildDashboard(s, s.profile!, start);
    expect(v).toMatchObject({ day: 1, week: 1, placementDone: false, openErrors: 0 });
    expect(v.mission.items.map((i) => i.kind)).toEqual(["vocab", "grammar", "listening", "reading", "mini_test"]);
    expect(v.score).toBeNull(); // no test taken yet: no score is shown
  });

  it("shows week 6 on day 37 and focuses on recorded weaknesses", () => {
    const base = withProfile();
    const s = {
      ...base,
      progress: { day: 37, dayStartedOn: "2026-01-01", done: {} },
      skillStats: {
        "L.P3.purpose": {
          attempts: 30,
          correct: 14,
          accuracyEma: 0.48,
          avgResponseMs: 30000,
          lastPracticedAt: start.toISOString(),
          mastered: false,
        },
      },
      errors: [
        { id: "e1", questionId: "q1", skillCode: "L.P3.purpose", part: "3" as const, errorClass: "listening_gap" as const, createdAt: start.toISOString(), resolvedAt: null },
      ],
    };
    const v = buildDashboard(s, s.profile!, new Date("2026-04-07T09:00:00Z"));
    expect(v.week).toBe(6);
    expect(v.weaknesses[0]?.skillCode).toBe("L.P3.purpose");
    expect(v.mission.items.find((i) => i.kind === "listening")?.focus).toBe("P3 Main purpose");
    expect(v.mission.items.find((i) => i.kind === "error_review")?.itemCount).toBe(1);
  });

  it("ignores skill codes it does not know (e.g. from a newer backup)", () => {
    const base = withProfile();
    const s = {
      ...base,
      skillStats: { "X.unknown": { attempts: 5, correct: 1, accuracyEma: 0.2, avgResponseMs: 1, lastPracticedAt: null, mastered: false } },
    };
    expect(buildDashboard(s, s.profile!, start).weaknesses).toEqual([]);
  });
});

import { gradeVocab, markMissionDone } from "./state";

describe("vocabulary progress", () => {
  it("grades a word and keeps it through export/import", () => {
    const s = gradeVocab(withProfile(), "agenda", "good", start);
    expect(s.srs.agenda?.repetitions).toBe(1);
    const back = parseState(JSON.parse(JSON.stringify(s)));
    expect(back.srs.agenda).toEqual(s.srs.agenda);
  });

  it("accepts backups made before vocabulary existed (no srs field)", () => {
    const { srs: _omit, ...old } = withProfile();
    expect(parseState(old).srs).toEqual({});
  });

  it("markMissionDone only ever ticks on", () => {
    let s = markMissionDone(withProfile(), "2026-03-02", "vocab");
    s = markMissionDone(s, "2026-03-02", "vocab");
    expect(s.missionDone["2026-03-02"]).toEqual(["vocab"]);
  });
});

import { recordTypingScore } from "./state";

describe("typing best score", () => {
  it("keeps the highest score and defaults old saves to null", () => {
    const s0 = withProfile();
    const r1 = recordTypingScore(s0, 300);
    expect(r1).toMatchObject({ record: true });
    expect(recordTypingScore(r1.state, 200)).toMatchObject({ record: false });
    expect(recordTypingScore(r1.state, 450).state.typingBest).toBe(450);
    expect(recordTypingScore(s0, 0).record).toBe(false);
    const { typingBest: _t, ...old } = withProfile();
    expect(parseState({ ...old, matchBest: 21.5 }).typingBest).toBeNull();
  });
});

import { recordShooterScore } from "./state";

describe("shooter best score", () => {
  it("keeps only the highest score and ignores zero", () => {
    const s0 = withProfile();
    expect(recordShooterScore(s0, 0).record).toBe(false);
    const r1 = recordShooterScore(s0, 450);
    expect(r1.record).toBe(true);
    expect(recordShooterScore(r1.state, 300).state.shooterBest).toBe(450);
    expect(recordShooterScore(r1.state, 900).state.shooterBest).toBe(900);
  });
  it("old backups default to no record", () => {
    const { shooterBest: _s, ...old } = withProfile();
    expect(parseState(old).shooterBest).toBeNull();
  });
});

import { recordAnswer } from "./state";

describe("recordAnswer", () => {
  const now = new Date("2026-03-02T10:00:00Z");
  const a = { questionId: "p2-01", skillCode: "L.P2.who", part: "2" as const, responseMs: 4000 };

  it("creates and updates skill stats", () => {
    const s1 = recordAnswer(withProfile(), { ...a, correct: false }, now);
    expect(s1.skillStats["L.P2.who"]).toMatchObject({ attempts: 1, correct: 0, accuracyEma: 0 });
    const s2 = recordAnswer(s1, { ...a, correct: true }, now);
    expect(s2.skillStats["L.P2.who"]).toMatchObject({ attempts: 2, correct: 1 });
    expect(s2.skillStats["L.P2.who"]!.accuracyEma).toBeCloseTo(0.25);
  });

  it("logs one open error per question and resolves it when answered correctly", () => {
    let s = recordAnswer(withProfile(), { ...a, correct: false }, now);
    s = recordAnswer(s, { ...a, correct: false }, now);
    expect(s.errors.filter((e) => e.resolvedAt === null)).toHaveLength(1);
    expect(s.errors[0]).toMatchObject({ errorClass: "listening_gap", part: "2" });
    s = recordAnswer(s, { ...a, correct: true }, now);
    expect(s.errors.every((e) => e.resolvedAt !== null)).toBe(true);
    expect(parseState(JSON.parse(JSON.stringify(s))).errors).toHaveLength(1);
  });
});

import { advanceDay, markMissionDone as markDone, recordDayTest, type AppState } from "./state";
import { wordsForDay } from "../domain/progress";
import { reviewCard } from "../domain/srs";

describe("day-by-day progression", () => {
  const d1 = new Date(2026, 2, 2, 9);
  const sameDayLater = new Date(2026, 2, 2, 21);
  const nextDay = new Date(2026, 2, 3, 8);

  const learnAll = (s: ReturnType<typeof withProfile>, day: number) => ({
    ...s,
    srs: Object.fromEntries(wordsForDay(day).map((w) => [w.id, reviewCard(undefined, "good", d1)])),
  });
  /** Answer `share` of the day's test right. */
  const takeTest = (s: AppState, day: number, share = 1) => {
    const words = wordsForDay(day);
    const right = Math.round(words.length * share);
    return recordDayTest(s, day, words.map((w, i) => ({ wordId: w.id, correct: i < right })), d1);
  };

  it("opens day 1 and stays there until every mission is done", () => {
    let s = advanceDay(withProfile(), d1);
    expect(s.progress).toMatchObject({ day: 1, dayStartedOn: "2026-03-02" });
    for (const k of ["grammar", "listening", "reading"]) s = markDone(s, "2026-03-02", k);
    expect(advanceDay(s, nextDay).progress.day).toBe(1); // vocabulary not learned yet
  });

  it("opens the next day only on a later date once the day is complete", () => {
    let s = learnAll(advanceDay(withProfile(), d1), 1);
    for (const k of ["grammar", "listening", "reading"]) s = markDone(s, "2026-03-02", k);
    // Words learned but the day's test not passed yet: the day stays open.
    expect(advanceDay(s, nextDay).progress.day).toBe(1);
    s = takeTest(s, 1).state;
    expect(advanceDay(s, sameDayLater).progress.day).toBe(1);
    const next = advanceDay(s, nextDay);
    expect(next.progress).toMatchObject({ day: 2, dayStartedOn: "2026-03-03" });
    expect(advanceDay(next, nextDay).progress.day).toBe(2);
  });

  it("a day's vocabulary counts only with a test score of 80% or more", () => {
    let s = learnAll(advanceDay(withProfile(), d1), 1);
    for (const k of ["grammar", "listening", "reading"]) s = markDone(s, "2026-03-02", k);
    const fail = takeTest(s, 1, 0.5);
    expect(fail.passed).toBe(false);
    expect(fail.state.dayTests["1"]).toBe(fail.percent);
    expect(advanceDay(fail.state, nextDay).progress.day).toBe(1);
    const pass = takeTest(fail.state, 1, 0.85);
    expect(pass.passed).toBe(true);
    expect(pass.percent).toBeGreaterThanOrEqual(80);
    expect(advanceDay(pass.state, nextDay).progress.day).toBe(2);
    // A worse retake keeps the best score and the pass.
    const again = takeTest(pass.state, 1, 0);
    expect(again.state.dayTests["1"]).toBe(pass.percent);
  });

  it("a test grades its words: right = learned, wrong = due again soon", () => {
    const s = advanceDay(withProfile(), d1);
    const words = wordsForDay(1);
    const r = recordDayTest(s, 1, words.map((w, i) => ({ wordId: w.id, correct: i > 0 })), d1).state;
    expect(words.every((w) => r.srs[w.id])).toBe(true);
    expect(r.srs[words[0]!.id]!.intervalDays ?? 0).toBeLessThanOrEqual(r.srs[words[1]!.id]!.intervalDays ?? 0);
  });

  it("requires the mini test on checkpoint days", () => {
    let s: AppState = { ...withProfile(), progress: { day: 7, dayStartedOn: "2026-03-02", done: {} } };
    s = takeTest(learnAll(s, 7), 7).state;
    for (const k of ["grammar", "listening", "reading"]) s = markDone(s, "2026-03-02", k);
    expect(advanceDay(s, nextDay).progress.day).toBe(7);
    s = markDone(s, "2026-03-02", "mini_test");
    expect(advanceDay(s, nextDay).progress.day).toBe(8);
  });
});
