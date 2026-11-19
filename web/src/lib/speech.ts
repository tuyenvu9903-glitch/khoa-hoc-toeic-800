// Browser text-to-speech for listening practice: plays a script line by line with a
// distinct voice per speaker where the device has several English voices.
import type { Speaker } from "../data/listening";
import { clipKey, letterText, loadClips, playClip, ROLE_VOICE, splitLetter } from "./tts";

let clips: Set<string> = new Set();
void loadClips().then((c) => (clips = c));

/** Clip keys to play for a line in a recorded voice, or null to use speech synthesis. */
function clipsFor(line: ScriptLine): string[] | null {
  const own = ROLE_VOICE[line.speaker];
  const [letter, rest] = splitLetter(line.text);
  // Prefer the speaker's own voice; any recorded voice beats synthesis.
  const voices = [own, ...Object.values(ROLE_VOICE).filter((v) => v !== own)];
  const restVoice = voices.find((v) => clips.has(clipKey(v, rest)));
  if (!restVoice) return null;
  if (!letter) return [clipKey(restVoice, rest)];
  const lk = clipKey(restVoice, letterText(letter));
  return clips.has(lk) ? [lk, clipKey(restVoice, rest)] : null;
}

export const canSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

const FEMALE = /zira|aria|jenny|samantha|karen|susan|hazel|libby|sonia|female|woman|victoria|allison|ava|emma|michelle|natasha|clara/i;
const MALE = /david|mark|guy|daniel|george|ryan|alex|fred|male|man\b|james|thomas|christopher|eric|roger|brian|andrew/i;

function englishVoices(): SpeechSynthesisVoice[] {
  if (!canSpeech) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
}

/** Pick a voice (and a pitch fallback) for each speaker role. */
function voiceFor(speaker: Speaker): { voice: SpeechSynthesisVoice | null; pitch: number } {
  const all = englishVoices();
  const us = all.filter((v) => v.lang.toLowerCase() === "en-us");
  const pool = us.length > 0 ? [...us, ...all.filter((v) => !us.includes(v))] : all;
  const women = pool.filter((v) => FEMALE.test(v.name));
  const men = pool.filter((v) => MALE.test(v.name) && !FEMALE.test(v.name));
  const female = speaker === "W" || speaker === "W2";
  const second = speaker === "W2" || speaker === "M2";
  const list = female ? women : men;
  const voice = list[second ? 1 : 0] ?? list[0] ?? pool[0] ?? null;
  // Without a matching voice, shift the pitch so speakers still sound different.
  const pitch = list.length > 0 ? 1 : female ? 1.25 : 0.8;
  return { voice, pitch: second && list.length < 2 ? pitch + 0.15 : pitch };
}

/** Voices load asynchronously in some browsers; resolve once they are available (or after a short wait). */
export function voicesReady(): Promise<void> {
  if (!canSpeech || window.speechSynthesis.getVoices().length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    setTimeout(done, 1500);
  });
}

export type ScriptLine = { speaker: Speaker; text: string };

/**
 * Speak lines in order. Returns a function that stops playback.
 * `onLine` reports the index being spoken; `onEnd` fires after the last line (not when stopped).
 */
export function playScript(
  lines: ScriptLine[],
  opts: { rate?: number; onLine?: (i: number) => void; onEnd?: () => void } = {},
): () => void {
  if (lines.length === 0) {
    opts.onEnd?.();
    return () => {};
  }
  const synth = canSpeech ? window.speechSynthesis : null;
  synth?.cancel();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopClip: (() => void) | null = null;

  const say = (i: number) => {
    if (stopped) return;
    if (i >= lines.length) {
      opts.onEnd?.();
      return;
    }
    const line = lines[i]!;
    const keys = typeof Audio !== "undefined" ? clipsFor(line) : null;
    if (keys) {
      opts.onLine?.(i);
      void (async () => {
        for (const k of keys) {
          if (stopped) return;
          const c = playClip(k, opts.rate ?? 1);
          stopClip = c.stop;
          await c.done;
        }
        if (!stopped) timer = setTimeout(() => say(i + 1), 450);
      })();
      return;
    }
    if (!synth) {
      timer = setTimeout(() => say(i + 1), 50);
      return;
    }
    const { voice, pitch } = voiceFor(line.speaker);
    const u = new SpeechSynthesisUtterance(line.text);
    u.lang = voice?.lang ?? "en-US";
    if (voice) u.voice = voice;
    u.pitch = pitch;
    u.rate = opts.rate ?? 0.95;
    u.onstart = () => opts.onLine?.(i);
    // A short pause between lines, like a recorded test.
    u.onend = () => {
      timer = setTimeout(() => say(i + 1), 450);
    };
    u.onerror = () => {
      timer = setTimeout(() => say(i + 1), 50);
    };
    synth.speak(u);
  };
  // Wait for the clip list (first play only) so recorded voices are used from the first line.
  void loadClips().then((c) => {
    clips = c;
    say(0);
  });

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    stopClip?.();
    synth?.cancel();
  };
}

/**
 * Play a recorded file when one is given (e.g. "audio/p3-01.mp3" under web/public), falling back
 * to speech synthesis of the script if there is no file or it fails to load. Returns a stop function.
 */
export function playAudioOrScript(
  src: string | undefined,
  lines: ScriptLine[],
  opts: { rate?: number; onLine?: (i: number) => void; onEnd?: () => void } = {},
): () => void {
  if (!src || typeof Audio === "undefined") return playScript(lines, opts);
  let stopFallback: (() => void) | null = null;
  let stopped = false;
  const audio = new Audio(`${import.meta.env.BASE_URL}${src}`);
  audio.playbackRate = opts.rate ?? 1;
  audio.onended = () => opts.onEnd?.();
  const fallback = () => {
    if (!stopped && !stopFallback) stopFallback = playScript(lines, opts);
  };
  audio.onerror = fallback;
  audio.play().catch(fallback);
  return () => {
    stopped = true;
    audio.pause();
    stopFallback?.();
  };
}
