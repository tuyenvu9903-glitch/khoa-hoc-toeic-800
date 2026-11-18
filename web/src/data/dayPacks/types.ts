// A day pack ties one day's vocabulary, listening and reading to a single theme, so the words
// learned in the morning show up again in that day's listening and reading questions.
import type { ListeningSet, Part2Item } from "../listening";
import type { Part5Item, Part7Set } from "../reading";
import type { VocabTopic } from "../vocabulary";

/** [word, pos, meaningVi, meaningEn, paraphrase ("" if none), example] — the topic comes from the pack. */
export type WordRow = [string, string, string, string, string, string];

export type DayPack = {
  day: number;
  topic: VocabTopic;
  /** Short Vietnamese theme shown to the learner, e.g. "Một ngày ở văn phòng". */
  theme: string;
  words: WordRow[];
  part2: Part2Item[];
  /** Part 3 conversation or Part 4 talk (from week 3). */
  talk?: ListeningSet;
  part5: Part5Item[];
  part7: Part7Set;
};
