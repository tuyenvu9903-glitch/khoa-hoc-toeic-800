// Look up any practice question by the id stored in the error log, across banks and day packs.
import { dayPacks } from "../data/dayPacks";
import { listeningSets, part2Items, type ListeningSet, type Part2Item } from "../data/listening";
import { part5Items, part7Sets, type Part5Item, type Part7Set } from "../data/reading";
import type { ScriptLine } from "./speech";

export type IndexedQuestion = {
  id: string;
  part: "2" | "3" | "4" | "5" | "7";
  skill: string;
  /** Printed question, or the spoken prompt for Part 2. */
  question: string;
  options: string[];
  answer: number;
  explainVi: string;
  /** Listening script or reading passage the question belongs to. */
  script?: ScriptLine[];
  passage?: { title: string; text: string };
};

function fromPart2(i: Part2Item): IndexedQuestion {
  return { id: i.id, part: "2", skill: i.skill, question: i.prompt, options: [...i.options], answer: i.answer, explainVi: i.explainVi };
}
function fromTalk(s: ListeningSet): IndexedQuestion[] {
  return s.questions.map((q, n) => ({
    id: `${s.id}-q${n + 1}`,
    part: s.part,
    skill: q.skill,
    question: q.question,
    options: [...q.options],
    answer: q.answer,
    explainVi: q.explainVi,
    script: s.lines,
  }));
}
function fromPart5(i: Part5Item): IndexedQuestion {
  return { id: i.id, part: "5", skill: i.skill, question: i.sentence, options: [...i.options], answer: i.answer, explainVi: i.explainVi };
}
function fromPart7(s: Part7Set): IndexedQuestion[] {
  return s.questions.map((q, n) => ({
    id: `${s.id}-q${n + 1}`,
    part: "7",
    skill: q.skill,
    question: q.question,
    options: [...q.options],
    answer: q.answer,
    explainVi: q.explainVi,
    passage: { title: s.title, text: s.passage },
  }));
}

const all: IndexedQuestion[] = [
  ...part2Items.map(fromPart2),
  ...listeningSets.flatMap(fromTalk),
  ...part5Items.map(fromPart5),
  ...part7Sets.flatMap(fromPart7),
  ...dayPacks.flatMap((p) => [
    ...p.part2.map(fromPart2),
    ...(p.talk ? fromTalk(p.talk) : []),
    ...p.part5.map(fromPart5),
    ...fromPart7(p.part7),
  ]),
];

export const questionById = new Map(all.map((q) => [q.id, q]));
