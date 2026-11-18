import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const toeicPartEnum = pgEnum("toeic_part", [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
]);

export const skillCategoryEnum = pgEnum("skill_category", [
  "listening",
  "reading",
  "grammar",
  "vocabulary",
  "strategy",
  "timing",
]);

export const difficultyBandEnum = pgEnum("difficulty_band", [
  "400",
  "500",
  "600",
  "700",
  "800",
]);

export const optionKeyEnum = pgEnum("option_key", ["A", "B", "C", "D"]);

export const errorClassEnum = pgEnum("error_class", [
  "vocabulary_gap",
  "grammar_gap",
  "listening_gap",
  "reading_gap",
  "paraphrase_failure",
  "distractor_trap",
  "careless_mistake",
  "time_pressure",
  "misread",
]);

export const sessionKindEnum = pgEnum("session_kind", [
  "daily",
  "placement",
  "mini",
  "part",
  "half_listening",
  "half_reading",
  "full",
  "weakness",
  "error_review",
]);

export const sessionModeEnum = pgEnum("session_mode", ["exam", "learning"]);

export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "in_progress",
  "submitted",
  "abandoned",
]);

export const assetKindEnum = pgEnum("asset_kind", ["audio", "image"]);

export const missionKindEnum = pgEnum("mission_kind", [
  "vocab",
  "grammar",
  "listening",
  "reading",
  "error_review",
  "mini_test",
  "mock",
  "analysis",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("refresh_tokens_user_idx").on(t.userId)]);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  targetScore: integer("target_score").notNull().default(800),
  estimatedListening: integer("estimated_listening").notNull().default(200),
  estimatedReading: integer("estimated_reading").notNull().default(200),
  currentWeek: integer("current_week").notNull().default(1),
  currentDay: integer("current_day").notNull().default(1),
  programStartDate: timestamp("program_start_date", { withTimezone: true }),
  placementCompletedAt: timestamp("placement_completed_at", { withTimezone: true }),
  dailyMinutesTarget: integer("daily_minutes_target").notNull().default(150),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  category: skillCategoryEnum("category").notNull(),
  part: toeicPartEnum("part"),
  parentCode: text("parent_code"),
  importance: real("importance").notNull().default(1),
}, (t) => [uniqueIndex("skills_code_idx").on(t.code)]);

export const curriculumWeeks = pgTable("curriculum_weeks", {
  weekNumber: integer("week_number").primaryKey(),
  title: text("title").notNull(),
  theme: text("theme").notNull(),
  learningRatio: real("learning_ratio").notNull(),
  practiceRatio: real("practice_ratio").notNull(),
  weekendGate: text("weekend_gate").notNull(),
});

export const curriculumDays = pgTable("curriculum_days", {
  dayNumber: integer("day_number").primaryKey(),
  weekNumber: integer("week_number")
    .notNull()
    .references(() => curriculumWeeks.weekNumber),
  title: text("title").notNull(),
  focus: text("focus").notNull(),
});

export const missionTemplates = pgTable("mission_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekNumber: integer("week_number")
    .notNull()
    .references(() => curriculumWeeks.weekNumber),
  kind: missionKindEnum("kind").notNull(),
  title: text("title").notNull(),
  itemCount: integer("item_count").notNull(),
  minutes: integer("minutes").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: assetKindEnum("kind").notNull(),
  url: text("url").notNull(),
  durationMs: integer("duration_ms"),
  scene: text("scene"),
  altText: text("alt_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passages = pgTable("passages", {
  id: uuid("id").primaryKey().defaultRandom(),
  part: toeicPartEnum("part").notNull(),
  format: text("format").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questionSets = pgTable("question_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  part: toeicPartEnum("part").notNull(),
  audioAssetId: uuid("audio_asset_id").references(() => mediaAssets.id),
  imageAssetId: uuid("image_asset_id").references(() => mediaAssets.id),
  topic: text("topic"),
  transcript: text("transcript"),
  translationVi: text("translation_vi"),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  part: toeicPartEnum("part").notNull(),
  skillCode: text("skill_code")
    .notNull()
    .references(() => skills.code),
  topic: text("topic").notNull(),
  difficulty: difficultyBandEnum("difficulty").notNull(),
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<Record<string, string>>().notNull(),
  correctAnswer: optionKeyEnum("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  trap: text("trap").notNull(),
  grammar: text("grammar"),
  estimatedTimeSec: integer("estimated_time_sec").notNull(),
  errorHints: jsonb("error_hints").$type<string[]>().notNull().default([]),
  audioAssetId: uuid("audio_asset_id").references(() => mediaAssets.id),
  imageAssetId: uuid("image_asset_id").references(() => mediaAssets.id),
  passageId: uuid("passage_id").references(() => passages.id),
  setId: uuid("set_id").references(() => questionSets.id),
  transcript: text("transcript"),
  translationVi: text("translation_vi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("questions_part_skill_idx").on(t.part, t.skillCode),
  index("questions_difficulty_idx").on(t.difficulty),
]);

export const vocabularyItems = pgTable("vocabulary_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  word: text("word").notNull(),
  meaningVi: text("meaning_vi").notNull(),
  meaningEn: text("meaning_en").notNull(),
  paraphrase: text("paraphrase"),
  topic: text("topic").notNull(),
  example: text("example"),
}, (t) => [uniqueIndex("vocabulary_word_idx").on(t.word)]);

export const questionVocabulary = pgTable("question_vocabulary", {
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  vocabularyId: uuid("vocabulary_id")
    .notNull()
    .references(() => vocabularyItems.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.questionId, t.vocabularyId] })]);

export const srsCards = pgTable("srs_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vocabularyId: uuid("vocabulary_id")
    .notNull()
    .references(() => vocabularyItems.id, { onDelete: "cascade" }),
  ease: real("ease").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }).notNull().defaultNow(),
  lastResult: text("last_result"),
}, (t) => [uniqueIndex("srs_user_vocab_idx").on(t.userId, t.vocabularyId)]);

export const practiceSessions = pgTable("practice_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: sessionKindEnum("kind").notNull(),
  mode: sessionModeEnum("mode").notNull(),
  status: sessionStatusEnum("status").notNull().default("pending"),
  weekNumber: integer("week_number"),
  dayNumber: integer("day_number"),
  part: toeicPartEnum("part"),
  timeLimitSec: integer("time_limit_sec"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  rawListening: integer("raw_listening"),
  rawReading: integer("raw_reading"),
  scaledListening: integer("scaled_listening"),
  scaledReading: integer("scaled_reading"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sessions_user_idx").on(t.userId, t.createdAt)]);

export const sessionAnswers = pgTable("session_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => practiceSessions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  chosenAnswer: optionKeyEnum("chosen_answer"),
  isCorrect: boolean("is_correct"),
  responseTimeMs: integer("response_time_ms"),
  errorClass: errorClassEnum("error_class"),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("session_question_idx").on(t.sessionId, t.questionId),
  index("answers_question_idx").on(t.questionId),
]);

export const errorLogs = pgTable("error_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  sessionId: uuid("session_id").references(() => practiceSessions.id, { onDelete: "set null" }),
  skillCode: text("skill_code").notNull().references(() => skills.code),
  errorClass: errorClassEnum("error_class").notNull(),
  part: toeicPartEnum("part").notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("error_logs_user_open_idx").on(t.userId, t.resolvedAt)]);

export const userSkillStats = pgTable("user_skill_stats", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillCode: text("skill_code").notNull().references(() => skills.code),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  accuracyEma: real("accuracy_ema").notNull().default(0),
  avgResponseMs: integer("avg_response_ms").notNull().default(0),
  lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true }),
  mastered: boolean("mastered").notNull().default(false),
}, (t) => [primaryKey({ columns: [t.userId, t.skillCode] })]);

export const scoreSnapshots = pgTable("score_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => practiceSessions.id),
  listening: integer("listening").notNull(),
  reading: integer("reading").notNull(),
  total: integer("total").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("score_snapshots_user_idx").on(t.userId, t.createdAt)]);
