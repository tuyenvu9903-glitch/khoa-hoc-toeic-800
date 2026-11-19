// Tám's recorded Vietnamese voice (VieNeu-TTS). Only lines without placeholders have clips.
import { hasClip, loadClips, MASCOT_VOICE, playClip } from "../lib/tts";

void loadClips();
let stopCurrent: (() => void) | null = null;
let speaking: Promise<unknown> | null = null;

export function mascotClip(text: string): string | null {
  return typeof Audio !== "undefined" ? hasClip(MASCOT_VOICE, text) : null;
}

/** Say a line in Tám's voice (cuts off the previous one). Returns false when there is no clip. */
export function sayMascot(text: string): boolean {
  const key = mascotClip(text);
  if (!key) return false;
  stopCurrent?.();
  const clip = playClip(key);
  stopCurrent = clip.stop;
  const done: Promise<unknown> = clip.done.finally(() => {
    if (speaking === done) speaking = null;
  });
  speaking = done;
  return true;
}

/** Resolves when Tám's current line ends (or was cut off); at once when she is quiet. */
export function mascotDone(): Promise<void> {
  return (speaking ?? Promise.resolve()).then(() => undefined);
}

export function stopMascot(): void {
  stopCurrent?.();
  stopCurrent = null;
  speaking = null;
}
