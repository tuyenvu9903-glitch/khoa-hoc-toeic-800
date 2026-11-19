import { z } from "zod";
import { errorClassSchema, toeicPartSchema } from "../domain/question";
import { advanceProgress, studyAhead, DAY_TEST_PASS, initialProgress, markDayKindDone, markKindDone, VOCAB_TEST } from "../domain/progress";
import { reviewCard, type Grade } from "../domain/srs";

export const STORAGE_KEY = "toeic800.state";
export const STATE_VERSION = 1;

const isoDate = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

export const stateSchema = z.object({
  version: z.literal(STATE_VERSION),
  profile: z
    .object({
      displayName: z.string().min(1).max(80),
      targetScore: z.number().int().min(10).max(990),
      dailyMinutesTarget: z.number().int().min(15).max(600),
      programStartDate: isoDate,
      placementCompletedAt: isoDate.nullable(),
      estimatedListening: z.number().int().min(5).max(495),
      estimatedReading: z.number().int().min(5).max(495),
    })
    .nullable(),
  skillStats: z.record(
    z.string(),
    z.object({
      attempts: z.number().int().min(0),
      correct: z.number().int().min(0),
      accuracyEma: z.number().min(0).max(1),
      avgResponseMs: z.number().min(0),
      lastPracticedAt: isoDate.nullable(),
      mastered: z.boolean(),
    }),
  ),
  errors: z.array(
    z.object({
      id: z.string(),
      questionId: z.string(),
      skillCode: z.string(),
      part: toeicPartSchema,
      errorClass: errorClassSchema,
      createdAt: isoDate,
      resolvedAt: isoDate.nullable(),
      /** Text of the option the learner chose (absent in older saves). */
      chosen: z.string().optional(),
      /** When the mistake is next due for review in the error notebook. */
      reviewAt: isoDate.optional(),
      /** Failed retries so far; spaces out the next review. */
      retries: z.number().int().min(0).optional(),
    }),
  ),
  scores: z.array(
    z.object({
      at: isoDate,
      listening: z.number().int(),
      reading: z.number().int(),
      total: z.number().int(),
      source: z.string(),
    }),
  ),
  /** Vocabulary spaced-repetition cards, keyed by word id. Absent in older backups. */
  srs: z
    .record(
      z.string(),
      z.object({
        ease: z.number().min(1.3).max(3.5),
        intervalDays: z.number().int().min(0),
        repetitions: z.number().int().min(0),
        lapses: z.number().int().min(0),
        introducedAt: isoDate,
        nextReviewAt: isoDate,
        lastReviewedAt: isoDate.nullable(),
        lastGrade: z.enum(["again", "hard", "good", "easy"]).nullable(),
      }),
    )
    .default({}),
  /** Best "Gõ từ" score. */
  typingBest: z.number().int().min(0).nullable().default(null),
  /** Best "Bắn gà" score. */
  shooterBest: z.number().int().min(0).nullable().default(null),
  /** Mission items ticked off, keyed by local date (YYYY-MM-DD). Drives the streak. */
  missionDone: z.record(z.string(), z.array(z.string())),
  /** Day-by-day progression: the current day only advances after it is completed. */
  progress: z
    .object({
      day: z.number().int().min(1).max(56),
      dayStartedOn: z.string().nullable(),
      done: z.record(z.string(), z.array(z.string())),
    })
    .default(initialProgress),
  /** Best score (%) of each day's vocabulary test, keyed by program day. Absent in older saves. */
  dayTests: z.record(z.string(), z.number().min(0).max(100)).default({}),
  /** Voice and celebration preferences. Absent in older saves. */
  prefs: z
    .object({
      humor: z.enum(["off", "chill", "normal", "max"]).default("normal"),
      celebrations: z.boolean().default(true),
      /** Tám reads reactions aloud (recorded voice). */
      mascotVoice: z.boolean().default(true),
      /** Background music in the vocabulary games. */
      music: z.boolean().default(true),
      musicStyle: z.enum(["remix", "piano", "mine"]).default("remix"),
    })
    .default(() => ({ humor: "normal" as const, celebrations: true, mascotVoice: true, music: true, musicStyle: "remix" as const })),
  /** XP, badges and quest counters. Absent in older saves. */
  game: z
    .object({
      xp: z.number().int().min(0).default(0),
      /** Idempotency keys of one-off rewards (mission of a date, quest of a date, weekly challenge). */
      awarded: z.record(z.string(), z.number()).default({}),
      /** Badge id -> unlock time. */
      badges: z.record(z.string(), isoDate).default({}),
      daily: z
        .object({
          date: z.string(),
          answered: z.number().int().min(0),
          correct: z.number().int().min(0),
          listening: z.number().int().min(0),
          reading: z.number().int().min(0),
          words: z.number().int().min(0),
          fixed: z.number().int().min(0),
          practiceXp: z.number().int().min(0),
        })
        .nullable()
        .default(null),
      weekly: z
        .object({
          week: z.string(),
          answered: z.number().int().min(0),
          correct: z.number().int().min(0),
          words: z.number().int().min(0),
        })
        .nullable()
        .default(null),
    })
    .default(() => emptyGame()),
});

export function emptyGame() {
  return { xp: 0, awarded: {}, badges: {}, daily: null, weekly: null };
}

export type AppState = z.infer<typeof stateSchema>;
export type Profile = NonNullable<AppState["profile"]>;

export function emptyState(): AppState {
  return { version: STATE_VERSION, profile: null, skillStats: {}, errors: [], scores: [], srs: {}, shooterBest: null, typingBest: null, missionDone: {}, progress: initialProgress(), dayTests: {}, prefs: { humor: "normal", celebrations: true, mascotVoice: true, music: true, musicStyle: "remix" }, game: emptyGame() };
}

/** Validate untrusted JSON (storage or an imported backup). Throws a readable error. */
export function parseState(raw: unknown): AppState {
  const result = stateSchema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first ? `${first.path.join(".") || "file"}: ${first.message}` : "invalid state");
  }
  return result.data;
}

export function createProfile(
  state: AppState,
  input: { displayName: string; targetScore: number; dailyMinutesTarget: number },
  now: Date = new Date(),
): AppState {
  return {
    ...state,
    profile: {
      displayName: input.displayName.trim(),
      targetScore: input.targetScore,
      dailyMinutesTarget: input.dailyMinutesTarget,
      programStartDate: now.toISOString(),
      placementCompletedAt: null,
      estimatedListening: 200,
      estimatedReading: 200,
    },
  };
}

export function toggleMissionItem(state: AppState, dateKey: string, kind: string): AppState {
  const current = state.missionDone[dateKey] ?? [];
  const next = current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind];
  return { ...state, missionDone: { ...state.missionDone, [dateKey]: next } };
}

/** Restart the 8 weeks from `now`, keeping scores, error log and skill stats. */
export function restartProgram(state: AppState, now: Date = new Date()): AppState {
  if (!state.profile) return state;
  return {
    ...state,
    profile: { ...state.profile, programStartDate: now.toISOString() },
    missionDone: {},
    progress: { ...initialProgress(), dayStartedOn: localDateKey(now) },
  };
}

export function localDateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function gradeVocab(state: AppState, wordId: string, grade: Grade, now: Date = new Date()): AppState {
  return { ...state, srs: { ...state.srs, [wordId]: reviewCard(state.srs[wordId], grade, now) } };
}

export type AnswerRecord = {
  questionId: string;
  skillCode: string;
  part: z.infer<typeof toeicPartSchema>;
  correct: boolean;
  responseMs: number;
  errorClass?: z.infer<typeof errorClassSchema>;
  /** Text of the chosen option, kept for the error notebook. */
  chosen?: string;
};

/** Days until a mistake comes back, after 1, 2, 3+ failed retries. */
const RETRY_DAYS = [1, 3, 7];
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000).toISOString();

const EMA_ALPHA = 0.25;

/**
 * Update the skill's stats with one answered question. A wrong answer opens an entry in the
 * error log (once per question); a later correct answer to the same question resolves it.
 */
export function recordAnswer(state: AppState, a: AnswerRecord, now: Date = new Date()): AppState {
  const prev = state.skillStats[a.skillCode];
  const hit = a.correct ? 1 : 0;
  const stat = prev
    ? {
        ...prev,
        attempts: prev.attempts + 1,
        correct: prev.correct + hit,
        accuracyEma: prev.accuracyEma + EMA_ALPHA * (hit - prev.accuracyEma),
        avgResponseMs: prev.avgResponseMs + EMA_ALPHA * (a.responseMs - prev.avgResponseMs),
        lastPracticedAt: now.toISOString(),
      }
    : {
        attempts: 1,
        correct: hit,
        accuracyEma: hit,
        avgResponseMs: a.responseMs,
        lastPracticedAt: now.toISOString(),
        mastered: false,
      };
  const open = state.errors.some((e) => e.questionId === a.questionId && e.resolvedAt === null);
  let errors = state.errors;
  if (!a.correct && !open) {
    errors = [
      ...errors,
      {
        id: `${a.questionId}@${now.getTime()}`,
        questionId: a.questionId,
        skillCode: a.skillCode,
        part: a.part,
        errorClass: a.errorClass ?? "listening_gap",
        createdAt: now.toISOString(),
        resolvedAt: null,
        chosen: a.chosen,
        reviewAt: now.toISOString(),
        retries: 0,
      },
    ];
  } else if (!a.correct && open) {
    errors = errors.map((e) => {
      if (e.questionId !== a.questionId || e.resolvedAt !== null) return e;
      const retries = (e.retries ?? 0) + 1;
      return { ...e, chosen: a.chosen ?? e.chosen, retries, reviewAt: addDays(now, RETRY_DAYS[Math.min(retries, RETRY_DAYS.length) - 1]!) };
    });
  } else if (a.correct && open) {
    errors = errors.map((e) =>
      e.questionId === a.questionId && e.resolvedAt === null ? { ...e, resolvedAt: now.toISOString() } : e,
    );
  }
  return { ...state, skillStats: { ...state.skillStats, [a.skillCode]: stat }, errors };
}

/**
 * Tick a mission item on (never off), e.g. when a practice session is completed. It counts for
 * today's date (streak) and for the current program day (progression).
 */
/**
 * Record a day's vocabulary test: each answer grades its word (right = Good, wrong = Again), the
 * best score is kept, and a pass (DAY_TEST_PASS % or more) marks that day's vocabulary as tested.
 */
export function recordDayTest(
  state: AppState,
  day: number,
  results: readonly { wordId: string; correct: boolean }[],
  now: Date = new Date(),
): { state: AppState; percent: number; passed: boolean } {
  const right = results.filter((r) => r.correct).length;
  const percent = results.length === 0 ? 0 : Math.round((right * 100) / results.length);
  const passed = results.length > 0 && percent >= DAY_TEST_PASS;
  let s = state;
  for (const r of results) s = gradeVocab(s, r.wordId, r.correct ? "good" : "again", now);
  const key = String(day);
  s = { ...s, dayTests: { ...s.dayTests, [key]: Math.max(s.dayTests[key] ?? 0, percent) } };
  if (passed) {
    s = { ...s, progress: markDayKindDone(s.progress, day, VOCAB_TEST) };
    if (day === s.progress.day) s = markMissionDone(s, localDateKey(now), "vocab");
  }
  return { state: s, percent, passed };
}

export function markMissionDone(state: AppState, dateKey: string, kind: string): AppState {
  const current = state.missionDone[dateKey] ?? [];
  const missionDone = current.includes(kind) ? state.missionDone : { ...state.missionDone, [dateKey]: [...current, kind] };
  const progress = markKindDone(state.progress, kind);
  return missionDone === state.missionDone && progress === state.progress ? state : { ...state, missionDone, progress };
}

/** Open the next program day when the current one is finished and a new calendar day has begun. */
export function advanceDay(state: AppState, now: Date = new Date()): AppState {
  const progress = advanceProgress(state.progress, state.srs, localDateKey(now));
  return progress === state.progress ? state : { ...state, progress };
}

/** Open the next program day now ("Học vượt") when the current one is finished. */
export function studyAheadDay(state: AppState, now: Date = new Date()): AppState {
  const progress = studyAhead(state.progress, state.srs, localDateKey(now));
  return progress === state.progress ? state : { ...state, progress };
}

/** Record a Gõ từ score; keeps the best. Returns whether it is a new record. */
export function recordTypingScore(state: AppState, score: number): { state: AppState; record: boolean } {
  const record = score > 0 && (state.typingBest === null || score > state.typingBest);
  return { state: record ? { ...state, typingBest: score } : state, record };
}

/** Record a Bắn gà score; keeps the best. Returns whether it is a new record. */
export function recordShooterScore(state: AppState, score: number): { state: AppState; record: boolean } {
  const record = score > 0 && (state.shooterBest === null || score > state.shooterBest);
  return { state: record ? { ...state, shooterBest: score } : state, record };
}

/** A real TOEIC result entered by the learner. Section scores are 5–495 in steps of 5. */
export function addOfficialScore(state: AppState, input: { date: string; listening: number; reading: number }): AppState {
  const valid = (n: number) => Number.isInteger(n) && n >= 5 && n <= 495 && n % 5 === 0;
  if (!valid(input.listening) || !valid(input.reading)) throw new Error("Điểm mỗi phần phải từ 5 đến 495 và chia hết cho 5.");
  const at = new Date(`${input.date}T12:00:00`);
  if (Number.isNaN(at.getTime())) throw new Error("Ngày thi không hợp lệ.");
  return {
    ...state,
    scores: [
      ...state.scores,
      { at: at.toISOString(), listening: input.listening, reading: input.reading, total: input.listening + input.reading, source: "official" },
    ],
  };
}

/** Human label for where a score came from; estimates are always marked as such. */
export function scoreSourceLabel(source: string): { label: string; official: boolean } {
  if (source.startsWith("official")) return { label: "Điểm thi TOEIC chính thức", official: true };
  if (source.startsWith("short-mock")) return { label: "Ước lượng từ đề thi thử rút gọn (50 câu)", official: false };
  if (source.startsWith("mini-")) return { label: "Ước lượng từ Mini test (ít câu, chỉ để tham khảo)", official: false };
  return { label: "Ước lượng", official: false };
}

/** Open mistakes whose review time has come (older saves without a schedule are due). */
export function errorsDue(state: AppState, now: Date = new Date()) {
  return state.errors.filter((e) => e.resolvedAt === null && Date.parse(e.reviewAt ?? e.createdAt) <= now.getTime());
}
