import { z } from "zod";
import { errorClassSchema, toeicPartSchema } from "../domain/question";
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
  /** Best "Ghép thẻ" time in seconds. */
  matchBest: z.number().positive().nullable().default(null),
  /** Best "Bắn gà" score. */
  shooterBest: z.number().int().min(0).nullable().default(null),
  /** Mission items ticked off, keyed by local date (YYYY-MM-DD). */
  missionDone: z.record(z.string(), z.array(z.string())),
});

export type AppState = z.infer<typeof stateSchema>;
export type Profile = NonNullable<AppState["profile"]>;

export function emptyState(): AppState {
  return { version: STATE_VERSION, profile: null, skillStats: {}, errors: [], scores: [], srs: {}, matchBest: null, shooterBest: null, missionDone: {} };
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
  return { ...state, profile: { ...state.profile, programStartDate: now.toISOString() }, missionDone: {} };
}

export function localDateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function gradeVocab(state: AppState, wordId: string, grade: Grade, now: Date = new Date()): AppState {
  return { ...state, srs: { ...state.srs, [wordId]: reviewCard(state.srs[wordId], grade, now) } };
}

/** Tick a mission item on (never off), e.g. when a vocabulary session is completed. */
export function markMissionDone(state: AppState, dateKey: string, kind: string): AppState {
  const current = state.missionDone[dateKey] ?? [];
  return current.includes(kind)
    ? state
    : { ...state, missionDone: { ...state.missionDone, [dateKey]: [...current, kind] } };
}

/** Record a Match game time; keeps the best (lowest). Returns whether it is a new record. */
export function recordMatchTime(state: AppState, seconds: number): { state: AppState; record: boolean } {
  const record = state.matchBest === null || seconds < state.matchBest;
  return { state: record ? { ...state, matchBest: seconds } : state, record };
}

/** Record a Bắn gà score; keeps the best. Returns whether it is a new record. */
export function recordShooterScore(state: AppState, score: number): { state: AppState; record: boolean } {
  const record = score > 0 && (state.shooterBest === null || score > state.shooterBest);
  return { state: record ? { ...state, shooterBest: score } : state, record };
}
