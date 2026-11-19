// Pre-recorded voices (VieNeu-TTS, generated offline by tools/tts). Each clip is stored as
// public/tts/<key>.mp3 where key = clipKey(voice, text); manifest.json lists the keys that exist.
// Anything without a clip falls back to the browser's speech synthesis.
import type { Speaker } from "../data/listening";

/** Preset VieNeu voice used for each listening role. Changing one means regenerating its clips. */
export const ROLE_VOICE: Record<Speaker, string> = {
  W: "Trúc Ly",
  M: "Adam",
  W2: "Ngọc Huyền",
  M2: "Hải Đăng",
};

/** Voice of Tám, the mascot. */
export const MASCOT_VOICE = "Trúc Ly";

/** Voice for single vocabulary words and example sentences. */
export const WORD_VOICE = "Adam";

/** Two FNV-1a passes with different seeds → 16 hex chars. Mirrored in tools/tts/generate.py. */
export function clipKey(voice: string, text: string): string {
  const s = `${voice}|${text.trim()}`;
  const bytes = new TextEncoder().encode(s);
  const pass = (seed: number) => {
    let h = seed >>> 0;
    for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  return pass(2166136261) + pass(0x811c9dc5 ^ 0x5bd1e995);
}

/** "B. It was moved to Friday." → ["B", "It was moved to Friday."]: the letter and the option are separate clips. */
export function splitLetter(text: string): [letter: string | null, rest: string] {
  const m = /^([A-D])\.\s+(.*)$/s.exec(text);
  return m ? [m[1]!, m[2]!] : [null, text];
}

export const letterText = (letter: string) => `${letter}.`;

let manifest: Set<string> | null = null;
let loading: Promise<Set<string>> | null = null;

/** Load the list of available clips once. Resolves to an empty set when there is none. */
export function loadClips(): Promise<Set<string>> {
  if (manifest) return Promise.resolve(manifest);
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}tts/manifest.json`)
      .then((r) => (r.ok ? r.json() : { keys: [] }))
      .then((m: { keys?: string[] }) => (manifest = new Set(m.keys ?? [])))
      .catch(() => {
        // Offline or a bad response: use browser speech for now and try again next time.
        loading = null;
        return new Set<string>();
      });
  }
  return loading;
}

export function hasClip(voice: string, text: string): string | null {
  const key = clipKey(voice, text);
  return manifest?.has(key) ? key : null;
}

export const clipUrl = (key: string) => `${import.meta.env.BASE_URL}tts/${key}.mp3`;

/** The clip playing right now (listening line, word or Tám): only one plays at a time. */
let currentStop: (() => void) | null = null;

export function stopAllClips(): void {
  currentStop?.();
  currentStop = null;
}

/** Play one clip, cutting off any other clip; resolves when it ends (or fails/stops). */
export function playClip(key: string, rate = 1): { done: Promise<boolean>; stop: () => void } {
  stopAllClips();
  const audio = new Audio(clipUrl(key));
  audio.playbackRate = rate;
  let settle: (ok: boolean) => void = () => {};
  const done = new Promise<boolean>((r) => (settle = r));
  audio.onended = () => settle(true);
  audio.onerror = () => settle(false);
  audio.play().catch(() => settle(false));
  const stop = () => {
    audio.pause();
    audio.removeAttribute("src");
    settle(false);
    if (currentStop === stop) currentStop = null;
  };
  currentStop = stop;
  return { done, stop };
}
