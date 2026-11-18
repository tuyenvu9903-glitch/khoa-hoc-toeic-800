import { useEffect } from "react";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string) {
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
  if (!canSpeak) return null;
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
