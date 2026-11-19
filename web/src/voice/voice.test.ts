import { describe, expect, it } from "vitest";
import { coachReact, doneContext, newCoachMemory, skillTip } from "./coach";
import { copy } from "./copy";
import { pickLine, poolFor, type History } from "./engine";
import { greetingContext } from "./greeting";
import { LINES, type VoiceContext } from "./lines";

describe("line bank", () => {
  it("has a neutral line and a playful line for every context", () => {
    for (const ctx of Object.keys(LINES) as VoiceContext[]) {
      expect(LINES[ctx].some((r) => r[0] === 0), ctx).toBe(true);
      expect(LINES[ctx].some((r) => r[0] >= 1), ctx).toBe(true);
    }
  });
});

describe("pickLine", () => {
  it("uses only neutral lines when humour is off", () => {
    expect(poolFor("correct", "off").every((r) => r.spice === 0)).toBe(true);
    expect(poolFor("correct", "chill").every((r) => r.spice === 1)).toBe(true);
    expect(poolFor("correct", "max").some((r) => r.spice === 3)).toBe(true);
  });

  it("does not repeat a line until the pool is used up", () => {
    const hist: History = {};
    const size = poolFor("wrong", "max").length;
    const seen = new Set<string>();
    for (let i = 0; i < size; i++) seen.add(pickLine("wrong", { humor: "max", hist, rand: () => 0 }).id);
    expect(seen.size).toBe(size);
  });

  it("never repeats the same line twice in a row", () => {
    const hist: History = {};
    let last = "";
    for (let i = 0; i < 30; i++) {
      const l = pickLine("correct", { humor: "normal", hist, rand: () => 0.99 });
      expect(l.id).not.toBe(last);
      last = l.id;
    }
  });

  it("fills placeholders", () => {
    const l = pickLine("combo", { humor: "off", vars: { n: 5 }, hist: {} });
    expect(l.text).toContain("5");
    expect(l.text).not.toContain("{n}");
  });
});

describe("coachReact", () => {
  const run = (answers: [boolean, string][]) => {
    let m = newCoachMemory();
    let ctx = "";
    let tip: string | undefined;
    for (const [correct, skillCode] of answers) {
      const r = coachReact(m, { correct, skillCode, responseMs: 20_000 });
      m = r.memory;
      ctx = r.reaction.context;
      tip = r.reaction.tip;
    }
    return { ctx, tip };
  };

  it("points at the skill when the same skill is missed twice", () => {
    const r = run([[false, "R.P5.wordform"], [false, "R.P5.wordform"]]);
    expect(r.ctx).toBe("wrong_skill");
    expect(r.tip).toMatch(/danh từ/);
  });

  it("calms down after three misses in a row on different skills", () => {
    expect(run([[false, "R.P5.tense"], [false, "R.P5.prep"], [false, "L.P2.who"]]).ctx).toBe("wrong_streak");
  });

  it("celebrates a comeback and combos", () => {
    expect(run([[false, "a"], [false, "b"], [true, "c"]]).ctx).toBe("correct_comeback");
    expect(run(Array.from({ length: 5 }, () => [true, "x"] as [boolean, string])).ctx).toBe("combo");
  });

  it("encourages a long rough session", () => {
    const answers: [boolean, string][] = [];
    for (let i = 0; i < 10; i++) answers.push([i % 3 === 1, `s${i}`]);
    expect(run(answers).ctx).toBe("grind");
  });

  it("has tips for the main Part 5 skills", () => {
    for (const c of ["R.P5.sva", "R.P5.tense", "R.P5.prep", "R.P5.conj", "R.P5.gerund", "R.P5.passive"]) expect(skillTip(c)).toBeTruthy();
  });

  it("chooses the end-of-session verdict from accuracy", () => {
    expect(doneContext(10, 10)).toBe("done_perfect");
    expect(doneContext(2, 10)).toBe("done_rough");
    expect(doneContext(7, 10)).toBe("done");
  });
});

describe("greetingContext", () => {
  const base = { now: new Date(2026, 10, 19, 14), day: 5, streak: 1, stepsDone: 0, stepsTotal: 4, missionDone: { "2026-11-18": ["vocab"] } };
  it("welcomes back after a few days away", () => {
    expect(greetingContext({ ...base, missionDone: { "2026-11-12": ["vocab"] } })).toBe("comeback");
  });
  it("marks streak milestones and a finished day", () => {
    expect(greetingContext({ ...base, streak: 7 })).toBe("streak_7");
    expect(greetingContext({ ...base, stepsDone: 4 })).toBe("day_done");
  });
  it("uses the time of day otherwise", () => {
    expect(greetingContext({ ...base, now: new Date(2026, 10, 19, 7) })).toBe("login_morning");
    expect(greetingContext(base)).toBe("login");
  });
});

describe("copy", () => {
  it("keeps plain text when humour is off", () => {
    expect(copy("empty", "off")).toBe("Chưa có dữ liệu.");
    expect(copy("empty", "normal")).not.toBe("Chưa có dữ liệu.");
  });
});
