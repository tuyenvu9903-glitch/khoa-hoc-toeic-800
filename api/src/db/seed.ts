import { createDb, createSql } from "./client.js";
import { curriculumDays, curriculumWeeks, missionTemplates, skills } from "./schema.js";

const sql = createSql();
const db = createDb(sql);

const skillRows: (typeof skills.$inferInsert)[] = [
  { code: "L", name: "Listening", category: "listening", importance: 1.2 },
  { code: "L.P1", name: "Part 1 Photo", category: "listening", part: "1", parentCode: "L", importance: 0.6 },
  { code: "L.P1.people", name: "Photo people", category: "listening", part: "1", parentCode: "L.P1", importance: 0.5 },
  { code: "L.P1.action", name: "Photo action", category: "listening", part: "1", parentCode: "L.P1", importance: 0.5 },
  { code: "L.P2", name: "Part 2 Question-Response", category: "listening", part: "2", parentCode: "L", importance: 1.1 },
  { code: "L.P2.who", name: "QR Who", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.what", name: "QR What", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.where", name: "QR Where", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.when", name: "QR When", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.why", name: "QR Why", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.how", name: "QR How", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.yesno", name: "QR Yes/No", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P2.choice", name: "QR Choice", category: "listening", part: "2", parentCode: "L.P2", importance: 1 },
  { code: "L.P3", name: "Part 3 Conversation", category: "listening", part: "3", parentCode: "L", importance: 1.4 },
  { code: "L.P3.purpose", name: "P3 Main purpose", category: "listening", part: "3", parentCode: "L.P3", importance: 1.4 },
  { code: "L.P3.detail", name: "P3 Detail", category: "listening", part: "3", parentCode: "L.P3", importance: 1.2 },
  { code: "L.P3.inference", name: "P3 Inference", category: "listening", part: "3", parentCode: "L.P3", importance: 1.5 },
  { code: "L.P3.paraphrase", name: "P3 Paraphrase", category: "listening", part: "3", parentCode: "L.P3", importance: 1.5 },
  { code: "L.P3.next", name: "P3 Next action", category: "listening", part: "3", parentCode: "L.P3", importance: 1.3 },
  { code: "L.P4", name: "Part 4 Talk", category: "listening", part: "4", parentCode: "L", importance: 1.4 },
  { code: "L.P4.purpose", name: "P4 Main purpose", category: "listening", part: "4", parentCode: "L.P4", importance: 1.4 },
  { code: "L.P4.detail", name: "P4 Detail", category: "listening", part: "4", parentCode: "L.P4", importance: 1.2 },
  { code: "L.P4.inference", name: "P4 Inference", category: "listening", part: "4", parentCode: "L.P4", importance: 1.5 },
  { code: "R", name: "Reading", category: "reading", importance: 1.2 },
  { code: "R.P5", name: "Part 5 Incomplete sentences", category: "reading", part: "5", parentCode: "R", importance: 1.2 },
  { code: "R.P5.sva", name: "Subject-verb agreement", category: "grammar", part: "5", parentCode: "R.P5", importance: 1.1 },
  { code: "R.P5.tense", name: "Tenses", category: "grammar", part: "5", parentCode: "R.P5", importance: 1.1 },
  { code: "R.P5.wordform", name: "Word forms", category: "grammar", part: "5", parentCode: "R.P5", importance: 1.5 },
  { code: "R.P5.prep", name: "Prepositions", category: "grammar", part: "5", parentCode: "R.P5", importance: 1.2 },
  { code: "R.P5.conj", name: "Conjunctions", category: "grammar", part: "5", parentCode: "R.P5", importance: 1 },
  { code: "R.P5.gerund", name: "Gerund / infinitive", category: "grammar", part: "5", parentCode: "R.P5", importance: 1.1 },
  { code: "R.P5.passive", name: "Passive voice", category: "grammar", part: "5", parentCode: "R.P5", importance: 1 },
  { code: "R.P6", name: "Part 6 Text completion", category: "reading", part: "6", parentCode: "R", importance: 1.2 },
  { code: "R.P6.insert", name: "Sentence insertion", category: "reading", part: "6", parentCode: "R.P6", importance: 1.3 },
  { code: "R.P7", name: "Part 7 Passages", category: "reading", part: "7", parentCode: "R", importance: 1.5 },
  { code: "R.P7.inference", name: "P7 Inference", category: "reading", part: "7", parentCode: "R.P7", importance: 1.6 },
  { code: "R.P7.detail", name: "P7 Detail", category: "reading", part: "7", parentCode: "R.P7", importance: 1.2 },
  { code: "R.P7.paraphrase", name: "P7 Paraphrase", category: "reading", part: "7", parentCode: "R.P7", importance: 1.5 },
  { code: "R.P7.double", name: "Double passages", category: "reading", part: "7", parentCode: "R.P7", importance: 1.4 },
  { code: "R.P7.triple", name: "Triple passages", category: "reading", part: "7", parentCode: "R.P7", importance: 1.5 },
  { code: "V.paraphrase", name: "Vocabulary paraphrase", category: "vocabulary", importance: 1.4 },
  { code: "S.time", name: "Time management", category: "timing", importance: 1.3 },
];

const weeks: (typeof curriculumWeeks.$inferInsert)[] = [
  {
    weekNumber: 1,
    title: "Diagnostic + Foundation",
    theme: "Placement, format, core grammar and vocab, Parts 1/2/5",
    learningRatio: 0.3,
    practiceRatio: 0.7,
    weekendGate: "Mini Test",
  },
  {
    weekNumber: 2,
    title: "Grammar + Part 2 + Part 5",
    theme: "SVA, tenses, word forms, QR patterns",
    learningRatio: 0.3,
    practiceRatio: 0.7,
    weekendGate: "Part 2 + Part 5 Test",
  },
  {
    weekNumber: 3,
    title: "Part 3 + Part 4",
    theme: "Conversations and talks",
    learningRatio: 0.3,
    practiceRatio: 0.7,
    weekendGate: "Listening Half Test",
  },
  {
    weekNumber: 4,
    title: "Part 6 + Part 7",
    theme: "Reading passages and time management",
    learningRatio: 0.3,
    practiceRatio: 0.7,
    weekendGate: "Reading Half Test",
  },
  {
    weekNumber: 5,
    title: "Paraphrase + Advanced TOEIC",
    theme: "Paraphrase across L/R, Full Mock #1",
    learningRatio: 0.2,
    practiceRatio: 0.8,
    weekendGate: "Full Mock Test #1",
  },
  {
    weekNumber: 6,
    title: "Weakness Elimination",
    theme: "Adaptive drills from error log, Full Mock #2",
    learningRatio: 0.2,
    practiceRatio: 0.8,
    weekendGate: "Full Mock Test #2",
  },
  {
    weekNumber: 7,
    title: "700 → 800 Training",
    theme: "Hard items, distractors, time pressure, Full Mock #3",
    learningRatio: 0.2,
    practiceRatio: 0.8,
    weekendGate: "Full Mock Test #3",
  },
  {
    weekNumber: 8,
    title: "Exam Simulation",
    theme: "Full tests, error review, readiness report",
    learningRatio: 0.2,
    practiceRatio: 0.8,
    weekendGate: "Final Full Test + Readiness Report",
  },
];

const dayFocus: Record<number, string> = {
  1: "Placement + format + Parts 1/2/5 foundation",
  2: "QR patterns + grammar + Parts 2/5",
  3: "Conversations and talks",
  4: "Reading 6/7",
  5: "Paraphrase + advanced mixed",
  6: "Weakness training",
  7: "Hard items under time",
  8: "Exam simulation cycle",
};

const days: (typeof curriculumDays.$inferInsert)[] = Array.from({ length: 56 }, (_, i) => {
  const dayNumber = i + 1;
  const weekNumber = Math.ceil(dayNumber / 7);
  return {
    dayNumber,
    weekNumber,
    title: `Day ${dayNumber}`,
    focus: dayFocus[weekNumber] ?? "Practice",
  };
});

const missionKinds = [
  { kind: "vocab" as const, title: "Vocabulary", itemCount: 25, minutes: 20, sortOrder: 1 },
  { kind: "grammar" as const, title: "Grammar", itemCount: 15, minutes: 20, sortOrder: 2 },
  { kind: "listening" as const, title: "Listening", itemCount: 25, minutes: 35, sortOrder: 3 },
  { kind: "reading" as const, title: "Reading", itemCount: 25, minutes: 40, sortOrder: 4 },
  { kind: "error_review" as const, title: "Error review", itemCount: 10, minutes: 15, sortOrder: 5 },
  { kind: "mini_test" as const, title: "Mini test", itemCount: 15, minutes: 20, sortOrder: 6 },
];

await db.delete(missionTemplates);
await db.delete(curriculumDays);
await db.delete(curriculumWeeks);
await db.delete(skills);

await db.insert(skills).values(skillRows);
await db.insert(curriculumWeeks).values(weeks);
await db.insert(curriculumDays).values(days);
await db.insert(missionTemplates).values(
  weeks.flatMap((week) =>
    missionKinds.map((m) => ({
      weekNumber: week.weekNumber,
      ...m,
    })),
  ),
);

console.log(`Seeded ${skillRows.length} skills, 8 weeks, 56 days.`);
await sql.end();
