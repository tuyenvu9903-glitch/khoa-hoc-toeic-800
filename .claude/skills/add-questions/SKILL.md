---
name: add-questions
description: Write new TOEIC practice questions for the app — Listening Part 2/3/4 (web/src/data/listening.ts) or Reading Part 5/7 (web/src/data/reading.ts), or a new part such as Part 1 or Part 6. Use when the user asks for more questions, a new part, or harder items.
---

# Add practice questions

All content must be original and written in TOEIC style. Never copy items from ETS, Study4,
dethitracnghiem.vn or any other test site or book, even if the user asks: explain why and offer to
write original items instead.

## Day packs come first

Daily practice comes from `web/src/data/dayPacks/weekN.ts`: each day has ~30 words, 6 Part 2 items, 6 Part 5 items (the day's grammar skill), one Part 7 passage, and from week 3 a Part 3/4 `talk`, all on the day's theme and reusing the day's words. Write the correct option first (answer 0); the app shuffles. Register new week files in `dayPacks/index.ts`. Word ids must be unique across `vocabulary.ts` and all packs.

## Where things go

| Part | File | Shape |
|------|------|-------|
| 2 | `data/listening.ts` → `part2Items` via `p2(id, skill, prompt, [A,B,C], answer, explainVi, speakers?)` | skill suffix: who, what, where, when, why, how, yesno, choice |
| 3/4 | `data/listening.ts` → `listeningSets` | `lines` (speaker M/W/M2/W2), 3 questions via `q(...)`; Part 4 has exactly one line |
| 5 | `data/reading.ts` → `part5Items` via `p5(id, skill, sentence, [A,B,C,D], answer, explainVi)` | blank written as `-------`; skill suffix from `PART5_SKILLS` |
| 7 | `data/reading.ts` → `part7Sets` | `passage` (plain text, newlines kept), 2–5 questions via `rq(...)` |

Skill codes must exist in `data/curriculum.ts` (`skillRows`). Add a code there first if needed.

## Writing good items

- One clearly correct answer. Each distractor must be wrong for a reason you can state
  (wrong word form, repeated sound/word trap, answers a different question, Yes/No to a Wh- question…).
- `explainVi`: 1–2 Vietnamese sentences saying why the answer is right and naming the trap.
- Part 3/4 questions in order of the script; at least one paraphrase question per set.
- Vary vocabulary topics and keep ids unique (`p2-25`, `p5-te-07`, `p3-07`…).

## A new part (e.g. Part 1, Part 6)

Add a data type and bank, a session component following `Part5Session`/`Part7Session` in
`pages/ReadingPage.tsx` (answers go through `recordAnswer` with the right `part`), a mode card on
the page, and a deep link in `missionLink()` if the daily plan should use it. Part 1 photos must be
free to reuse (Unsplash/Pexels licence) and stored in `web/public/`.

## Verify

In `web/`: `npm run typecheck && npm test && npm run build`. The data tests in
`src/data/listening.test.ts` and `src/data/reading.test.ts` check ids, skill codes, option counts
and blanks. Report how many items were added per part.
