import type { VocabWord } from "../data/vocabulary";
import { matchTyped, normalizeTyped, type Rng } from "./learn";
import { CHICKEN_W, SHIP_Y, START_LIVES, W, type Fx, type RoundResult } from "./shooter";

// "Gõ từ": chickens carrying a Vietnamese meaning fall; typing the English word makes the ship shoot it.

/** Chicken centre y at which it lands and costs a life. */
export const LAND_Y = SHIP_Y - 96;
const SPAWN_Y = -40;
export const MAX_ACTIVE = 3;
const SPAWN_GAP = 3.4;
const SHOT_SPEED = 1100;
/** Fraction of the fall after which the first letter is revealed (and the word grades as "Khó"). */
export const HINT_AT = 0.55;
const END_DELAY = 1.0;
const LANES = [110, 290, 510, 690];

export type EnemyState = "alive" | "locked" | "right" | "wrong";
export type Enemy = {
  id: number;
  wordId: string;
  answer: string;
  label: string;
  x: number;
  y: number;
  speed: number;
  state: EnemyState;
  /** Seconds since the state changed (drives animations). */
  t: number;
  hint: string | null;
};
export type Shot = { x: number; y: number; targetId: number };

export type TypingGame = {
  phase: "playing" | "won" | "lost";
  targets: VocabWord[];
  nextIndex: number;
  spawnTimer: number;
  enemies: Enemy[];
  shots: Shot[];
  fx: Fx[];
  ship: { x: number; targetX: number };
  lives: number;
  score: number;
  combo: number;
  maxCombo: number;
  submits: number;
  wrongSubmits: number;
  results: RoundResult[];
  time: number;
  endTimer: number;
  nextId: number;
};

export type SubmitResult = "hit" | "close" | "wrong" | "empty";

export function fallSpeed(index: number): number {
  return Math.min(40, 22 + index * 2);
}

/** "s _ _ _ _ _ _ _" with spaces of multi-word answers kept as wider gaps. */
export function hintFor(answer: string): string {
  return answer
    .split(" ")
    .map((part, i) => part.split("").map((ch, j) => (i === 0 && j === 0 ? ch : "_")).join(" "))
    .join("   ");
}

export function createTypingGame(targets: VocabWord[]): TypingGame {
  if (targets.length === 0) throw new Error("createTypingGame needs at least one target word");
  return {
    phase: "playing",
    targets,
    nextIndex: 0,
    spawnTimer: 0,
    enemies: [],
    shots: [],
    fx: [],
    ship: { x: W / 2, targetX: W / 2 },
    lives: START_LIVES,
    score: 0,
    combo: 0,
    maxCombo: 0,
    submits: 0,
    wrongSubmits: 0,
    results: [],
    time: 0,
    endTimer: END_DELAY,
    nextId: 0,
  };
}

const active = (e: Enemy) => e.state === "alive" || e.state === "locked";

function addFx(g: TypingGame, x: number, y: number, text: string, color: string) {
  g.fx.push({ x, y, text, color, t: 0, ttl: 1.4 });
}

function spawn(g: TypingGame, rng: Rng): void {
  const word = g.targets[g.nextIndex]!;
  const busy = g.enemies.filter((e) => active(e) && e.y < LAND_Y * 0.6).map((e) => e.x);
  const free = LANES.filter((x) => busy.every((b) => Math.abs(b - x) >= CHICKEN_W));
  const lanes = free.length > 0 ? free : LANES;
  g.enemies.push({
    id: g.nextId++,
    wordId: word.id,
    answer: word.word,
    label: word.meaningVi,
    x: lanes[Math.floor(rng() * lanes.length)]!,
    y: SPAWN_Y,
    speed: fallSpeed(g.nextIndex),
    state: "alive",
    t: 0,
    hint: null,
  });
  g.nextIndex += 1;
  g.spawnTimer = SPAWN_GAP;
}

/** Alive enemies whose answer starts with what is typed so far (for highlighting). */
export function prefixTargets(g: TypingGame, typed: string): Set<number> {
  const t = normalizeTyped(typed);
  if (t === "") return new Set();
  return new Set(g.enemies.filter((e) => e.state === "alive" && normalizeTyped(e.answer).startsWith(t)).map((e) => e.id));
}

/**
 * True when the text exactly matches an alive enemy and no other alive enemy's longer answer
 * still starts with it, so the game can fire without waiting for Enter.
 */
export function shouldAutoFire(g: TypingGame, typed: string): boolean {
  const t = normalizeTyped(typed);
  if (t === "") return false;
  const alive = g.enemies.filter((e) => e.state === "alive");
  const exact = alive.some((e) => normalizeTyped(e.answer) === t);
  const longer = alive.some((e) => {
    const a = normalizeTyped(e.answer);
    return a !== t && a.startsWith(t);
  });
  return exact && !longer;
}

/** The player submitted a word. Mutates `g`. */
export function submitWord(g: TypingGame, typed: string): SubmitResult {
  if (g.phase !== "playing") return "empty";
  if (normalizeTyped(typed) === "") return "empty";
  g.submits += 1;
  const alive = g.enemies.filter((e) => e.state === "alive");
  const exact = alive.filter((e) => matchTyped(typed, e.answer) === "exact").sort((a, b) => b.y - a.y)[0];
  if (exact) {
    exact.state = "locked";
    exact.t = 0;
    g.ship.targetX = exact.x;
    g.shots.push({ x: g.ship.x, y: SHIP_Y - 26, targetId: exact.id });
    return "hit";
  }
  if (alive.some((e) => matchTyped(typed, e.answer) === "close")) return "close";
  g.wrongSubmits += 1;
  g.combo = 0;
  return "wrong";
}

function resolveHit(g: TypingGame, e: Enemy): void {
  e.state = "right";
  e.t = 0;
  const perfect = e.hint === null;
  const height = Math.max(0, 1 - (e.y - SPAWN_Y) / (LAND_Y - SPAWN_Y));
  const comboBonus = perfect ? Math.min(g.combo, 5) * 10 : 0;
  const gained = (perfect ? 100 : 50) + Math.round(height * 50) + comboBonus;
  g.score += gained;
  if (perfect) {
    g.combo += 1;
    g.maxCombo = Math.max(g.maxCombo, g.combo);
  } else g.combo = 0;
  addFx(g, e.x, e.y - 30, `+${gained}`, "#fde047");
  g.results.push({ wordId: e.wordId, outcome: perfect ? "perfect" : "ok" });
}

function land(g: TypingGame, e: Enemy): void {
  e.state = "wrong";
  e.t = 0;
  g.lives -= 1;
  g.combo = 0;
  g.results.push({ wordId: e.wordId, outcome: "missed" });
  addFx(g, e.x, e.y - 40, `${e.answer}  −1 ❤`, "#fb7185");
  // A shot still flying at it no longer matters.
  g.shots = g.shots.filter((s) => s.targetId !== e.id);
  if (g.lives <= 0) g.phase = "lost";
}

/** Advance the simulation by `dt` seconds. Mutates `g`. */
export function stepTyping(g: TypingGame, dtRaw: number, rng: Rng = Math.random): void {
  if (g.phase !== "playing") return;
  const dt = Math.min(Math.max(dtRaw, 0), 0.05);
  g.time += dt;
  g.ship.x += (g.ship.targetX - g.ship.x) * Math.min(1, dt * 10);

  // Spawn
  g.spawnTimer -= dt;
  const onScreen = g.enemies.filter(active).length;
  if (g.nextIndex < g.targets.length && onScreen < MAX_ACTIVE && (g.spawnTimer <= 0 || onScreen === 0)) {
    spawn(g, rng);
  }

  // Enemies
  for (const e of g.enemies) {
    e.t += dt;
    if (active(e)) {
      e.y += e.speed * dt;
      if (e.hint === null && (e.y - SPAWN_Y) / (LAND_Y - SPAWN_Y) >= HINT_AT) e.hint = hintFor(e.answer);
      if (e.y >= LAND_Y) {
        land(g, e);
        if (g.phase !== "playing") return;
      }
    } else if (e.state === "wrong") {
      e.y += 120 * dt;
    }
  }
  g.enemies = g.enemies.filter((e) => active(e) || e.t < 1.4);

  // Shots home in on their target.
  for (const s of [...g.shots]) {
    const target = g.enemies.find((e) => e.id === s.targetId && e.state === "locked");
    if (!target) {
      g.shots.splice(g.shots.indexOf(s), 1);
      continue;
    }
    const dx = target.x - s.x;
    const dy = target.y - s.y;
    const dist = Math.hypot(dx, dy);
    const move = SHOT_SPEED * dt;
    if (dist <= Math.max(move, 18)) {
      g.shots.splice(g.shots.indexOf(s), 1);
      resolveHit(g, target);
    } else {
      s.x += (dx / dist) * move;
      s.y += (dy / dist) * move;
    }
  }

  // Floating texts
  for (const f of g.fx) {
    f.t += dt;
    f.y -= 30 * dt;
  }
  g.fx = g.fx.filter((f) => f.t < f.ttl);

  // Win once every word has been resolved.
  if (g.nextIndex >= g.targets.length && !g.enemies.some(active) && g.shots.length === 0) {
    g.endTimer -= dt;
    if (g.endTimer <= 0) g.phase = "won";
  }
}
