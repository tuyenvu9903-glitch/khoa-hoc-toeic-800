// Assembling exam papers from the question banks and day packs.
import { dayPacks } from "../data/dayPacks";
import { part2Items, part3Sets, part4Sets } from "../data/listening";
import { part5Items, part7Sets } from "../data/reading";
import { buildPaper, groupFromPart2, groupFromPart5, groupFromPart7, groupFromTalk, paperQuestions, type ExamPaper } from "../domain/exam";
import { shuffle } from "../domain/learn";
import { listeningUnlocked, part7BankUnlocked, unlockedGrammar } from "../domain/progress";
import { localDateKey, recordAnswer, type AppState } from "./state";

/** Real TOEIC pace for Reading: 75 minutes for 100 questions. */
const readingMinutes = (questions: number) => Math.max(5, Math.ceil(questions * 0.75));

/** The weekly mini test: only parts, skills and day packs already reached on `day`. */
export function buildMiniPaper(day: number): ExamPaper {
  const packs = dayPacks.filter((p) => p.day <= day);
  const skills = unlockedGrammar(day);
  const hasP3 = listeningUnlocked(day, "3");
  const p2 = shuffle([...part2Items, ...packs.flatMap((p) => p.part2)]).slice(0, hasP3 ? 5 : 8);
  const talks = hasP3 ? shuffle([...part3Sets, ...packs.flatMap((p) => (p.talk ? [p.talk] : []))]).slice(0, 1) : [];
  const p5 = shuffle([...part5Items.filter((i) => skills.has(i.skill)), ...packs.flatMap((p) => p.part5)]).slice(0, 6);
  const p7 = shuffle([...(part7BankUnlocked(day) ? part7Sets : []), ...packs.map((p) => p.part7)]).slice(0, 1);
  const readingQ = p5.length + p7.reduce((n, s) => n + s.questions.length, 0);
  return buildPaper(`mini-${day}`, `Mini test · Ngày ${day}`, [
    { kind: "listening", minutes: 6, groups: [...p2.map((i) => groupFromPart2(i)), ...talks.map((t) => groupFromTalk(t))] },
    { kind: "reading", minutes: readingMinutes(readingQ), groups: [...p5.map((i) => groupFromPart5(i)), ...p7.map((s) => groupFromPart7(s))] },
  ]);
}

/** A 50-question practice paper (half the length of each section's Parts 2–5 and 7). */
export function buildShortMock(): ExamPaper {
  const p2 = shuffle([...part2Items, ...dayPacks.flatMap((p) => p.part2)]).slice(0, 10);
  const p3 = shuffle([...part3Sets, ...dayPacks.flatMap((p) => (p.talk?.part === "3" ? [p.talk] : []))]).slice(0, 3);
  const p4 = shuffle([...part4Sets, ...dayPacks.flatMap((p) => (p.talk?.part === "4" ? [p.talk] : []))]).slice(0, 2);
  const p5 = shuffle([...part5Items, ...dayPacks.flatMap((p) => p.part5)]).slice(0, 15);
  const p7 = shuffle([...part7Sets, ...dayPacks.map((p) => p.part7)]).slice(0, 3);
  const readingQ = p5.length + p7.reduce((n, s) => n + s.questions.length, 0);
  return buildPaper("short-mock", "Đề thi thử rút gọn", [
    { kind: "listening", minutes: 20, groups: [...p2.map((i) => groupFromPart2(i)), ...p3.map((s) => groupFromTalk(s)), ...p4.map((s) => groupFromTalk(s))] },
    { kind: "reading", minutes: readingMinutes(readingQ), groups: [...p5.map((i) => groupFromPart5(i)), ...p7.map((s) => groupFromPart7(s))] },
  ]);
}

/**
 * Store a finished paper: every answer updates skill stats and the error log; mock tests also
 * save the estimated score so the Dashboard shows it as the current estimate.
 */
export function recordExam(
  state: AppState,
  paper: ExamPaper,
  answers: Record<string, number>,
  estimate: { listening: number; reading: number } | null,
  now: Date = new Date(),
): AppState {
  let s = state;
  for (const q of paperQuestions(paper)) {
    s = recordAnswer(
      s,
      {
        questionId: q.id,
        skillCode: q.skill,
        part: q.part,
        correct: answers[q.id] === q.answer,
        chosen: answers[q.id] !== undefined ? q.options[answers[q.id]!] : undefined,
        responseMs: 30_000,
        errorClass: Number(q.part) <= 4 ? "listening_gap" : q.part === "5" ? "grammar_gap" : "reading_gap",
      },
      now,
    );
  }
  if (estimate) {
    s = {
      ...s,
      scores: [
        ...s.scores,
        { at: now.toISOString(), listening: estimate.listening, reading: estimate.reading, total: estimate.listening + estimate.reading, source: `${paper.id}@${localDateKey(now)}` },
      ],
    };
  }
  return s;
}
