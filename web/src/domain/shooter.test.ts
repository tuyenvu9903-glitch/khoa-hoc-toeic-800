import { describe, expect, it } from "vitest";
import { vocabulary } from "../data/vocabulary";
import { reviewCard } from "./srs";
import {
  CHICKEN_H,
  correctChicken,
  createGame,
  gradeForOutcome,
  INVADE_Y,
  NO_INPUT,
  pickShooterWords,
  roundSpeed,
  ROUNDS,
  SHIP_Y,
  START_LIVES,
  step,
  W,
  type Game,
  type Input,
} from "./shooter";

function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const targets = (n: number) => vocabulary.slice(0, n);
const newGame = (n = 3, seed = 7) => {
  const rng = seeded(seed);
  return { g: createGame(targets(n), vocabulary, rng), rng };
};
const fire: Input = { ...NO_INPUT, fire: true };

/** Run the sim for `sec` seconds in small steps. */
function run(g: Game, sec: number, rng: () => number, input: Input = NO_INPUT) {
  for (let t = 0; t < sec; t += 0.016) step(g, 0.016, input, rng);
}

/** Park the flock at mid-screen and stand the ship under `x`, then shoot once. */
function shootAt(g: Game, x: number, rng: () => number) {
  g.round.y = 200;
  g.ship.x = x;
  g.ship.targetX = x;
  step(g, 0.016, fire, rng);
  for (let i = 0; i < 40 && g.bullets.length > 0 && g.round.outcome === null; i++) {
    g.round.y = 200; // keep the flock still while the bullet travels
    step(g, 0.016, NO_INPUT, rng);
  }
}

describe("round setup", () => {
  it("offers four labels with exactly one correct chicken, spread across the screen", () => {
    const { g } = newGame();
    expect(g.round.chickens).toHaveLength(4);
    expect(g.round.chickens.filter((c) => c.correct)).toHaveLength(1);
    const xs = g.round.chickens.map((c) => c.baseX);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(75);
    expect(Math.max(...xs)).toBeLessThanOrEqual(W - 75);
    expect(new Set(g.round.chickens.map((c) => c.label)).size).toBe(4);
  });
  it("prompt is in the opposite language of the labels", () => {
    for (let seed = 1; seed < 30; seed++) {
      const { g } = newGame(3, seed);
      const w = g.targets[0]!;
      const right = correctChicken(g)!;
      if (g.round.dir === "en2vi") {
        expect(g.round.prompt).toBe(w.word);
        expect(right.label).toBe(w.meaningVi);
      } else {
        expect(g.round.prompt).toBe(w.meaningVi);
        expect(right.label).toBe(w.word);
      }
    }
  });
  it("speeds up each round with a cap", () => {
    expect(roundSpeed(1)).toBeGreaterThan(roundSpeed(0));
    expect(roundSpeed(50)).toBe(48);
  });
  it("refuses to start with no words", () => {
    expect(() => createGame([], vocabulary)).toThrow();
  });
});

describe("shooting", () => {
  it("hitting the correct chicken scores, counts as perfect and ends the round", () => {
    const { g, rng } = newGame();
    const right = correctChicken(g)!;
    shootAt(g, right.baseX, rng);
    expect(g.round.outcome).toBe("perfect");
    expect(g.score).toBeGreaterThanOrEqual(100);
    expect(g.combo).toBe(1);
    expect(g.lives).toBe(START_LIVES);
    expect(g.results).toEqual([{ wordId: g.targets[0]!.id, outcome: "perfect" }]);
    expect(g.hits).toBe(1);
    expect(g.shots).toBe(1);
  });

  it("a wrong chicken costs a life, resets combo and the round carries on", () => {
    const { g, rng } = newGame();
    g.combo = 3;
    const wrong = g.round.chickens.find((c) => !c.correct)!;
    shootAt(g, wrong.baseX, rng);
    expect(g.lives).toBe(START_LIVES - 1);
    expect(g.combo).toBe(0);
    expect(g.round.outcome).toBeNull();
    expect(g.round.wrongShots).toBe(1);
    expect(g.round.chickens.find((c) => c.id === wrong.id)?.state).toBe("wrong");
  });

  it("finding the right one after a miss is 'ok', worth less, and does not extend the combo", () => {
    const { g, rng } = newGame();
    const wrong = g.round.chickens.find((c) => !c.correct)!;
    shootAt(g, wrong.baseX, rng);
    g.ship.cooldown = 0;
    shootAt(g, correctChicken(g)!.baseX, rng);
    expect(g.round.outcome).toBe("ok");
    expect(g.combo).toBe(0);
    expect(g.score).toBeLessThan(160);
  });

  it("limits bullets in flight and respects the fire cooldown", () => {
    const { g, rng } = newGame();
    for (let i = 0; i < 10; i++) step(g, 0.001, fire, rng);
    expect(g.bullets.length).toBe(1);
    g.ship.cooldown = 0;
    g.round.y = 0;
    for (let i = 0; i < 6; i++) {
      g.ship.cooldown = 0;
      step(g, 0.001, fire, rng);
    }
    expect(g.bullets.length).toBeLessThanOrEqual(3);
  });

  it("a bullet only counts as a shot when it is actually fired", () => {
    const { g, rng } = newGame();
    step(g, 0.016, NO_INPUT, rng);
    expect(g.shots).toBe(0);
  });

  it("does not fire once the round is resolved", () => {
    const { g, rng } = newGame();
    shootAt(g, correctChicken(g)!.baseX, rng);
    const before = g.shots;
    g.ship.cooldown = 0;
    step(g, 0.016, fire, rng);
    expect(g.shots).toBe(before);
  });
});

describe("ship control", () => {
  it("keyboard moves the ship and clamps at the edges", () => {
    const { g, rng } = newGame();
    run(g, 5, rng, { move: -1, pointerX: null, fire: false });
    expect(g.ship.x).toBe(26);
    run(g, 5, rng, { move: 1, pointerX: null, fire: false });
    expect(g.ship.x).toBe(W - 26);
  });
  it("the pointer steers the ship toward it", () => {
    const { g, rng } = newGame();
    run(g, 1, rng, { move: 0, pointerX: 120, fire: false });
    expect(Math.abs(g.ship.x - 120)).toBeLessThan(1);
    run(g, 1, rng, { move: 0, pointerX: -500, fire: false });
    expect(g.ship.x).toBeGreaterThanOrEqual(26);
  });
});

describe("losing", () => {
  it("the flock reaching the player loses a life and marks the word missed", () => {
    const { g, rng } = newGame();
    g.round.y = INVADE_Y - 1;
    run(g, 0.2, rng);
    expect(g.lives).toBe(START_LIVES - 1);
    expect(g.round.outcome).toBe("missed");
    expect(g.results).toEqual([{ wordId: g.targets[0]!.id, outcome: "missed" }]);
    expect(g.combo).toBe(0);
  });

  it("an egg hit costs one life, then the ship is briefly invulnerable", () => {
    const { g, rng } = newGame();
    g.round.chickens.forEach((c) => (c.eggTimer = 99));
    g.eggs.push({ x: g.ship.x, y: SHIP_Y - 5 });
    step(g, 0.016, NO_INPUT, rng);
    expect(g.lives).toBe(START_LIVES - 1);
    expect(g.ship.invuln).toBeGreaterThan(1);
    g.eggs.push({ x: g.ship.x, y: SHIP_Y - 5 });
    step(g, 0.016, NO_INPUT, rng);
    expect(g.lives).toBe(START_LIVES - 1);
  });

  it("eggs that miss fall off screen and are removed", () => {
    const { g, rng } = newGame();
    g.round.chickens.forEach((c) => (c.eggTimer = 99));
    g.ship.x = 700;
    g.ship.targetX = 700;
    g.eggs.push({ x: 100, y: 300 });
    run(g, 3, rng);
    expect(g.eggs).toHaveLength(0);
    expect(g.lives).toBe(START_LIVES);
  });

  it("game ends when lives run out; the wrong-shot word is recorded as missed, an egg death records nothing", () => {
    const a = newGame();
    a.g.lives = 1;
    shootAt(a.g, a.g.round.chickens.find((c) => !c.correct)!.baseX, a.rng);
    expect(a.g.phase).toBe("lost");
    expect(a.g.results).toEqual([{ wordId: a.g.targets[0]!.id, outcome: "missed" }]);

    const b = newGame();
    b.g.lives = 1;
    b.g.round.chickens.forEach((c) => (c.eggTimer = 99));
    b.g.eggs.push({ x: b.g.ship.x, y: SHIP_Y - 5 });
    step(b.g, 0.016, NO_INPUT, b.rng);
    expect(b.g.phase).toBe("lost");
    expect(b.g.results).toEqual([]);
  });

  it("a finished game ignores further steps", () => {
    const { g, rng } = newGame();
    g.phase = "lost";
    const t = g.time;
    step(g, 0.016, fire, rng);
    expect(g.time).toBe(t);
  });
});

describe("a whole game", () => {
  it("advances through every word and wins after the last", () => {
    const { g, rng } = newGame(3);
    for (let i = 0; i < 3; i++) {
      expect(g.roundIndex).toBe(i);
      g.ship.cooldown = 0;
      shootAt(g, correctChicken(g)!.baseX, rng);
      expect(g.round.outcome).toBe("perfect");
      run(g, 1.3, rng);
    }
    expect(g.phase).toBe("won");
    expect(g.results.map((r) => r.outcome)).toEqual(["perfect", "perfect", "perfect"]);
    expect(g.maxCombo).toBe(3);
  });

  it("builds combo bonuses for consecutive perfect rounds", () => {
    const { g, rng } = newGame(4);
    const gains: number[] = [];
    for (let i = 0; i < 3; i++) {
      const before = g.score;
      g.ship.cooldown = 0;
      g.round.elapsed = 100; // no speed bonus, isolate the combo bonus
      shootAt(g, correctChicken(g)!.baseX, rng);
      gains.push(g.score - before);
      run(g, 1.3, rng);
    }
    expect(gains[0]).toBeLessThan(gains[1]!);
    expect(gains[1]).toBeLessThan(gains[2]!);
  });

  it("a flock left alone eventually costs a life each round without crashing", () => {
    const { g, rng } = newGame(3);
    run(g, 60, rng);
    expect(g.lives).toBeLessThan(START_LIVES);
    expect(["playing", "won", "lost"]).toContain(g.phase);
  });
});

describe("grades and word selection", () => {
  it("maps outcomes to SRS grades", () => {
    expect(gradeForOutcome("perfect")).toBe("good");
    expect(gradeForOutcome("ok")).toBe("hard");
    expect(gradeForOutcome("missed")).toBe("again");
  });

  const now = new Date(2026, 2, 10, 9);
  const later = new Date(2026, 2, 12, 9);

  it("a new learner gets new words within the daily budget, all scheduled", () => {
    const picked = pickShooterWords({}, vocabulary, now, seeded(3));
    expect(picked).toHaveLength(ROUNDS);
    expect(picked.every((p) => p.scheduled)).toBe(true);
    expect(new Set(picked.map((p) => p.word.id)).size).toBe(ROUNDS);
  });

  it("puts due words first in the pool and does not schedule early practice of learned words", () => {
    const srs: Record<string, ReturnType<typeof reviewCard>> = {};
    for (const w of vocabulary.slice(0, 15)) srs[w.id] = reviewCard(undefined, "good", now);
    const dueNow = pickShooterWords(srs, vocabulary, now, seeded(5));
    // Budget for today is used up (15 introduced) and nothing is due: only unscheduled review words.
    expect(dueNow).toHaveLength(ROUNDS);
    expect(dueNow.every((p) => !p.scheduled && srs[p.word.id])).toBe(true);
    const dueLater = pickShooterWords(srs, vocabulary, later, seeded(5));
    expect(dueLater.filter((p) => p.scheduled).length).toBe(ROUNDS);
  });

  it("never returns an empty list", () => {
    const srs: Record<string, ReturnType<typeof reviewCard>> = {};
    for (const w of vocabulary) srs[w.id] = reviewCard(undefined, "easy", now);
    expect(pickShooterWords(srs, vocabulary, now, seeded(1)).length).toBeGreaterThan(0);
  });
});

describe("geometry", () => {
  it("the flock is still on screen when it invades", () => {
    expect(INVADE_Y + CHICKEN_H / 2).toBeLessThan(SHIP_Y);
  });
});
