CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE toeic_part AS ENUM ('1', '2', '3', '4', '5', '6', '7');
CREATE TYPE skill_category AS ENUM ('listening', 'reading', 'grammar', 'vocabulary', 'strategy', 'timing');
CREATE TYPE difficulty_band AS ENUM ('400', '500', '600', '700', '800');
CREATE TYPE option_key AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE error_class AS ENUM (
  'vocabulary_gap',
  'grammar_gap',
  'listening_gap',
  'reading_gap',
  'paraphrase_failure',
  'distractor_trap',
  'careless_mistake',
  'time_pressure',
  'misread'
);
CREATE TYPE session_kind AS ENUM (
  'daily',
  'placement',
  'mini',
  'part',
  'half_listening',
  'half_reading',
  'full',
  'weakness',
  'error_review'
);
CREATE TYPE session_mode AS ENUM ('exam', 'learning');
CREATE TYPE session_status AS ENUM ('pending', 'in_progress', 'submitted', 'abandoned');
CREATE TYPE asset_kind AS ENUM ('audio', 'image');
CREATE TYPE mission_kind AS ENUM (
  'vocab',
  'grammar',
  'listening',
  'reading',
  'error_review',
  'mini_test',
  'mock',
  'analysis'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_idx ON users (email);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  target_score INTEGER NOT NULL DEFAULT 800,
  estimated_listening INTEGER NOT NULL DEFAULT 200,
  estimated_reading INTEGER NOT NULL DEFAULT 200,
  current_week INTEGER NOT NULL DEFAULT 1,
  current_day INTEGER NOT NULL DEFAULT 1,
  program_start_date TIMESTAMPTZ,
  placement_completed_at TIMESTAMPTZ,
  daily_minutes_target INTEGER NOT NULL DEFAULT 150,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category skill_category NOT NULL,
  part toeic_part,
  parent_code TEXT,
  importance REAL NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX skills_code_idx ON skills (code);

CREATE TABLE curriculum_weeks (
  week_number INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  learning_ratio REAL NOT NULL,
  practice_ratio REAL NOT NULL,
  weekend_gate TEXT NOT NULL
);

CREATE TABLE curriculum_days (
  day_number INTEGER PRIMARY KEY,
  week_number INTEGER NOT NULL REFERENCES curriculum_weeks (week_number),
  title TEXT NOT NULL,
  focus TEXT NOT NULL
);

CREATE TABLE mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL REFERENCES curriculum_weeks (week_number),
  kind mission_kind NOT NULL,
  title TEXT NOT NULL,
  item_count INTEGER NOT NULL,
  minutes INTEGER NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind asset_kind NOT NULL,
  url TEXT NOT NULL,
  duration_ms INTEGER,
  scene TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part toeic_part NOT NULL,
  format TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part toeic_part NOT NULL,
  audio_asset_id UUID REFERENCES media_assets (id),
  image_asset_id UUID REFERENCES media_assets (id),
  topic TEXT,
  transcript TEXT,
  translation_vi TEXT
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part toeic_part NOT NULL,
  skill_code TEXT NOT NULL REFERENCES skills (code),
  topic TEXT NOT NULL,
  difficulty difficulty_band NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer option_key NOT NULL,
  explanation TEXT NOT NULL,
  trap TEXT NOT NULL,
  grammar TEXT,
  estimated_time_sec INTEGER NOT NULL,
  error_hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  audio_asset_id UUID REFERENCES media_assets (id),
  image_asset_id UUID REFERENCES media_assets (id),
  passage_id UUID REFERENCES passages (id),
  set_id UUID REFERENCES question_sets (id),
  transcript TEXT,
  translation_vi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX questions_part_skill_idx ON questions (part, skill_code);
CREATE INDEX questions_difficulty_idx ON questions (difficulty);

CREATE TABLE vocabulary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  meaning_vi TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  paraphrase TEXT,
  topic TEXT NOT NULL,
  example TEXT
);
CREATE UNIQUE INDEX vocabulary_word_idx ON vocabulary_items (word);

CREATE TABLE question_vocabulary (
  question_id UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary_items (id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, vocabulary_id)
);

CREATE TABLE srs_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary_items (id) ON DELETE CASCADE,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_result TEXT
);
CREATE UNIQUE INDEX srs_user_vocab_idx ON srs_cards (user_id, vocabulary_id);

CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind session_kind NOT NULL,
  mode session_mode NOT NULL,
  status session_status NOT NULL DEFAULT 'pending',
  week_number INTEGER,
  day_number INTEGER,
  part toeic_part,
  time_limit_sec INTEGER,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  raw_listening INTEGER,
  raw_reading INTEGER,
  scaled_listening INTEGER,
  scaled_reading INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON practice_sessions (user_id, created_at);

CREATE TABLE session_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions (id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions (id),
  chosen_answer option_key,
  is_correct BOOLEAN,
  response_time_ms INTEGER,
  error_class error_class,
  answered_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX session_question_idx ON session_answers (session_id, question_id);
CREATE INDEX answers_question_idx ON session_answers (question_id);

CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions (id),
  session_id UUID REFERENCES practice_sessions (id) ON DELETE SET NULL,
  skill_code TEXT NOT NULL REFERENCES skills (code),
  error_class error_class NOT NULL,
  part toeic_part NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX error_logs_user_open_idx ON error_logs (user_id, resolved_at);

CREATE TABLE user_skill_stats (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  skill_code TEXT NOT NULL REFERENCES skills (code),
  attempts INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  accuracy_ema REAL NOT NULL DEFAULT 0,
  avg_response_ms INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  mastered BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, skill_code)
);

CREATE TABLE score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_id UUID REFERENCES practice_sessions (id),
  listening INTEGER NOT NULL,
  reading INTEGER NOT NULL,
  total INTEGER NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX score_snapshots_user_idx ON score_snapshots (user_id, created_at);
