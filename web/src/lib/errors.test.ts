import { describe, expect, it } from "vitest";
import { paperQuestions } from "../domain/exam";
import { buildShortMock } from "./papers";
import { questionById } from "./questionIndex";
import { emptyState, errorsDue, parseState, recordAnswer } from "./state";

const a = { questionId: "p5-wf-01", skillCode: "R.P5.wordform", part: "5" as const, responseMs: 5000 };
const t0 = new Date("2026-03-02T09:00:00Z");
const day = (n: number) => new Date(t0.getTime() + n * 86_400_000);

describe("error notebook", () => {
  it("stores the chosen answer and makes a new mistake due today", () => {
    const s = recordAnswer(emptyState(), { ...a, correct: false, chosen: "efficient" }, t0);
    expect(s.errors[0]).toMatchObject({ chosen: "efficient", retries: 0 });
    expect(errorsDue(s, t0)).toHaveLength(1);
  });

  it("spaces failed retries 1, 3, then 7 days apart and resolves on a correct retry", () => {
    let s = recordAnswer(emptyState(), { ...a, correct: false }, t0);
    s = recordAnswer(s, { ...a, correct: false, chosen: "efficiency" }, t0);
    expect(s.errors[0]!.retries).toBe(1);
    expect(errorsDue(s, day(0.5))).toHaveLength(0);
    expect(errorsDue(s, day(1))).toHaveLength(1);
    s = recordAnswer(s, { ...a, correct: false }, day(1));
    expect(errorsDue(s, day(3.5))).toHaveLength(0);
    expect(errorsDue(s, day(4))).toHaveLength(1);
    s = recordAnswer(s, { ...a, correct: true }, day(4));
    expect(s.errors[0]!.resolvedAt).not.toBeNull();
    expect(errorsDue(s, day(30))).toHaveLength(0);
  });

  it("reads older saves without the new fields (they count as due)", () => {
    const old = { ...emptyState(), errors: [{ id: "x", questionId: "p5-wf-01", skillCode: "R.P5.wordform", part: "5", errorClass: "grammar_gap", createdAt: t0.toISOString(), resolvedAt: null }] };
    const s = parseState(old);
    expect(errorsDue(s, t0)).toHaveLength(1);
  });

  it("can look up every question an exam can record", () => {
    for (const q of paperQuestions(buildShortMock())) expect(questionById.has(q.id), q.id).toBe(true);
  });
});
