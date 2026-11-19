import { describe, expect, it } from "vitest";
import { createProfile, emptyState, recordDayTest } from "./state";
import { decodeState, encodeState, transferLink } from "./transfer";
import { wordsForDay } from "../domain/progress";

describe("transfer link", () => {
  const now = new Date("2026-03-02T09:00:00");
  const state = recordDayTest(
    createProfile(emptyState(), { displayName: "Lan", targetScore: 800, dailyMinutesTarget: 150 }, now),
    1,
    wordsForDay(1).map((w) => ({ wordId: w.id, correct: true })),
    now,
  ).state;

  it("round-trips the whole state and stays URL-safe", async () => {
    const code = await encodeState(state);
    expect(code).toMatch(/^[zj][A-Za-z0-9_-]+$/);
    expect(await decodeState(code)).toEqual(state);
    expect(transferLink(code, "https://x.github.io/app/")).toBe(`https://x.github.io/app/#/import?d=${code}`);
  });

  it("rejects a cut or edited link with a readable message", async () => {
    const code = await encodeState(state);
    await expect(decodeState(code.slice(0, code.length / 2))).rejects.toThrow(/Link bị lỗi|cắt/);
    await expect(decodeState("xabc")).rejects.toThrow(/Link bị lỗi/);
  });
});
