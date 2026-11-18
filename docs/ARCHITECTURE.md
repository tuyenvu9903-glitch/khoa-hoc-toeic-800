# TOEIC 800 Bootcamp — System Architecture

Personalized 8-week training system: **400 → 500 → 600 → 700 → 800**.

The product is not a generic English course. Every screen answers:

1. Where is the learner now?
2. What is weak?
3. What should they study today?
4. Why did they miss the item?
5. What to practice next?
6. Is the score rising or falling?
7. Are they ready for 800?

---

## 1. 8-week curriculum

Daily load: **2–3 hours**. Mix: weeks 1–4 **30% learning / 70% practice**; weeks 5–8 **20% / 80%**.

| Week | Theme | Parts | Learning focus | Weekend gate |
|------|--------|-------|----------------|--------------|
| 1 | Diagnostic + foundation | 1, 2, 5 | Placement, POS, basic tenses, S/V, noun/adj/adv/prep, core vocab, format | Mini Test |
| 2 | Grammar + QR | 2, 5 | SVA, tenses, pronouns, prepositions, conjunctions, word forms, gerund/infinitive, passive; Part 2 patterns (who/what/where/when/why/how/Y/N/choice) | Part 2 + Part 5 Test |
| 3 | Listening conversations & talks | 3, 4 | Speaker, location, purpose, problem, next action, detail, inference, paraphrase; workplace topics | Listening Half Test |
| 4 | Reading | 6, 7 | Grammar/vocab/insertion/context; single/double/triple; detail, purpose, inference, NOT, reference, paraphrase, next action; keyword/scan/skim/time | Reading Half Test |
| 5 | Paraphrase + advanced | 3–7 | Vocab/sentence/question/listening paraphrase; harder items | Full Mock #1 |
| 6 | Weakness elimination | Adaptive | No even coverage. Train TOP weaknesses from error log | Full Mock #2 |
| 7 | 700→800 | Hard 3/4/5/6/7 | Inference, distractors, time pressure; short explanations; practice → analysis → retry | Full Mock #3 |
| 8 | Exam simulation | Full tests | Days 50–56: test / error analysis / weakness / test / analysis / targeted / **final full test** + readiness report | Final Readiness Report |

### Daily Mission template

- Vocabulary: 20–30 words (SRS)
- Grammar: 15 items
- Listening: 20–30 items
- Reading: 20–30 items
- Error review: 10 missed items (spaced)
- Mini test: 10–20 timed items

Dashboard CTA: **Hôm nay tôi phải học gì?** → one ordered mission list with estimated minutes.

---

## 2. Skill tree

Skills are the unit of adaptive selection, error aggregation, and “top 10 weaknesses”.

```
TOEIC
├── Listening
│   ├── Part 1 Photo
│   │   ├── People / objects / actions / location
│   ├── Part 2 Question-Response
│   │   ├── Who / What / Where / When / Why / How / Yes-No / Choice
│   ├── Part 3 Conversation
│   │   ├── Speaker / location / purpose / problem / next action / detail / inference / paraphrase
│   └── Part 4 Talk
│       └── (same question types as Part 3)
├── Reading
│   ├── Part 5 Incomplete sentences
│   │   ├── SVA / tenses / pronouns / prepositions / conjunctions / word forms / gerund-inf / passive
│   ├── Part 6 Text completion
│   │   ├── Grammar / vocabulary / sentence insertion / context
│   └── Part 7 Passages
│       ├── Format: single / double / triple
│       └── Types: detail / purpose / inference / NOT / reference / paraphrase / next action
├── Vocabulary
│   ├── Topics: workplace, office, meeting, travel, hotel, restaurant, shopping, CS, delivery, schedule
│   └── Paraphrase pairs (purchase=buy, postpone=delay, …)
├── Strategy
│   ├── Keyword / scan / skim / time management / distractor recognition
└── Timing
    └── Overtime vs estimated_time (triggers timed practice even if accuracy is high)
```

Each question maps to **one primary skill** and optional secondary skills.

---

## 3. Database schema (summary)

PostgreSQL. UUID PKs. See `api/src/db/schema.ts` for the source of truth.

| Table | Role |
|-------|------|
| `users` | Auth identity |
| `profiles` | Target 800, week/day, estimated L/R scores, start date |
| `skills` | Skill tree nodes |
| `curriculum_weeks` / `curriculum_days` | 8-week calendar |
| `mission_templates` | Daily mission recipes by week |
| `passages` | Part 6/7 text blocks |
| `question_sets` | Part 3/4 groups sharing audio |
| `media_assets` | Audio + photo |
| `questions` | Item bank |
| `vocabulary_items` + `question_vocabulary` | Vocab + paraphrase |
| `srs_cards` | Spaced repetition state |
| `practice_sessions` | Mini / part / half / full / daily |
| `session_answers` | Per-item attempt + timing |
| `error_logs` | Classified misses |
| `user_skill_stats` | Adaptive inputs |
| `score_snapshots` | Score trajectory 400→800 |
| `refresh_tokens` | JWT rotation (Phase 2) |

---

## 4. Question schema

Every item (API + DB) includes:

```ts
{
  id: string
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7
  skillCode: string
  topic: string
  difficulty: 400 | 500 | 600 | 700 | 800
  question: string
  options: { A: string; B: string; C: string; D?: string } // Part 2 is A–C
  correctAnswer: "A" | "B" | "C" | "D"
  explanation: string
  trap: string
  vocabulary: { word: string; meaning: string; paraphrase?: string }[]
  grammar: string | null
  estimatedTimeSec: number
  errorHints: ErrorClass[]
  media: { audioId?: string; imageId?: string }
  passageId?: string
  setId?: string
  transcript?: string
  translationVi?: string
}
```

Error classes: `vocabulary_gap | grammar_gap | listening_gap | reading_gap | paraphrase_failure | distractor_trap | careless_mistake | time_pressure | misread`.

---

## 5. Adaptive learning algorithm

**Mastered** = accuracy ≥ 90% AND n ≥ 20 AND mean response time ≤ 1.2 × estimated.

**Score** for scheduling skill `s`:

```
priority(s) =
  (1 - accuracy_ema) * importance(part, week)
  * recency_boost(days_since_practice)
  * time_penalty(if slow)
  * (0.15 if mastered else 1)
```

Rules:

- Weak Part 3 → increase Part 3 share of daily listening.
- Part 5 > 90% mastered → shrink Part 5.
- Vocab weak → extra SRS + in-item review.
- Correct but slow → timed drills, not more theory.
- Week 6+: **only** top weaknesses + mock review, not even coverage.
- Never spam mastered item types.

Daily mix generator:

1. Load profile week + `user_skill_stats` + open error_logs.
2. Allocate minutes: vocab / grammar / listening / reading / error review / mini test.
3. Sample questions by priority, difficulty ≈ current band + 1 step, avoid last 50 IDs.
4. Persist as today’s `practice_sessions` of kind `daily`.

---

## 6. Mock test architecture

| Kind | Content | Timer |
|------|---------|-------|
| Placement | Short L+R diagnostic | Yes |
| Mini | 10–20 mixed | Yes |
| Part | One part only | Part-scaled |
| Half listening | Parts 1–4 | Official L time scaled |
| Half reading | Parts 5–7 | Official R time scaled |
| Full | 100 L + 100 R | 45 min L + 75 min R |

Flow: `create session (exam mode)` → serve items in official order → lock navigation rules → submit → score estimation (scaled 5–495 per section from raw) → part breakdown → error + time analysis → recommended training → `score_snapshots` row.

Exam mode: no transcript, translation, replay, or pause. Learning mode: replay, transcript, VI translation, explanation, vocab, paraphrase, shadowing.

Week 8 readiness report: estimated L/R/total, weakest/strongest parts, avg RT, accuracy, readiness vs 800, final review list.

---

## 7. Listening image/audio architecture

- `media_assets.kind = image | audio`
- Part 1: one large realistic workplace photo + 4 spoken statements (single audio file with 4 options, or 4 clips). Scenes: office, meeting, restaurant, airport, hotel, store, warehouse, street, construction, station, conference, workplace.
- Part 2: audio only (question + 3 responses).
- Part 3/4: one audio per `question_sets` (3 questions).
- Files stored under `/media` in Phase 5 (local now, object storage later). DB stores `url`, `duration_ms`, `scene`, `alt_text`.
- Player: exam = single play, no seek; learning = replay + transcript sync (Phase 5).

---

## 8. UI architecture

Pages: Dashboard, 8-Week Roadmap, Daily Mission, Placement Test, Vocabulary, Grammar, Listening, Reading, Practice, Mock Test, Error Log, Progress, AI Tutor.

Layout: left nav + top score chip (`current / 800`, L, R) + primary CTA **Today’s mission**.

Design tokens: exam-like calm neutrals, large Part 1 image, timer visible in exam, explanation drawer only after submit in learning.

Stack (later phases): React + Vite + Tailwind, React Query, Zod, React Hook Form. This phase ships **API + Postgres only**.

---

## Development order

1. Architecture + database ← **current**
2. Authentication + Dashboard
3. Placement Test
4. Question Engine
5. Listening + audio + image
6. Reading
7. Vocabulary + SRS
8. Grammar
9. Mock Test
10. Error Analysis
11. Adaptive Learning
12. AI Tutor
