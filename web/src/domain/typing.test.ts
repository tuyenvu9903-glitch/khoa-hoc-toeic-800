import { describe, expect, it } from "vitest";
import type { VocabWord } from "../data/vocabulary";
import { START_LIVES } from "./shooter";
import {
  createTypingGame,
  hintFor,
  LAND_Y,
  MAX_ACTIVE,
  prefixTargets,
  shouldAutoFire,
  stepTyping,
  submitWord,
  type TypingGame,
} from "./typing";

const w = (word: string, meaningVi = `nghĩa ${word}`): VocabWord => ({
  id: word.replace(/\s+/g, "_"),
  word,
  pos: "n",
  meaningVi,
  meaningEn: "",
  paraphrase: null,
  topic: "office",
  example: "",
});
const rng = () => 0;

/** Run the simulation in small steps. */
function run(g: TypingGame, seconds: number) {
  for (let t = 0; t < seconds && g.phase === "playing"; t += 0.02) stepTyping(g, 0.02, rng);
}

describe("typing game", () => {
  it("spawns one chicken at once and never more than MAX_ACTIVE", () => {
    const g = createTypingGame(["agenda", "invoice", "deadline", "budget", "receipt"].map((x) => w(x)));
    stepTyping(g, 0.02, rng);
    expect(g.enemies).toHaveLength(1);
    run(g, 12);
    expect(g.enemies.filter((e) => e.state === "alive").length).toBeLessThanOrEqual(MAX_ACTIVE);
  });

  it("shoots the chicken whose answer was typed, then wins once all words are resolved", () => {
    const g = createTypingGame([w("agenda")]);
    stepTyping(g, 0.02, rng);
    expect(submitWord(g, "  Agenda ")).toBe("hit");
    expect(g.shots).toHaveLength(1);
    run(g, 1);
    expect(g.results).toEqual([{ wordId: "agenda", outcome: "perfect" }]);
    expect(g.score).toBeGreaterThanOrEqual(100);
    expect(g.combo).toBe(1);
    run(g, 2);
    expect(g.phase).toBe("won");
  });

  it("reports near-misses without penalty and wrong words with a combo reset", () => {
    const g = createTypingGame([w("invoice")]);
    stepTyping(g, 0.02, rng);
    g.combo = 3;
    expect(submitWord(g, "invoce")).toBe("close");
    expect(g.combo).toBe(3);
    expect(submitWord(g, "banana")).toBe("wrong");
    expect(g.combo).toBe(0);
    expect(g.wrongSubmits).toBe(1);
    expect(submitWord(g, "   ")).toBe("empty");
  });

  it("reveals a hint past halfway, grading the word as ok", () => {
    const g = createTypingGame([w("receipt")]);
    run(g, 0.1);
    const e = g.enemies[0]!;
    e.y = LAND_Y * 0.7;
    stepTyping(g, 0.02, rng);
    expect(e.hint).toBe("r _ _ _ _ _ _");
    submitWord(g, "receipt");
    run(g, 0.5);
    expect(g.results[0]).toMatchObject({ outcome: "ok" });
    expect(g.combo).toBe(0);
  });

  it("costs a life and records a miss when a chicken lands", () => {
    const g = createTypingGame([w("budget"), w("deadline")]);
    run(g, 0.1);
    g.enemies[0]!.y = LAND_Y - 0.1;
    stepTyping(g, 0.05, rng);
    expect(g.lives).toBe(START_LIVES - 1);
    expect(g.results[0]).toEqual({ wordId: "budget", outcome: "missed" });
  });

  it("loses when lives run out", () => {
    const g = createTypingGame(Array.from({ length: 8 }, (_, i) => w(`word${i}`)));
    g.lives = 1;
    run(g, 0.1);
    g.enemies[0]!.y = LAND_Y;
    stepTyping(g, 0.02, rng);
    expect(g.phase).toBe("lost");
  });

  it("waits for longer answers before auto-firing, and highlights prefix matches", () => {
    const g = createTypingGame([w("bill"), w("billing")]);
    stepTyping(g, 0.02, rng);
    g.spawnTimer = 0;
    stepTyping(g, 0.02, rng);
    expect(g.enemies).toHaveLength(2);
    expect(shouldAutoFire(g, "bil")).toBe(false);
    expect(shouldAutoFire(g, "bill")).toBe(false);
    expect(shouldAutoFire(g, "billing")).toBe(true);
    expect(prefixTargets(g, "bill").size).toBe(2);
    expect(prefixTargets(g, "billi").size).toBe(1);
    expect(submitWord(g, "bill")).toBe("hit");
  });

  it("builds spelling hints for multi-word answers", () => {
    expect(hintFor("check out")).toBe("c _ _ _ _   _ _ _");
  });
});
