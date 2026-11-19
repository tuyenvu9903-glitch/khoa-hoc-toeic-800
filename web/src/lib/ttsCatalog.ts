// Every sentence the app can speak, for tools/tts to pre-generate. Not imported by the app.
import { dayPacks } from "../data/dayPacks";
import { listeningSets, part2Items, type ListeningSet, type Part2Item } from "../data/listening";
import { vocabulary } from "../data/vocabulary";
import { LINES } from "../voice/lines";
import { letterText, MASCOT_VOICE, ROLE_VOICE, WORD_VOICE } from "./tts";

export type Clip = { voice: string; text: string; lang: "en" | "vi"; group: string };

const SET_INTRO_MAX_FIRST = 13; // "Questions 1/4/7/10/13 through …" covers sessions of up to 5 sets.

export function ttsCatalog(): Clip[] {
  const out = new Map<string, Clip>();
  const add = (voice: string, text: string, lang: Clip["lang"], group: string) => {
    const t = text.trim();
    if (t) out.set(`${voice}|${t}`, { voice, text: t, lang, group });
  };

  const p2: Part2Item[] = [...part2Items, ...dayPacks.flatMap((p) => p.part2)];
  const sets: ListeningSet[] = [...listeningSets, ...dayPacks.flatMap((p) => (p.talk ? [p.talk] : []))];

  const optionRoles = new Set<string>();
  for (const it of p2) {
    add(ROLE_VOICE[it.speakers[0]], it.prompt, "en", "part2");
    for (const o of it.options) add(ROLE_VOICE[it.speakers[1]], o, "en", "part2");
    optionRoles.add(ROLE_VOICE[it.speakers[1]]);
    // The error notebook replays Part 2 with W asking and M answering.
    add(ROLE_VOICE.W, it.prompt, "en", "part2");
    for (const o of it.options) add(ROLE_VOICE.M, o, "en", "part2");
  }
  optionRoles.add(ROLE_VOICE.M);
  for (const v of optionRoles) for (const l of ["A", "B", "C", "D"]) add(v, letterText(l), "en", "letters");

  const kinds = new Set<string>();
  for (const s of sets) {
    kinds.add(s.kind);
    for (const l of s.lines) add(ROLE_VOICE[l.speaker], l.text, "en", `part${s.part}`);
  }
  for (const kind of kinds)
    for (let first = 1; first <= SET_INTRO_MAX_FIRST; first += 3)
      add(ROLE_VOICE.M2, `Questions ${first} through ${first + 2} refer to the following ${kind}.`, "en", "intro");

  const words = [...vocabulary, ...dayPacks.flatMap((p) => p.words.map((w) => ({ word: w[0] })))];
  for (const w of words) add(WORD_VOICE, w.word, "en", "vocab");

  // Mascot lines: only those without placeholders (filled lines differ per learner).
  for (const rows of Object.values(LINES)) for (const [, text] of rows) if (!/\{\w+\}/.test(text)) add(MASCOT_VOICE, text, "vi", "mascot");

  return [...out.values()];
}
