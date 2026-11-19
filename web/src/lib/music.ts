// Background music for the vocabulary games: soft wedding-style piano pieces, synthesised live with
// the Web Audio API (no audio files). The pieces are original: each one is a chord loop played as a
// broken-chord left hand, with a seeded right-hand melody that comes and goes by section, through a
// small reverb. One piece plays at a time and a random new one follows after a few minutes.

type Quality = "maj" | "min" | "maj7" | "min7" | "dom7" | "sus4" | "add9";

export type Track = {
  id: string;
  name: string;
  /** Eighth notes per minute ÷ 2 (i.e. quarter-note bpm). */
  bpm: number;
  /** Eighth notes per bar: 8 = 4/4, 6 = 3/4. */
  steps: 6 | 8;
  /** MIDI note of the tonic (left-hand octave). */
  root: number;
  /** One chord per bar: semitones above the root and the chord quality. */
  chords: [number, Quality][];
  /**
   * Left hand, one entry per eighth note: an index into the chord's spread voicing
   * (0 root, 1 fifth, 2 octave, 3 tenth, 4 octave+fifth) or "-" for a rest.
   */
  left: string;
};

export const TRACKS: Track[] = [
  {
    id: "aisle",
    name: "Bước vào lễ đường",
    bpm: 64,
    steps: 8,
    root: 38, // D
    chords: [[0, "maj"], [7, "maj"], [9, "min"], [4, "min"], [5, "maj"], [0, "maj"], [5, "maj"], [7, "sus4"]],
    left: "01231321",
  },
  {
    id: "ring",
    name: "Nhẫn cưới",
    bpm: 70,
    steps: 8,
    root: 36, // C
    chords: [[0, "add9"], [9, "min7"], [5, "maj7"], [7, "dom7"]],
    left: "02130213",
  },
  {
    id: "waltz",
    name: "Valse hoa cưới",
    bpm: 84,
    steps: 6,
    root: 41, // F
    chords: [[0, "maj"], [5, "maj"], [2, "min7"], [7, "dom7"], [0, "maj"], [9, "min"], [5, "maj7"], [7, "sus4"]],
    left: "0-3-4-",
  },
  {
    id: "sunset",
    name: "Nắng chiều tiệc cưới",
    bpm: 74,
    steps: 8,
    root: 43, // G
    chords: [[0, "maj"], [11, "min"], [9, "min7"], [7, "maj"], [5, "maj7"], [4, "min7"], [2, "min7"], [7, "sus4"]],
    left: "0-12-3-2",
  },
  {
    id: "vow",
    name: "Lời hứa",
    bpm: 58,
    steps: 8,
    root: 44, // Ab
    chords: [[0, "add9"], [4, "min7"], [5, "maj7"], [7, "sus4"], [9, "min7"], [5, "maj7"], [0, "maj"], [7, "dom7"]],
    left: "01234321",
  },
  {
    id: "forever",
    name: "Mãi bên nhau",
    bpm: 66,
    steps: 6,
    root: 39, // Eb
    chords: [[0, "maj7"], [9, "min7"], [2, "min7"], [7, "sus4"]],
    left: "012321",
  },
];

const INTERVALS: Record<Quality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
};
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** Chord tones of a bar as pitch classes relative to the track's root. */
function chordPcs(track: Track, bar: number): number[] {
  const [offset, q] = track.chords[bar % track.chords.length]!;
  return INTERVALS[q].map((i) => (offset + i) % 12);
}

/** The left hand's spread voicing for a bar: root, fifth, octave, tenth, octave+fifth. */
export function leftVoicing(track: Track, bar: number): number[] {
  const [offset, q] = track.chords[bar % track.chords.length]!;
  const r = track.root + offset - (offset > 6 ? 12 : 0);
  const third = INTERVALS[q][1]!;
  return [r, r + 7, r + 12, r + 12 + (third === 2 ? 2 : third), r + 19];
}

/** Rhythms for one bar of melody, in eighth notes. */
const RHYTHMS: Record<6 | 8, number[][]> = {
  8: [[2, 2, 4], [3, 1, 4], [2, 2, 2, 2], [4, 4], [1, 1, 2, 4], [2, 1, 1, 4], [8]],
  6: [[2, 2, 2], [4, 2], [3, 1, 2], [2, 4], [6]],
};

export type Note = { at: number; midi: number; len: number };

/** A deterministic right-hand melody for the whole chord loop (times in eighth notes). */
export function melody(track: Track, seed: number): Note[] {
  let s = (seed * 2654435761) >>> 0 || 1;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  const top = track.root + 36; // melody range: two octaves above the left hand's root
  const scale: number[] = [];
  for (let m = top - 5; m <= top + 14; m++) if (MAJOR.includes((((m - track.root) % 12) + 12) % 12)) scale.push(m);
  const nearestChordTone = (from: number, bar: number) => {
    const pcs = chordPcs(track, bar);
    let best = scale[0]!;
    for (const m of scale) {
      const pc = (((m - track.root) % 12) + 12) % 12;
      if (pcs.includes(pc) && Math.abs(m - from) + rnd() * 3 < Math.abs(best - from)) best = m;
    }
    return best;
  };
  const notes: Note[] = [];
  let prev = top + 4;
  const bars = track.chords.length;
  for (let bar = 0; bar < bars; bar++) {
    const opts = RHYTHMS[track.steps];
    const rhythm = bar === bars - 1 ? [track.steps] : opts[Math.floor(rnd() * opts.length)]!;
    let at = bar * track.steps;
    rhythm.forEach((len, k) => {
      let midi: number;
      if (k === 0 || len >= 4) midi = nearestChordTone(prev + Math.round((rnd() - 0.5) * 6), bar);
      else {
        const i = scale.indexOf(prev);
        const j = Math.max(0, Math.min(scale.length - 1, (i < 0 ? 5 : i) + (rnd() < 0.5 ? -1 : 1) * (rnd() < 0.8 ? 1 : 2)));
        midi = scale[j]!;
      }
      if (bar === bars - 1) midi = nearestChordTone(prev, bar);
      notes.push({ at, midi, len });
      prev = midi;
      at += len;
    });
  }
  return notes;
}

/** A random track index, never the one that just played. */
export function pickTrack(last: number | null, rnd = Math.random): number {
  if (TRACKS.length < 2) return 0;
  let i = Math.floor(rnd() * TRACKS.length);
  if (i === last) i = (i + 1 + Math.floor(rnd() * (TRACKS.length - 1))) % TRACKS.length;
  return i;
}

const midiHz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** How each pass through the loop sounds: [melody on, melody an octave up, new melody]. */
const SECTIONS: [boolean, boolean][] = [
  [false, false],
  [true, false],
  [true, false],
  [true, true],
  [false, false],
  [true, false],
];
const PASSES_PER_TRACK = 6;

const VOLUME = 0.22;
const DUCKED = 0.3; // share of the volume kept while a voice is speaking

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null;
let pianoWave: PeriodicWave | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let current: number | null = null;
let tunes: Note[][] = [];
let step = 0;
let nextTime = 0;
let voices = 0;
let paused = false;
const listeners = new Set<(name: string | null) => void>();

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // Dry signal plus a soft hall reverb (decaying noise impulse).
  bus = ctx.createGain();
  bus.connect(master);
  const rev = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 2.6);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  rev.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  bus.connect(rev).connect(wet).connect(master);
  // A piano-ish tone: a strong fundamental with quickly thinning overtones.
  const harmonics = [0, 1, 0.42, 0.22, 0.14, 0.07, 0.05, 0.025, 0.015];
  pianoWave = ctx.createPeriodicWave(new Float32Array(harmonics.length), new Float32Array(harmonics));
  return ctx;
}

const level = () => VOLUME * (voices > 0 ? DUCKED : 1);

function ramp(to: number, secs: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(to, t + secs);
}

/** One piano note: hammer attack, quick drop, long decay, darker as it fades. */
function piano(t: number, midi: number, vel: number, held: number) {
  const c = ctx!;
  const f = midiHz(midi);
  const ring = Math.max(0.9, Math.min(4.5, 4.2 - (midi - 40) * 0.07));
  const end = t + Math.min(ring, held + 0.5);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.006);
  g.gain.exponentialRampToValueAtTime(vel * 0.45, t + 0.18);
  g.gain.exponentialRampToValueAtTime(vel * 0.12, t + Math.min(ring, held + 0.1));
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(Math.min(12000, f * 7), t);
  lp.frequency.exponentialRampToValueAtTime(Math.min(8000, f * 2.2), t + 0.8);
  lp.connect(g).connect(bus!);
  for (const cents of [-4, 4]) {
    const o = c.createOscillator();
    o.setPeriodicWave(pianoWave!);
    o.frequency.value = f;
    o.detune.value = cents;
    o.connect(lp);
    o.start(t);
    o.stop(end + 0.05);
  }
}

function scheduleStep(track: Track, s: number, t: number) {
  const eighth = 60 / track.bpm / 2;
  const loop = track.steps * track.chords.length;
  const i = s % track.steps;
  const bar = Math.floor(s / track.steps) % track.chords.length;
  const pass = Math.floor(s / loop);
  // A little human timing and touch.
  const at = t + (Math.random() - 0.5) * 0.012;

  const idx = track.left[i];
  if (idx && idx !== "-") {
    const v = leftVoicing(track, bar);
    const note = v[Number(idx)]!;
    const held = (track.steps - i) * eighth; // pedal down until the bar ends
    piano(at, note, (i === 0 ? 0.32 : 0.2) + Math.random() * 0.04, held);
  }

  const [on, up] = SECTIONS[pass % SECTIONS.length]!;
  if (!on) return;
  const tune = tunes[Math.floor(pass / 3) % tunes.length]!;
  const pos = s % loop;
  for (const n of tune) {
    if (n.at !== pos) continue;
    const vel = 0.36 + Math.random() * 0.06;
    piano(at + 0.006, n.midi + (up ? 12 : 0), up ? vel * 0.8 : vel, n.len * eighth);
    if (n.len >= 4) piano(at + 0.01, n.midi - 12 + (up ? 12 : 0), vel * 0.35, n.len * eighth); // octave below on long notes
  }
}

function tick() {
  if (!ctx || current === null) return;
  const track = TRACKS[current]!;
  const eighth = 60 / track.bpm / 2;
  while (nextTime < ctx.currentTime + 0.2) {
    scheduleStep(track, step, nextTime);
    nextTime += eighth;
    step++;
    if (step >= track.steps * track.chords.length * PASSES_PER_TRACK) {
      load(pickTrack(current));
      return;
    }
  }
}

function load(index: number) {
  current = index;
  const track = TRACKS[index]!;
  const seed = Math.floor(Math.random() * 1e9);
  tunes = [melody(track, seed), melody(track, seed + 1)];
  step = 0;
  nextTime = (ctx?.currentTime ?? 0) + 0.1;
  for (const l of listeners) l(track.name);
}

/** Start (or switch to) a random piece. Call from a click so the browser allows audio. */
export function startMusic(): void {
  const c = ensureContext();
  if (!c) return;
  paused = false;
  void c.resume();
  if (timer === null) timer = setInterval(tick, 25);
  load(pickTrack(current));
  ramp(level(), 0.8);
}

export function nextTrack(): void {
  if (current === null) return startMusic();
  ramp(0, 0.25);
  setTimeout(() => {
    if (current === null) return;
    load(pickTrack(current));
    ramp(level(), 0.5);
  }, 280);
}

export function pauseMusic(): void {
  if (!ctx || current === null) return;
  paused = true;
  ramp(0, 0.2);
  setTimeout(() => paused && current !== null && void ctx?.suspend(), 220);
}

export function resumeMusic(): void {
  if (!ctx || current === null) return startMusic();
  paused = false;
  void ctx.resume().then(() => {
    nextTime = ctx!.currentTime + 0.05;
    ramp(level(), 0.5);
  });
}

export function stopMusic(): void {
  if (timer !== null) clearInterval(timer);
  timer = null;
  current = null;
  ramp(0, 0.6);
  for (const l of listeners) l(null);
}

export function onTrackChange(l: (name: string | null) => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Lower the music while a word or a line is read aloud. Returns the release function. */
export function duckForVoice(): () => void {
  voices++;
  if (current !== null) ramp(level(), 0.08);
  let done = false;
  const release = () => {
    if (done) return;
    done = true;
    clearTimeout(safety);
    voices = Math.max(0, voices - 1);
    if (current !== null) ramp(level(), 0.6);
  };
  // Some browsers never fire onend for a cancelled utterance: don't stay quiet forever.
  const safety = setTimeout(release, 20000);
  return release;
}
