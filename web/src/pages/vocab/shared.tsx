import { useEffect, useState } from "react";
import { duckForVoice, nextTrack, onTrackChange, pauseMusic, resumeMusic, setMusicStyle, setMyTracks, startMusic, stopMusic, type MusicStyle } from "../../lib/music";
import { myMusicBlob, useMyMusic } from "../../lib/myMusic";
import { update, useAppState } from "../../lib/store";
import { voicesReady, wordVoice } from "../../lib/speech";
import { mascotDone, stopMascot } from "../../voice/mascotVoice";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
void voicesReady();

let wordToken = 0;
const MAX_WAIT_MS = 8000;

/**
 * Say an English word or sentence with the browser's best English voice (Google when available).
 * Automatic reads (`afterTam`) wait until Tám finishes her Vietnamese line, so the two never overlap;
 * a 🔊 click cuts Tám off and reads at once. A newer call always replaces an older one.
 */
export function speak(text: string, { afterTam = false }: { afterTam?: boolean } = {}) {
  if (!canSpeak) return;
  const token = ++wordToken;
  window.speechSynthesis.cancel();
  if (!afterTam) return say(text, token);
  // Give a line Tám starts in the same render (e.g. her reaction shown with the next card) a moment
  // to begin, then wait for it to end.
  setTimeout(() => {
    void Promise.race([mascotDone(), new Promise((r) => setTimeout(r, MAX_WAIT_MS))]).then(() => say(text, token));
  }, 40);
}

function say(text: string, token: number) {
  if (token !== wordToken) return;
  stopMascot();
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
    if (autoPlay) speak(text, { afterTam: true });
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
  const mine = useMyMusic();
  useEffect(() => setMyTracks(mine, myMusicBlob), [mine]);
  useEffect(() => setMusicStyle(prefs.musicStyle), [prefs.musicStyle]);
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
const STYLE_LABEL: Record<MusicStyle, string> = { remix: "🎧 Remix", piano: "🎹 Piano", mine: "📁 Nhạc của bạn" };
const nextStyle = (s: MusicStyle, hasMine: boolean): MusicStyle => (s === "remix" ? "piano" : s === "piano" && hasMine ? "mine" : "remix");

export function MusicControls({ track }: { track: string | null }) {
  const { prefs } = useAppState();
  const mine = useMyMusic();
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
      {prefs.music && (
        <button
          type="button"
          onClick={() => update((s) => ({ ...s, prefs: { ...s.prefs, musicStyle: nextStyle(s.prefs.musicStyle, mine.length > 0) } }))}
          className="rounded-full px-2 py-0.5 hover:bg-slate-100 hover:text-slate-800"
          title="Đổi kiểu nhạc: remix, piano hoặc nhạc của bạn"
        >
          {STYLE_LABEL[prefs.musicStyle]}
        </button>
      )}
      {prefs.music && track && (
        <button type="button" onClick={nextTrack} className="rounded-full px-2 py-0.5 hover:bg-slate-100 hover:text-slate-800" title="Đổi bài khác" aria-label="Đổi bài khác">
          ⏭
        </button>
      )}
    </span>
  );
}
