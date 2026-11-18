# Roadmap: TOEIC 800 Bootcamp → complete L&R learning platform

Status as of 2026-11-19. Work is incremental on the existing React/TS/Vite/Tailwind app; no rebuild.

## Current state (inspected)

| Area | Have | Gap |
|------|------|-----|
| Curriculum | 56-day plan, day-by-day gating (`domain/progress.ts`), lesson notes per day | Day packs only for weeks 1–2; no per-day review/assessment step; workload not adjusted by weaknesses |
| Vocabulary | 628 words, 18 topics, SRS, Learn/Flash/2 games, 11-group 2,000 target | No IPA, VI example translation, synonyms/antonyms, collocations, difficulty; no notebook; no weekly test |
| Listening | Part 2 (24 + 56 in packs), Part 3 (6), Part 4 (5); browser TTS with 2 voices | No Part 1 (photos); no exam-mode playback rules; TTS only (no recorded audio) |
| Reading | Part 5 (42 + 56 in packs), Part 7 single passages (5 + 14 in packs) | No Part 6; no double/triple passages; no NOT/EXCEPT or vocabulary-in-context items; no evidence highlighting |
| Exam | Mini test (16 q, 20 min) | No realistic exam UI (navigator, answer sheet, flags, auto-submit); no 200-question mock; no L/R score estimate |
| Adaptive | Skill stats (EMA accuracy, response time), error log, weakest-skill focus in missions | Recommendations not driving which items are served; no retention metric |
| Analytics | Score ring, top weaknesses, streak | No time studied, weekly accuracy, vocab mastery, weekly report |

Pages source is set to GitHub Actions (2026-11-19).

## Constraints and decisions

- **Original content only.** No items from ETS/Study4/other sites or books.
- **Audio (decided 2026-11-19): keep browser speech synthesis for now.** The player already accepts an
  optional MP3 per listening group (`audioSrc`, files in `web/public/audio/`) and falls back to speech, so
  recorded or generated audio can be added later without code changes.
- **Part 1 photos** must be free to reuse (Unsplash/Pexels licence), stored in `web/public/photos/`.
- **IPA** is generated from the CMU Pronouncing Dictionary (BSD licence) by a script, not typed by hand.
- **Scores** are estimates from a conversion table, always labelled as unofficial.

## Priorities and phases

1. **Exam realism** — shared exam engine: answer sheet + question navigator, flags, section timers
   (L 45 / R 75 min), auto-submit, listening plays once with timed answer windows, no explanations
   until submit, then review with explanations and estimated L/R scores. Mini test moves onto it.
   Full mock tests unlock in week 5.
2. **Vocabulary expansion** — extend the word schema (IPA, VI example, synonyms, antonyms,
   collocations, level); generate IPA; write day packs for weeks 3–8 to reach ≥2,000 words;
   vocabulary notebook; weekly vocabulary test.
3. **Question bank quality** — Part 6 sets; Part 7 double/triple passages and NOT/EXCEPT,
   vocabulary-in-context items with evidence; Part 1 with licensed photos; then Mock Test 1
   (200 original questions), later Mock Test 2.
4. **Error analysis** — error log page: repeated mistakes, error class, retry queue.
5. **Adaptive learning** — serve more items from weak skills; adjust daily workload.
6. **Analytics & polish** — study time tracking, weekly report, vocab mastery, per-part charts.
