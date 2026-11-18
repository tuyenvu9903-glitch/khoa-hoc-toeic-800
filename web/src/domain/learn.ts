import type { VocabWord } from "../data/vocabulary";
import type { Grade } from "./srs";

export type Rng = () => number;
export type Direction = "en2vi" | "vi2en";

/** Fisher–Yates on a copy. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export function answerText(w: VocabWord, dir: Direction): string {
  return dir === "en2vi" ? w.meaningVi : w.word;
}

/**
 * Multiple choice options. Distractors prefer the same topic and part of speech so the
 * question is not solved by elimination, but are drawn from a wider pool so they vary.
 */
export function makeChoices(
  target: VocabWord,
  pool: readonly VocabWord[],
  dir: Direction,
  rng: Rng = Math.random,
  count = 4,
): { options: string[]; correctIndex: number } {
  const correct = answerText(target, dir);
  const seen = new Set([correct]);
  const candidates = shuffle(pool, rng).filter((w) => {
    const t = answerText(w, dir);
    if (w.id === target.id || seen.has(t)) return false;
    seen.add(t);
    return true;
  });
  const score = (w: VocabWord) => (w.topic === target.topic ? 2 : 0) + (w.pos === target.pos ? 1 : 0);
  const ranked = [...candidates].sort((a, b) => score(b) - score(a)).slice(0, (count - 1) * 3);
  const distractors = shuffle(ranked, rng).slice(0, count - 1).map((w) => answerText(w, dir));
  const options = shuffle([correct, ...distractors], rng);
  return { options, correctIndex: options.indexOf(correct) };
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length]![b.length]!;
}

export const normalizeTyped = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const norm = normalizeTyped;

/** "close" = one typo away (only for words of 5+ letters): the UI lets the learner retry once. */
export function matchTyped(input: string, answer: string): "exact" | "close" | "wrong" {
  const a = norm(input);
  const b = norm(answer);
  if (a === "") return "wrong";
  if (a === b) return "exact";
  return b.length >= 5 && levenshtein(a, b) === 1 ? "close" : "wrong";
}

/** Hide the target word in its example sentence (also catches simple inflections). */
export function blankExample(example: string, word: string): { text: string; blanked: boolean } {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exact = new RegExp(`\\b${esc(word)}\\b`, "i");
  if (exact.test(example)) return { text: example.replace(exact, "_____"), blanked: true };
  const stem = word.split(" ")[0]!.slice(0, Math.max(4, word.split(" ")[0]!.length - 2));
  const loose = new RegExp(`\\b${esc(stem)}\\w*`, "i");
  return loose.test(example)
    ? { text: example.replace(loose, "_____"), blanked: true }
    : { text: example, blanked: false };
}

/** Learn mode: every word passes 3 stages: EN→VI choice, VI→EN choice, then typing it. */
export type LearnStage = 0 | 1 | 2;
export type LearnItem = { id: string; stage: LearnStage; mistakes: number };
export type LearnState = {
  queue: LearnItem[];
  done: { id: string; mistakes: number }[];
  total: number;
};

export function initLearn(ids: readonly string[]): LearnState {
  return { queue: ids.map((id) => ({ id, stage: 0, mistakes: 0 })), done: [], total: ids.length };
}

function insertAt<T>(list: T[], item: T, pos: number): T[] {
  const i = Math.min(pos, list.length);
  return [...list.slice(0, i), item, ...list.slice(i)];
}

/** Apply the learner's answer to the current (first) item. */
export function answerLearn(s: LearnState, correct: boolean): LearnState {
  const [head, ...rest] = s.queue;
  if (!head) return s;
  if (correct) {
    if (head.stage === 2) {
      return { ...s, queue: rest, done: [...s.done, { id: head.id, mistakes: head.mistakes }] };
    }
    return { ...s, queue: insertAt(rest, { ...head, stage: (head.stage + 1) as LearnStage }, 3) };
  }
  return { ...s, queue: insertAt(rest, { ...head, mistakes: head.mistakes + 1 }, 2) };
}

/** Spaced-repetition grade earned by a word after learning it. */
export function gradeFromMistakes(mistakes: number): Grade {
  return mistakes === 0 ? "good" : mistakes === 1 ? "hard" : "again";
}

export function learnProgress(s: LearnState): number {
  if (s.total === 0) return 100;
  const stageDone = s.queue.reduce((n, i) => n + i.stage, 0) + s.done.length * 3;
  return Math.round((stageDone / (s.total * 3)) * 100);
}

/**
 * Shuffle a question's options and remap its answer index, so the right answer is not always
 * in the same position (content files may list the correct option first).
 */
export function shuffleOptions<T extends { options: readonly string[]; answer: number }>(item: T, rng: Rng = Math.random): T {
  const order = shuffle(item.options.map((_, i) => i), rng);
  return { ...item, options: order.map((i) => item.options[i]!) as unknown as T["options"], answer: order.indexOf(item.answer) };
}
