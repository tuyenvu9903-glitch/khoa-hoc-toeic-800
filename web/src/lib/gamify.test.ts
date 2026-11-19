import { describe, expect, it } from "vitest";
import { applyGamification, levelFromXp, questBoard, questsForDate, XP, xpForLevel } from "./gamify";
import { createProfile, emptyState, localDateKey, markMissionDone, parseState, recordAnswer, type AppState } from "./state";

const now = new Date(2026, 10, 19, 15);
const today = localDateKey(now);
const fresh = () => createProfile(emptyState(), { displayName: "Lan", targetScore: 800, dailyMinutesTarget: 150 }, now);

/** Apply a change the way the store does. */
function step(s: AppState, fn: (s: AppState) => AppState) {
  return applyGamification(s, fn(s), now);
}

const answer = (id: string, correct: boolean, skillCode = "R.P5.tense") => (s: AppState) =>
  recordAnswer(s, { questionId: id, skillCode, part: "5", correct, responseMs: 10_000 }, now);

describe("levels", () => {
  it("maps XP to levels", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(xpForLevel(2))).toBe(2);
    expect(levelFromXp(xpForLevel(5) + 1)).toBe(5);
  });
});

describe("applyGamification", () => {
  it("awards XP for real answers only", () => {
    const s0 = fresh();
    const { state: s1 } = step(s0, answer("q1", true));
    expect(s1.game.xp).toBeGreaterThanOrEqual(XP.correct);
    const before = s1.game.xp;
    // A change that is not practice (e.g. a preference) gives nothing.
    const { state: s2 } = step(s1, (s) => ({ ...s, prefs: { ...s.prefs, humor: "off" } }));
    expect(s2.game.xp).toBe(before);
  });

  it("pays a completed step once, even if it is marked again", () => {
    const s0 = fresh();
    const { state: s1, events } = step(s0, (s) => markMissionDone(s, today, "listening"));
    expect(events.some((e) => e.type === "xp" && e.amount === XP.step)).toBe(true);
    const xp = s1.game.xp;
    // Simulate the step being unticked and ticked again (or the page reloaded and re-submitted).
    const unticked = { ...s1, missionDone: { ...s1.missionDone, [today]: [] } };
    const { state: s2 } = applyGamification(unticked, markMissionDone(unticked, today, "listening"), now);
    expect(s2.game.xp).toBe(xp);
  });

  it("survives a reload: the saved state round-trips and nothing is re-awarded", () => {
    const { state: s1 } = step(fresh(), answer("q1", true));
    const reloaded = parseState(JSON.parse(JSON.stringify(s1)));
    expect(reloaded.game.xp).toBe(s1.game.xp);
    const { state: s2, events } = applyGamification(reloaded, reloaded, now);
    expect(s2.game.xp).toBe(s1.game.xp);
    expect(events).toEqual([]);
  });

  it("caps practice XP per day", () => {
    let s = fresh();
    for (let i = 0; i < 200; i++) s = step(s, answer(`q${i}`, true)).state;
    expect(s.game.daily!.practiceXp).toBe(XP.practiceCapPerDay);
  });

  it("completes daily quests and unlocks badges once", () => {
    let s = fresh();
    const all: string[] = [];
    for (let i = 0; i < 30; i++) {
      const r = step(s, answer(`q${i}`, true, i % 2 ? "L.P2.who" : "R.P5.tense"));
      s = r.state;
      all.push(...r.events.map((e) => (e.type === "badge" ? `badge:${e.badge.id}` : e.type)));
    }
    expect(all.filter((e) => e === "badge:first_blood")).toHaveLength(1);
    const board = questBoard(s, now);
    for (const q of board) if (["correct", "answered", "listening", "reading"].includes(q.quest.metric)) expect(q.done).toBe(true);
  });

  it("loads older saves without game data", () => {
    const old = JSON.parse(JSON.stringify(fresh()));
    delete old.game;
    delete old.prefs;
    const s = parseState(old);
    expect(s.game.xp).toBe(0);
    expect(s.prefs.humor).toBe("normal");
  });

  it("gives three stable quests per date", () => {
    expect(questsForDate("2026-11-19")).toHaveLength(3);
    expect(questsForDate("2026-11-19")).toEqual(questsForDate("2026-11-19"));
  });
});
