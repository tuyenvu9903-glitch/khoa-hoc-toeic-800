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
    expect(v.score).toMatchObject({ current: 400, target: 800 });
  });

  it("moves to week 6 after 36 days and focuses on recorded weaknesses", () => {
    const base = withProfile();
    const s = {
      ...base,
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

import { recordMatchTime } from "./state";

describe("match best time", () => {
  it("keeps only the lowest time and reports records", () => {
    const s0 = withProfile();
    const r1 = recordMatchTime(s0, 30);
    expect(r1).toMatchObject({ record: true });
    expect(r1.state.matchBest).toBe(30);
    const r2 = recordMatchTime(r1.state, 35);
    expect(r2.record).toBe(false);
    expect(r2.state.matchBest).toBe(30);
    expect(recordMatchTime(r2.state, 21.5).state.matchBest).toBe(21.5);
  });
  it("old backups default to no record", () => {
    const { matchBest: _m, ...old } = withProfile();
    expect(parseState(old).matchBest).toBeNull();
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
