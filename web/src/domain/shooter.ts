import type { VocabWord } from "../data/vocabulary";
import { makeChoices, shuffle, type Direction, type Rng } from "./learn";
import type { Grade, SrsCard } from "./srs";
import { isDue } from "./srs";
import { nextNewWords, vocabCounts } from "./vocabSession";

// ---- World (logical units; the canvas scales to fit)
export const W = 800;
export const H = 520;
export const SHIP_Y = H - 46;
export const SHIP_HALF = 26;
export const CHICKEN_W = 150;
export const CHICKEN_H = 96;
/** Formation centre y at which the flock reaches the player and the round is lost. */
export const INVADE_Y = 376;
export const ROUNDS = 10;
export const START_LIVES = 5;

const SHIP_SPEED = 440;
const BULLET_SPEED = 720;
const FIRE_COOLDOWN = 0.28;
const MAX_BULLETS = 3;
const EGG_SPEED = 170;
const INVULN_SEC = 1.6;
const PAUSE_SEC = 1.0;
const SWAY = 22;

export type ChickenState = "alive" | "wrong" | "right" | "flee";
export type Chicken = {
  id: number;
  baseX: number;
  offY: number;
  x: number;
  y: number;
  label: string;
  correct: boolean;
  state: ChickenState;
  /** Seconds since the state changed (drives animations). */
  t: number;
  eggTimer: number;
};
export type Bullet = { x: number; y: number };
export type Egg = { x: number; y: number };
export type Fx = { x: number; y: number; text: string; color: string; t: number; ttl: number };

export type RoundOutcome = "perfect" | "ok" | "missed";
export type RoundResult = { wordId: string; outcome: RoundOutcome };

export type Round = {
  wordId: string;
  dir: Direction;
  prompt: string;
  chickens: Chicken[];
  /** Formation centre y. */
  y: number;
  speed: number;
  elapsed: number;
  wrongShots: number;
  outcome: RoundOutcome | null;
  pause: number;
};

export type Game = {
  phase: "playing" | "won" | "lost";
  targets: VocabWord[];
  pool: readonly VocabWord[];
  roundIndex: number;
  round: Round;
  ship: { x: number; targetX: number; cooldown: number; invuln: number };
  bullets: Bullet[];
  eggs: Egg[];
  fx: Fx[];
  lives: number;
  score: number;
  combo: number;
  maxCombo: number;
  shots: number;
  hits: number;
  results: RoundResult[];
  time: number;
};

export type Input = {
  /** Keyboard direction. */
  move: -1 | 0 | 1;
  /** Pointer x in world units, or null when the pointer is not steering. */
  pointerX: number | null;
  /** A fire press happened since the last step. */
  fire: boolean;
};

export const NO_INPUT: Input = { move: 0, pointerX: null, fire: false };

export function roundSpeed(roundIndex: number): number {
  return Math.min(48, 24 + roundIndex * 2.4);
}

function createRound(g: Pick<Game, "targets" | "pool">, index: number, rng: Rng): Round {
  const target = g.targets[index]!;
  const dir: Direction = rng() < 0.5 ? "en2vi" : "vi2en";
  const { options, correctIndex } = makeChoices(target, g.pool, dir, rng, 4);
  const n = options.length;
  const chickens: Chicken[] = options.map((label, i) => {
    const baseX = n === 1 ? W / 2 : 110 + (i * (W - 220)) / (n - 1);
    return {
      id: i,
      baseX,
      offY: i % 2 === 0 ? 0 : -18,
      x: baseX,
      y: -60,
      label,
      correct: i === correctIndex,
      state: "alive",
      t: 0,
      eggTimer: 3 + rng() * 5,
    };
  });
  return {
    wordId: target.id,
    dir,
    prompt: dir === "en2vi" ? target.word : target.meaningVi,
    chickens,
    y: -60,
    speed: roundSpeed(index),
    elapsed: 0,
    wrongShots: 0,
    outcome: null,
    pause: 0,
  };
}

export function createGame(targets: VocabWord[], pool: readonly VocabWord[], rng: Rng = Math.random): Game {
  if (targets.length === 0) throw new Error("createGame needs at least one target word");
  const base = { targets, pool };
  return {
    phase: "playing",
    ...base,
    roundIndex: 0,
    round: createRound(base, 0, rng),
    ship: { x: W / 2, targetX: W / 2, cooldown: 0, invuln: 0 },
    bullets: [],
    eggs: [],
    fx: [],
    lives: START_LIVES,
    score: 0,
    combo: 0,
    maxCombo: 0,
    shots: 0,
    hits: 0,
    results: [],
    time: 0,
  };
}

export function correctChicken(g: Game): Chicken | undefined {
  return g.round.chickens.find((c) => c.correct);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function addFx(g: Game, x: number, y: number, text: string, color: string) {
  g.fx.push({ x, y, text, color, t: 0, ttl: 1.1 });
}

function loseLife(g: Game, cause: "wrong" | "invade" | "egg"): void {
  g.lives -= 1;
  g.combo = 0;
  if (g.lives > 0) return;
  g.phase = "lost";
  if (g.round.outcome === null && cause !== "egg") {
    g.round.outcome = "missed";
    g.results.push({ wordId: g.round.wordId, outcome: "missed" });
  }
}

function resolveRound(g: Game, outcome: RoundOutcome): void {
  const r = g.round;
  r.outcome = outcome;
  r.pause = PAUSE_SEC;
  g.results.push({ wordId: r.wordId, outcome });
  for (const c of r.chickens) if (c.state === "alive" && !c.correct) {
    c.state = "flee";
    c.t = 0;
  }
}

/** Advance the simulation by `dt` seconds. Mutates `g`. */
export function step(g: Game, dtRaw: number, input: Input, rng: Rng = Math.random): void {
  if (g.phase !== "playing") return;
  const dt = Math.min(Math.max(dtRaw, 0), 0.05);
  g.time += dt;
  const { ship, round } = g;

  // Ship
  if (input.pointerX !== null) {
    ship.targetX = clamp(input.pointerX, SHIP_HALF, W - SHIP_HALF);
    ship.x += (ship.targetX - ship.x) * Math.min(1, dt * 18);
  } else {
    ship.x = clamp(ship.x + input.move * SHIP_SPEED * dt, SHIP_HALF, W - SHIP_HALF);
    ship.targetX = ship.x;
  }
  ship.cooldown = Math.max(0, ship.cooldown - dt);
  ship.invuln = Math.max(0, ship.invuln - dt);
  if (input.fire && ship.cooldown === 0 && g.bullets.length < MAX_BULLETS && round.outcome === null) {
    g.bullets.push({ x: ship.x, y: SHIP_Y - 26 });
    ship.cooldown = FIRE_COOLDOWN;
    g.shots += 1;
  }

  // Bullets
  for (const b of g.bullets) b.y -= BULLET_SPEED * dt;
  g.bullets = g.bullets.filter((b) => b.y > -20);

  // Flock
  round.elapsed += dt;
  if (round.outcome === null) round.y += round.speed * dt;
  for (const c of round.chickens) {
    c.t += dt;
    if (c.state === "alive") {
      c.x = c.baseX + Math.sin(round.elapsed * 1.3 + c.id * 1.7) * SWAY;
      c.y = round.y + c.offY;
      c.eggTimer -= dt;
      if (c.eggTimer <= 0) {
        c.eggTimer = 4 + rng() * 4;
        if (c.y > 30 && c.y < INVADE_Y - 40 && round.outcome === null) {
          g.eggs.push({ x: c.x, y: c.y + CHICKEN_H / 2 });
        }
      }
    } else if (c.state === "wrong") {
      c.y += 380 * dt;
    } else if (c.state === "flee") {
      c.y -= 320 * dt;
    }
  }
  round.chickens = round.chickens.filter((c) => c.y > -160 && c.y < H + 120);

  // Bullet vs chicken
  if (round.outcome === null) {
    for (const b of [...g.bullets]) {
      const hit = round.chickens.find(
        (c) => c.state === "alive" && Math.abs(b.x - c.x) <= CHICKEN_W / 2 && Math.abs(b.y - c.y) <= CHICKEN_H / 2,
      );
      if (!hit) continue;
      g.bullets.splice(g.bullets.indexOf(b), 1);
      hit.t = 0;
      if (hit.correct) {
        hit.state = "right";
        g.hits += 1;
        const perfect = round.wrongShots === 0;
        const speedBonus = Math.max(0, Math.round(((8 - round.elapsed) / 8) * 50));
        const comboBonus = perfect ? Math.min(g.combo, 5) * 10 : 0;
        const gained = (perfect ? 100 : 60) + speedBonus + comboBonus;
        g.score += gained;
        if (perfect) {
          g.combo += 1;
          g.maxCombo = Math.max(g.maxCombo, g.combo);
        }
        addFx(g, hit.x, hit.y, `+${gained}`, "#fde047");
        resolveRound(g, perfect ? "perfect" : "ok");
      } else {
        hit.state = "wrong";
        round.wrongShots += 1;
        addFx(g, hit.x, hit.y, "−1 ❤", "#fb7185");
        loseLife(g, "wrong");
      }
      if (g.phase !== "playing") return;
      if (round.outcome !== null) break;
    }
  }

  // The flock reached the player.
  if (round.outcome === null && round.y >= INVADE_Y) {
    addFx(g, W / 2, INVADE_Y, "Gà đáp xuống! −1 ❤", "#fb7185");
    resolveRound(g, "missed");
    loseLife(g, "invade");
    // loseLife saw the round already resolved, so record nothing twice.
    if (g.phase !== "playing") return;
  }

  // Eggs
  for (const e of g.eggs) e.y += EGG_SPEED * dt;
  for (const e of [...g.eggs]) {
    if (ship.invuln === 0 && Math.abs(e.x - ship.x) <= SHIP_HALF + 4 && Math.abs(e.y - SHIP_Y) <= 26) {
      g.eggs.splice(g.eggs.indexOf(e), 1);
      ship.invuln = INVULN_SEC;
      addFx(g, ship.x, SHIP_Y - 30, "Trúng trứng! −1 ❤", "#fb7185");
      loseLife(g, "egg");
      if (g.phase !== "playing") return;
    }
  }
  g.eggs = g.eggs.filter((e) => e.y < H + 20);

  // Floating texts
  for (const f of g.fx) {
    f.t += dt;
    f.y -= 36 * dt;
  }
  g.fx = g.fx.filter((f) => f.t < f.ttl);

  // Next round
  if (round.outcome !== null) {
    round.pause -= dt;
    if (round.pause <= 0) {
      if (g.roundIndex + 1 >= g.targets.length) {
        g.phase = "won";
        return;
      }
      g.roundIndex += 1;
      g.round = createRound(g, g.roundIndex, rng);
      g.bullets = [];
      g.eggs = [];
    }
  }
}

/** SRS grade earned by a round's outcome. */
export function gradeForOutcome(o: RoundOutcome): Grade {
  return o === "perfect" ? "good" : o === "ok" ? "hard" : "again";
}

export type ShooterTarget = { word: VocabWord; scheduled: boolean };

/**
 * Words for a session: due reviews first, then new words (within today's new-word budget),
 * then already-learned words to fill up. Only due/new words are scheduled by the result;
 * practising an already-scheduled word early must not inflate its interval.
 */
export function pickShooterWords(
  srs: Record<string, SrsCard>,
  words: readonly VocabWord[],
  now: Date,
  rng: Rng = Math.random,
  n = ROUNDS,
): ShooterTarget[] {
  const all = [...words];
  const due = all
    .filter((w) => srs[w.id] && isDue(srs[w.id]!, now))
    .sort((a, b) => Date.parse(srs[a.id]!.nextReviewAt) - Date.parse(srs[b.id]!.nextReviewAt))
    .slice(0, n);
  const budget = vocabCounts(srs, all, now).newAvailable;
  const fresh = nextNewWords(srs, all).slice(0, Math.min(budget, n - due.length));
  const taken = new Set([...due, ...fresh].map((w) => w.id));
  const fill = shuffle(
    all.filter((w) => srs[w.id] && !taken.has(w.id)),
    rng,
  ).slice(0, n - due.length - fresh.length);
  const scheduled = new Set([...due, ...fresh].map((w) => w.id));
  const picked = shuffle([...due, ...fresh, ...fill], rng);
  const result = picked.map((word) => ({ word, scheduled: scheduled.has(word.id) }));
  return result.length > 0
    ? result
    : shuffle(all, rng).slice(0, n).map((word) => ({ word, scheduled: false }));
}
