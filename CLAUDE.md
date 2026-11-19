# TOEIC 800 Bootcamp

A self-study TOEIC course (400 → 800 in 8 weeks) for Vietnamese learners. The app is a static,
client-only React site in `web/`, deployed to GitHub Pages. There is no backend: progress is
stored in the browser's `localStorage`.

The owner writes in Vietnamese. Reply in Vietnamese, and write all UI text in Vietnamese
(English only for TOEIC content: words, sentences, passages, scripts).

## Commands (run inside `web/`)

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test           # vitest
npm run build      # tsc -b && vite build → web/dist
```

Before any commit: `npm run typecheck`, `npm test` and `npm run build` must all pass.

## Layout

- `web/src/data/`: static content
  - `vocabulary.ts`: words. Rows are `[topic, word, pos, meaningVi, meaningEn, paraphrase, example]`. `VocabTopic`, `TOPIC_LABEL` and `VOCAB_GROUPS` (the 11 groups of the 2,000-word goal) must stay in sync.
  - `listening.ts`: Part 2 items, Part 3/4 sets (scripts read by browser speech).
  - `reading.ts`: Part 5 items (blank written as `-------`), Part 7 passages.
  - `curriculum.ts`: weeks, skill tree (`L.P2.who`, `R.P5.tense`…), mission templates.
  - `dailyPlan.ts`: the 56-day lesson plan and `missionLink()` deep links.
  - `dayPacks/`: one pack per day (`weekN.ts`) tying that day's words, Part 2 items, optional Part 3/4 talk, Part 5 items and a Part 7 passage to one theme. Pack words are merged into `vocabulary`. Write the correct option first; sessions shuffle options (`shuffleOptions`).
- `web/src/domain/`: pure logic with tests (SRS, missions, games, scoring).
- `web/src/domain/progress.ts`: day-by-day gating. A day is complete when its words are learned and grammar/listening/reading (plus the mini test on day 7, 14…) are done; the next day opens on a later date. Pages only offer content of days already reached.
- `web/src/lib/`: app state (`state.ts`, zod schema + `recordAnswer`, `gradeVocab`…), store, speech.
- `web/src/pages/`: one page per route; `pages/vocab/` holds the vocabulary modes and games.
- Routes are in `web/src/App.tsx`, nav tabs in `web/src/components/Layout.tsx`.
- `web/src/voice/`: the Gen Z voice. `lines.ts` is the line bank per situation (each line has a
  spice level 0–3; 0 = neutral, used when humour is off), `engine.ts` picks lines without repeats,
  `coach.ts` chooses what to say from the learner's behaviour (miss streaks, same-skill misses with a
  study tip, combos, comebacks), `greeting.ts` the welcome line, `copy.ts` the playful microcopy.
  Add lines by appending to `LINES`; every context needs at least one spice-0 and one playful line (tested).
- `web/src/lib/gamify.ts`: XP, levels, daily quests, weekly challenge, badges (some secret). The store
  derives rewards from real state changes (`applyGamification(prev, next)`), so reloads never pay twice;
  one-off rewards are keyed by date. `replaceState` (backup import/reset) never awards anything.
- `web/src/components/Mascot.tsx`: "Tám", the SVG mascot with moods; `Voice.tsx` has the coach bubble,
  start line, session result and empty state; `Celebrations.tsx` shows level-ups, badges and quests.
- Voices: English (listening lines, words) is read by the browser, preferring Google's voices
  (`lib/speech.ts`: `voiceFor`, `wordVoice`). VieNeu mispronounced short English, so it is not used for it.
  Tám's Vietnamese lines are recorded with VieNeu-TTS in `web/public/tts/*.mp3`; after adding mascot lines
  run `npm run tts:export` then `python tools/tts/generate.py --prune` (see `tools/tts/README.md`).
- `web/src/lib/music.ts`: background piano for the vocab games, synthesised with Web Audio (original
  pieces, no audio files); `useGameMusic`/`MusicControls` in `pages/vocab/shared.tsx`, `prefs.music`.

## Rules

- **Voice:** playful, Gen Z Vietnamese only in greetings, reactions, notifications, buttons, empty
  states and gamification. TOEIC content and `explainVi` stay accurate and plain. Errors about saving,
  backups, imports and data loss stay clear and serious. Tease situations, never the learner.
- **Content must be original.** Never copy questions, passages or explanations from ETS, Study4,
  dethitracnghiem.vn or any other test site or book, even if asked. The repo and site are public.
  Lists of common words and topics are fine to use as a reference; write meanings and examples yourself.
- Every question carries a skill code that exists in `curriculum.ts` and a Vietnamese explanation
  (`explainVi`). Answers feed `recordAnswer()` so the Dashboard can find weak skills.
- Saved state must stay backward compatible: add new fields to `stateSchema` with `.default(...)`,
  never rename or remove existing ones without a migration.
- Styling: Tailwind, flat colours. One blue accent (`brand-*`), soft per-category chip colours.
  No gradients, glows or blur.
- Keep `api/` and `docker-compose.yml` (the earlier backend design). They are not in every local
  copy, so stage with `git add web` (or specific paths), never `git add -A`.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml` (typecheck, test, build, deploy `web/dist`).
The Pages source must be **GitHub Actions** (Settings → Pages). If the live site shows the README
instead of the app, that setting is still "Deploy from a branch".

Project skills in `.claude/skills/`: `add-vocab`, `add-questions`, `ship`.
