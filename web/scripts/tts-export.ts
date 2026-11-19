// Writes ../tools/tts/catalog.json: every clip the app can play. Run: npm run tts:export
import { writeFileSync, mkdirSync } from "node:fs";
import { ttsCatalog } from "../src/lib/ttsCatalog";

const clips = ttsCatalog();
mkdirSync("../tools/tts", { recursive: true });
writeFileSync("../tools/tts/catalog.json", JSON.stringify(clips, null, 1));
const by = new Map<string, number>();
for (const c of clips) by.set(c.group, (by.get(c.group) ?? 0) + 1);
console.log(`${clips.length} clips`, Object.fromEntries(by));
