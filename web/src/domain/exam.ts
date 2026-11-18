// Exam engine model: papers made of listening/reading sections, scoring and score estimates.
import type { ListeningSet, Part2Item } from "../data/listening";
import type { Part5Item, Part7Set } from "../data/reading";
import type { ScriptLine } from "../lib/speech";
import { shuffleOptions, type Rng } from "./learn";

export type ExamPart = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export type ExamQuestion = {
  id: string;
  /** 1-based number within the paper, as printed on the answer sheet. */
  number: number;
  part: ExamPart;
  skill: string;
  /** Printed question text; null for Part 1/2 where only the letters are printed. */
  question: string | null;
  options: string[];
  answer: number;
  explainVi: string;
};

export type ExamGroup = {
  id: string;
  part: ExamPart;
  /** Listening: lines read aloud (also shown as the transcript after the test). */
  script?: ScriptLine[];
  /** Listening: a recorded MP3 under /audio/, used instead of speech synthesis when present. */
  audioSrc?: string;
  /** Reading: one or more passages (Part 6/7). */
  passages?: { title: string; text: string }[];
  questions: ExamQuestion[];
};

export type ExamSection = { kind: "listening" | "reading"; minutes: number; groups: ExamGroup[] };
export type ExamPaper = { id: string; title: string; sections: ExamSection[] };

/** Seconds given to answer after a listening group's audio ends (like the real test). */
export function answerWindowSeconds(group: { part: ExamPart; questions: readonly unknown[] }): number {
  return group.part === "1" || group.part === "2" ? 5 : 8 * group.questions.length;
}

// ------------------------------------------------------------------ building groups

type Draft = Omit<ExamQuestion, "number">;

const LETTERS = ["A", "B", "C", "D"];

export function groupFromPart2(item: Part2Item, rng: Rng = Math.random): Omit<ExamGroup, "questions"> & { questions: Draft[] } {
  const q = shuffleOptions(item, rng);
  return {
    id: item.id,
    part: "2",
    script: [
      { speaker: q.speakers[0], text: q.prompt },
      ...q.options.map((o, i) => ({ speaker: q.speakers[1], text: `${LETTERS[i]}. ${o}` })),
    ],
    questions: [{ id: item.id, part: "2", skill: item.skill, question: null, options: [...q.options], answer: q.answer, explainVi: item.explainVi }],
  };
}

export function groupFromTalk(set: ListeningSet, rng: Rng = Math.random): Omit<ExamGroup, "questions"> & { questions: Draft[] } {
  return {
    id: set.id,
    part: set.part,
    script: set.lines,
    questions: set.questions.map((raw, i) => {
      const q = shuffleOptions(raw, rng);
      return { id: `${set.id}-q${i + 1}`, part: set.part, skill: q.skill, question: q.question, options: [...q.options], answer: q.answer, explainVi: q.explainVi };
    }),
  };
}

export function groupFromPart5(item: Part5Item, rng: Rng = Math.random): Omit<ExamGroup, "questions"> & { questions: Draft[] } {
  const q = shuffleOptions(item, rng);
  return {
    id: item.id,
    part: "5",
    questions: [{ id: item.id, part: "5", skill: item.skill, question: item.sentence, options: [...q.options], answer: q.answer, explainVi: item.explainVi }],
  };
}

export function groupFromPart7(set: Part7Set, rng: Rng = Math.random): Omit<ExamGroup, "questions"> & { questions: Draft[] } {
  return {
    id: set.id,
    part: "7",
    passages: [{ title: set.title, text: set.passage }],
    questions: set.questions.map((raw, i) => {
      const q = shuffleOptions(raw, rng);
      return { id: `${set.id}-q${i + 1}`, part: "7", skill: q.skill, question: q.question, options: [...q.options], answer: q.answer, explainVi: q.explainVi };
    }),
  };
}

type DraftGroup = Omit<ExamGroup, "questions"> & { questions: Draft[] };

/** Number all questions in paper order. */
export function buildPaper(id: string, title: string, sections: { kind: "listening" | "reading"; minutes: number; groups: DraftGroup[] }[]): ExamPaper {
  let n = 0;
  return {
    id,
    title,
    sections: sections.map((s) => ({
      ...s,
      groups: s.groups.map((g) => ({ ...g, questions: g.questions.map((q) => ({ ...q, number: ++n })) })),
    })),
  };
}

export function paperQuestions(paper: ExamPaper): ExamQuestion[] {
  return paper.sections.flatMap((s) => s.groups.flatMap((g) => g.questions));
}

// ------------------------------------------------------------------ scoring

/**
 * Raw score (out of 100) → scaled score (5–495), per section. An approximation built from
 * commonly published conversion tables. It is NOT an official ETS conversion.
 */
const TABLE: Record<"listening" | "reading", [number, number][]> = {
  listening: [[0, 5], [10, 20], [20, 60], [30, 110], [40, 160], [50, 220], [60, 280], [70, 345], [80, 405], [90, 475], [96, 495], [100, 495]],
  reading: [[0, 5], [10, 15], [20, 50], [30, 95], [40, 145], [50, 200], [60, 260], [70, 320], [80, 380], [90, 440], [100, 495]],
};

export function estimateScaled(kind: "listening" | "reading", correct: number, total: number): number {
  if (total <= 0) return 5;
  const raw = Math.max(0, Math.min(100, (correct / total) * 100));
  const t = TABLE[kind];
  for (let i = 1; i < t.length; i++) {
    const [x0, y0] = t[i - 1]!;
    const [x1, y1] = t[i]!;
    if (raw <= x1) {
      const y = y0 + ((raw - x0) / (x1 - x0)) * (y1 - y0);
      return Math.max(5, Math.min(495, Math.round(y / 5) * 5));
    }
  }
  return 495;
}

export type SectionResult = { correct: number; total: number; estimated: number };
export type ExamResult = {
  listening: SectionResult | null;
  reading: SectionResult | null;
  byPart: Partial<Record<ExamPart, { correct: number; total: number }>>;
  answered: number;
};

export function scorePaper(paper: ExamPaper, answers: Record<string, number>): ExamResult {
  const byPart: ExamResult["byPart"] = {};
  const section = (kind: "listening" | "reading"): SectionResult | null => {
    const qs = paper.sections.filter((s) => s.kind === kind).flatMap((s) => s.groups.flatMap((g) => g.questions));
    if (qs.length === 0) return null;
    let correct = 0;
    for (const q of qs) {
      const p = (byPart[q.part] ??= { correct: 0, total: 0 });
      p.total += 1;
      if (answers[q.id] === q.answer) {
        p.correct += 1;
        correct += 1;
      }
    }
    return { correct, total: qs.length, estimated: estimateScaled(kind, correct, qs.length) };
  };
  const listening = section("listening");
  const reading = section("reading");
  const answered = paperQuestions(paper).filter((q) => answers[q.id] !== undefined).length;
  return { listening, reading, byPart, answered };
}
