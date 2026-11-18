---
name: add-vocab
description: Add TOEIC vocabulary words or a new topic to the app (web/src/data/vocabulary.ts). Use when the user asks to add words, fill a topic or group toward the 2,000-word goal, or fix a word's meaning/example.
---

# Add vocabulary

1. Read `web/src/data/vocabulary.ts`: the `VocabTopic` union, `TOPIC_LABEL`, `VOCAB_GROUPS` and the `rows` array.
2. Choose where words go. Check the group targets in `VOCAB_GROUPS` and prefer groups furthest below target unless the user named one.
3. For a new topic: add it to `VocabTopic`, give it a Vietnamese label in `TOPIC_LABEL`, and put it in exactly one group of `VOCAB_GROUPS`.
4. Add rows: `[topic, word, pos, meaningVi, meaningEn, paraphrase, example]`.
   - `pos`: n, v, adj, adv, prep, phr.
   - `meaningVi`: short Vietnamese meaning, the sense used in TOEIC.
   - `meaningEn`: a simple English definition you write yourself.
   - `paraphrase`: a common TOEIC synonym, or `""`.
   - `example`: one natural business sentence you write yourself, using the word.
   - Write meanings and examples yourself; never copy them from a website or book.
5. No duplicates: ids come from `slug(word)`, so check that the word is not already in `rows` (any topic).
6. If you write rows with a script, watch apostrophes and quotes in examples; escape `"` as `\"`.
7. Verify in `web/`: `npm run typecheck && npm test && npm run build`. The test in `src/data/reading.test.ts` checks that groups cover every topic and sum to 2,000.
8. Report how many words were added per topic and the new total (`vocabulary.length`).
