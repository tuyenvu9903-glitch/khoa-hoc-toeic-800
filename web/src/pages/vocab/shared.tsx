import { useEffect, useState } from "react";
import { duckForVoice, nextTrack, onTrackChange, pauseMusic, resumeMusic, startMusic, stopMusic } from "../../lib/music";
import { update, useAppState } from "../../lib/store";
import { voicesReady, wordVoice } from "../../lib/speech";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
void voicesReady();

/** Say an English word or sentence with the browser's best English voice (Google when available). */
export function speak(text: string) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = wordVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "en-US";
  u.rate = 0.9;
  const release = duckForVoice();
  u.onend = release;
  u.onerror = release;
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

/**
 * Background music that follows a game's status: starts on the first "playing" (from the start
 * click), pauses with the game, stops when it ends or the game closes. Off when prefs.music is off.
 */
export function useGameMusic(status: "ready" | "playing" | "paused" | "done") {
  const { prefs } = useAppState();
  const [track, setTrack] = useState<string | null>(null);
  useEffect(() => onTrackChange(setTrack), []);
  useEffect(() => {
    if (!prefs.music || status === "done") stopMusic();
    else if (status === "playing") {
      if (track === null) startMusic();
      else resumeMusic();
    } else if (status === "paused") pauseMusic();
    // `track` only tells whether music is already running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, prefs.music]);
  useEffect(() => stopMusic, []);
  return track;
}

/** Small music switch shown above a game: on/off and "next song". */
export function MusicControls({ track }: { track: string | null }) {
  const { prefs } = useAppState();
  const toggle = () => update((s) => ({ ...s, prefs: { ...s.prefs, music: !s.prefs.music } }));
  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        className="rounded-full px-2 py-0.5 hover:bg-slate-100 hover:text-slate-800"
        aria-pressed={prefs.music}
        title={prefs.music ? "Tắt nhạc nền" : "Bật nhạc nền"}
      >
        {prefs.music ? "🎵" : "🔇"} <span className="max-w-[12rem] truncate align-middle">{prefs.music ? (track ?? "Nhạc nền bật") : "Nhạc nền tắt"}</span>
      </button>
      {prefs.music && track && (
        <button type="button" onClick={nextTrack} className="rounded-full px-2 py-0.5 hover:bg-slate-100 hover:text-slate-800" title="Đổi bài khác" aria-label="Đổi bài khác">
          ⏭
        </button>
      )}
    </span>
  );
}
