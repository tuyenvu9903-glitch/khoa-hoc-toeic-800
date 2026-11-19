// Tám's recorded Vietnamese voice (VieNeu-TTS). Only lines without placeholders have clips.
import { hasClip, loadClips, MASCOT_VOICE, playClip } from "../lib/tts";

void loadClips();
let stopCurrent: (() => void) | null = null;

export function mascotClip(text: string): string | null {
  return typeof Audio !== "undefined" ? hasClip(MASCOT_VOICE, text) : null;
}

/** Say a line in Tám's voice (cuts off the previous one). Returns false when there is no clip. */
export function sayMascot(text: string): boolean {
  const key = mascotClip(text);
  if (!key) return false;
  stopCurrent?.();
  stopCurrent = playClip(key).stop;
  return true;
}

export function stopMascot(): void {
  stopCurrent?.();
  stopCurrent = null;
}
