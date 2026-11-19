import { useEffect } from "react";
import { hasClip, loadClips, playClip, WORD_VOICE } from "../../lib/tts";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
void loadClips();
let stopWord: (() => void) | null = null;

/** Say an English word or sentence: the recorded voice when there is a clip, else the browser voice. */
export function speak(text: string) {
  stopWord?.();
  const key = typeof Audio !== "undefined" ? hasClip(WORD_VOICE, text) : null;
  if (key) {
    if (canSpeak) window.speechSynthesis.cancel();
    stopWord = playClip(key, 0.95).stop;
    return;
  }
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function SpeakButton({ text, label, autoPlay = false }: { text: string; label: string; autoPlay?: boolean }) {
  useEffect(() => {
    if (autoPlay) speak(text);
  }, [autoPlay, text]);
  if (!canSpeak && typeof Audio === "undefined") return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm transition hover:bg-brand-100"
    >
      🔊
    </button>
  );
}

export function isTypingTarget(t: EventTarget | null): boolean {
  return t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
}
