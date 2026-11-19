// Every sentence the app can speak, for tools/tts to pre-generate. Not imported by the app.
import { LINES } from "../voice/lines";
import { MASCOT_VOICE } from "./tts";

export type Clip = { voice: string; text: string; lang: "en" | "vi"; group: string };

export function ttsCatalog(): Clip[] {
  const out = new Map<string, Clip>();
  const add = (voice: string, text: string, lang: Clip["lang"], group: string) => {
    const t = text.trim();
    if (t) out.set(`${voice}|${t}`, { voice, text: t, lang, group });
  };

  // English is spoken by the browser (Google voices), so only Tám's Vietnamese lines are recorded.
  // Mascot lines: only those without placeholders (filled lines differ per learner).
  for (const rows of Object.values(LINES)) for (const [, text] of rows) if (!/\{\w+\}/.test(text)) add(MASCOT_VOICE, text, "vi", "mascot");

  return [...out.values()];
}
