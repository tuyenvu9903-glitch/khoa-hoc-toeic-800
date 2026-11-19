// Background music for the vocabulary games, synthesised live with the Web Audio API (no audio files,
// all pieces original). Two styles:
// - "remix": Vinahouse/TikTok-remix style: four-on-the-floor kick, rolling bass, build-ups and drops,
//   a pentatonic (ngũ cung) hook on a synthesised bamboo flute (sáo), monochord (đàn bầu) or saw lead.
// - "piano": soft wedding-style piano: broken-chord left hand, seeded right-hand melody, reverb.
// One piece plays at a time and a random new one of the chosen style follows after a couple of minutes.

type Quality = "maj" | "min" | "maj7" | "min7" | "dom7" | "sus4" | "add9";

export type PianoTrack = {
  kind: "piano";
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

export type RemixTrack = {
  kind: "remix";
  id: string;
  name: string;
  bpm: number;
  /** MIDI note of the tonic (bass octave). */
  root: number;
  /** One minor/major chord per bar, 4 bars, semitones above the root. */
  chords: [number, "min" | "maj"][];
  lead: "sao" | "danbau" | "saw";
  /** "roll": 16th notes between kicks; "offbeat": one note on each "and". */
  bass: "roll" | "offbeat";
};

export type Track = PianoTrack | RemixTrack;
export type MusicStyle = "remix" | "piano" | "mine";
type SynthStyle = "remix" | "piano";
/** A file the learner added (see myMusic.ts). */
export type MyTrack = { id: string; name: string };

const REMIX: RemixTrack[] = [
  { kind: "remix", id: "vina-ga", name: "Vinahouse Gà Mờ", bpm: 136, root: 33, chords: [[0, "min"], [8, "maj"], [10, "maj"], [0, "min"]], lead: "saw", bass: "roll" },
  { kind: "remix", id: "sao", name: "Sáo trúc lên đồ", bpm: 132, root: 38, chords: [[0, "min"], [10, "maj"], [8, "maj"], [7, "min"]], lead: "sao", bass: "roll" },
  { kind: "remix", id: "danbau", name: "Đàn bầu bass căng", bpm: 128, root: 40, chords: [[0, "min"], [5, "min"], [10, "maj"], [3, "maj"]], lead: "danbau", bass: "offbeat" },
  { kind: "remix", id: "ngucung", name: "Ngũ cung cực cháy", bpm: 140, root: 31, chords: [[0, "min"], [3, "maj"], [10, "maj"], [5, "min"]], lead: "sao", bass: "roll" },
  { kind: "remix", id: "phongthi", name: "Bay phòng thi", bpm: 134, root: 36, chords: [[0, "min"], [8, "maj"], [3, "maj"], [10, "maj"]], lead: "saw", bass: "offbeat" },
  { kind: "remix", id: "deadline", name: "Deadline remix", bpm: 138, root: 35, chords: [[0, "min"], [0, "min"], [8, "maj"], [10, "maj"]], lead: "danbau", bass: "roll" },
];

const PIANO: PianoTrack[] = [
  {
    kind: "piano",
    id: "aisle",
    name: "Bước vào lễ đường",
    bpm: 64,
    steps: 8,
    root: 38, // D
    chords: [[0, "maj"], [7, "maj"], [9, "min"], [4, "min"], [5, "maj"], [0, "maj"], [5, "maj"], [7, "sus4"]],
    left: "01231321",
  },
  {
    kind: "piano",
    id: "ring",
    name: "Nhẫn cưới",
    bpm: 70,
    steps: 8,
    root: 36, // C
    chords: [[0, "add9"], [9, "min7"], [5, "maj7"], [7, "dom7"]],
    left: "02130213",
  },
  {
    kind: "piano",
    id: "waltz",
    name: "Valse hoa cưới",
    bpm: 84,
    steps: 6,
    root: 41, // F
    chords: [[0, "maj"], [5, "maj"], [2, "min7"], [7, "dom7"], [0, "maj"], [9, "min"], [5, "maj7"], [7, "sus4"]],
    left: "0-3-4-",
  },
  {
    kind: "piano",
    id: "sunset",
    name: "Nắng chiều tiệc cưới",
    bpm: 74,
    steps: 8,
    root: 43, // G
    chords: [[0, "maj"], [11, "min"], [9, "min7"], [7, "maj"], [5, "maj7"], [4, "min7"], [2, "min7"], [7, "sus4"]],
    left: "0-12-3-2",
  },
  {
    kind: "piano",
    id: "vow",
    name: "Lời hứa",
    bpm: 58,
    steps: 8,
    root: 44, // Ab
    chords: [[0, "add9"], [4, "min7"], [5, "maj7"], [7, "sus4"], [9, "min7"], [5, "maj7"], [0, "maj"], [7, "dom7"]],
    left: "01234321",
  },
  {
    kind: "piano",
    id: "forever",
    name: "Mãi bên nhau",
    bpm: 66,
    steps: 6,
    root: 39, // Eb
    chords: [[0, "maj7"], [9, "min7"], [2, "min7"], [7, "sus4"]],
    left: "012321",
  },
];

export const TRACKS: Track[] = [...REMIX, ...PIANO];

/** Indexes of the tracks of one style. */
export const tracksOf = (style: SynthStyle) => TRACKS.flatMap((t, i) => (t.kind === style ? [i] : []));

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
function chordPcs(track: PianoTrack, bar: number): number[] {
  const [offset, q] = track.chords[bar % track.chords.length]!;
  return INTERVALS[q].map((i) => (offset + i) % 12);
}

/** The left hand's spread voicing for a bar: root, fifth, octave, tenth, octave+fifth. */
export function leftVoicing(track: PianoTrack, bar: number): number[] {
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
export function melody(track: PianoTrack, seed: number): Note[] {
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

const PENTA = [0, 3, 5, 7, 10]; // minor pentatonic: the ngũ cung sound
/** Bar rhythms for the remix hook in 16th steps: [start, length]. */
const HOOK_RHYTHMS: [number, number][][] = [
  [[0, 3], [3, 3], [6, 2], [8, 4], [12, 4]],
  [[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 4]],
  [[0, 4], [6, 2], [8, 3], [11, 1], [12, 4]],
  [[0, 2], [3, 1], [4, 2], [6, 2], [8, 6], [14, 2]],
  [[0, 3], [3, 3], [6, 4], [10, 2], [12, 2], [14, 2]],
];
export const HOOK_BARS = 8;

/**
 * The remix hook over 8 bars (times in 16th steps): a 2-bar motif, a variation, the motif again and
 * an ending on the tonic, so it is catchy rather than random.
 */
export function hook(track: RemixTrack, seed: number): Note[] {
  let s = (seed * 2654435761) >>> 0 || 1;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  const scale: number[] = [];
  for (let m = track.root + 21; m <= track.root + 41; m++) if (PENTA.includes((m - track.root) % 12)) scale.push(m);
  let at = Math.floor(scale.length / 2);
  const bar = (b: number, last = false): Note[] => {
    const [off, q] = track.chords[b % track.chords.length]!;
    const pcs = (q === "min" ? [0, 3, 7] : [0, 4, 7]).map((i) => (off + i) % 12);
    const rhythm = last ? ([[0, 4], [4, 12]] as [number, number][]) : HOOK_RHYTHMS[Math.floor(rnd() * HOOK_RHYTHMS.length)]!;
    return rhythm.map(([start, len], k) => {
      if (k === 0 || (last && k === 1)) {
        // Land on a chord tone near where the line is (the tonic at the very end).
        const want = last && k === 1 ? [0] : pcs;
        let best = at;
        for (let i = 0; i < scale.length; i++)
          if (want.includes((scale[i]! - track.root) % 12) && Math.abs(i - at) + rnd() * 1.5 < Math.abs(best - at) + (want.includes((scale[best]! - track.root) % 12) ? 0 : 99)) best = i;
        at = best;
      } else at = Math.max(0, Math.min(scale.length - 1, at + (rnd() < 0.5 ? -1 : 1) * (rnd() < 0.75 ? 1 : 2)));
      return { at: b * 16 + start, midi: scale[at]!, len };
    });
  };
  const b0 = bar(0);
  const b1 = bar(1);
  const shift = (ns: Note[], bars: number) => ns.map((n) => ({ ...n, at: n.at + bars * 16 }));
  return [...b0, ...b1, ...shift(b0, 2), ...bar(3), ...shift(b0, 4), ...shift(b1, 4), ...shift(b0, 6), ...bar(7, true)];
}

/** A random track of the given ones, never the one that just played. */
export function pickTrack(last: number | null, pool: number[] = TRACKS.map((_, i) => i), rnd = Math.random): number {
  const options = pool.length > 1 ? pool.filter((i) => i !== last) : pool;
  return options[Math.floor(rnd() * options.length)]!;
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
const PIANO_PASSES = 6;

type Part = "intro" | "build" | "drop" | "drop2" | "break";
/** One 8-bar section per pass: about 2 minutes per remix. */
const REMIX_FORM: Part[] = ["intro", "build", "drop", "drop2", "break", "build", "drop", "drop2"];

const VOLUME = 0.22;
const DUCKED = 0.3; // share of the volume kept while a voice is speaking

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null;
let pianoWave: PeriodicWave | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let current: number | null = null;
let tunes: Note[][] = [];
let style: MusicStyle = "remix";
let pump: GainNode | null = null;
let drums: GainNode | null = null;
let send: GainNode | null = null;
let noise: AudioBuffer | null = null;
let riser: AudioBufferSourceNode | null = null;
let step = 0;
let nextTime = 0;
let voices = 0;
let paused = false;
/** `current` while one of the learner's own files is playing. */
const MINE = -1;
let myTracks: MyTrack[] = [];
let myBlob: ((id: string) => Promise<Blob | null>) | null = null;
let mineId: string | null = null;
let mineToken = 0;
let el: HTMLAudioElement | null = null;
let elUrl: string | null = null;
const MINE_GAIN = 1.8; // real songs are mixed for the foreground; this keeps them as loud as the synth
const listeners = new Set<(name: string | null) => void>();

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  // Remix buses: drums straight out; bass, pad and lead "pump" under the kick (sidechain feel).
  drums = ctx.createGain();
  drums.connect(master);
  pump = ctx.createGain();
  pump.connect(master);
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
  send = ctx.createGain();
  send.gain.value = 0.3;
  send.connect(rev);
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

function scheduleStep(track: PianoTrack, s: number, t: number) {
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

// ---- Remix instruments -------------------------------------------------------------------------

function env(t: number, peak: number, attack: number, hold: number, release: number): GainNode {
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  return g;
}

function noiseHit(t: number, dur: number, type: BiquadFilterType, freq: number, gain: number, q = 0.7) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(drums!);
  src.start(t, Math.random());
  src.stop(t + dur + 0.02);
}

function kickHit(t: number) {
  const c = ctx!;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(165, t);
  o.frequency.exponentialRampToValueAtTime(46, t + 0.09);
  const g = c.createGain();
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
  o.connect(g).connect(drums!);
  o.start(t);
  o.stop(t + 0.4);
  noiseHit(t, 0.012, "highpass", 3000, 0.25);
  // Sidechain pump.
  pump!.gain.cancelScheduledValues(t);
  pump!.gain.setValueAtTime(0.25, t);
  pump!.gain.linearRampToValueAtTime(1, t + 0.17);
}

function clapHit(t: number, gain = 0.55) {
  for (const d of [0, 0.011, 0.022]) noiseHit(t + d, 0.03, "bandpass", 1300, gain);
  noiseHit(t + 0.03, 0.18, "bandpass", 1200, gain * 0.6);
}

function bassNote(t: number, midi: number, dur: number) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = midiHz(midi);
  const sub = c.createOscillator();
  sub.frequency.value = midiHz(midi - 12);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(1100, t);
  f.frequency.exponentialRampToValueAtTime(260, t + dur);
  f.Q.value = 6;
  const g = env(t, 0.32, 0.004, dur * 0.4, dur * 0.6);
  o.connect(f);
  sub.connect(f);
  f.connect(g).connect(pump!);
  for (const x of [o, sub]) {
    x.start(t);
    x.stop(t + dur + 0.05);
  }
}

function padChord(t: number, notes: number[], dur: number) {
  const c = ctx!;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1000;
  const g = env(t, 0.05, 0.25, dur - 0.5, 0.25);
  f.connect(g).connect(pump!);
  for (const n of notes)
    for (const d of [-9, 9]) {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midiHz(n);
      o.detune.value = d;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
}

let danbauWave: PeriodicWave | null = null;

/** The hook: bamboo flute (breathy sine, vibrato, small scoop), đàn bầu (bending pluck) or a saw lead. */
function leadNote(t: number, midi: number, dur: number, kind: RemixTrack["lead"], vel = 1) {
  const c = ctx!;
  const f = midiHz(midi);
  const out = c.createGain();
  out.connect(pump!);
  out.connect(send!);
  const vib = (rate: number, depth: number, from: number, osc: OscillatorNode) => {
    const l = c.createOscillator();
    l.frequency.value = rate;
    const lg = c.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(0, t + from);
    lg.gain.linearRampToValueAtTime(f * depth, t + from + 0.2);
    l.connect(lg).connect(osc.frequency);
    l.start(t);
    l.stop(t + dur + 0.6);
  };
  if (kind === "saw") {
    const flt = c.createBiquadFilter();
    flt.type = "lowpass";
    flt.frequency.value = 3600;
    const g = env(t, 0.07 * vel, 0.01, Math.max(0.02, dur - 0.06), 0.12);
    flt.connect(g).connect(out);
    for (const d of [-14, 0, 14]) {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = d;
      o.connect(flt);
      o.start(t);
      o.stop(t + dur + 0.2);
    }
    return;
  }
  const o = c.createOscillator();
  if (kind === "sao") {
    o.type = "sine";
    o.frequency.setValueAtTime(f * 0.95, t);
    o.frequency.linearRampToValueAtTime(f, t + 0.05);
    vib(5.6, 0.011, 0.14, o);
    const g = env(t, 0.24 * vel, 0.035, Math.max(0.02, dur - 0.1), 0.14);
    const h = c.createOscillator();
    h.type = "triangle";
    h.frequency.value = f * 2;
    const hg = c.createGain();
    hg.gain.value = 0.12;
    h.connect(hg).connect(g);
    o.connect(g).connect(out);
    h.start(t);
    h.stop(t + dur + 0.3);
    // Breath.
    const b = c.createBufferSource();
    b.buffer = noise;
    const bf = c.createBiquadFilter();
    bf.type = "bandpass";
    bf.frequency.value = f * 2;
    bf.Q.value = 3;
    const bg = env(t, 0.05 * vel, 0.02, 0.03, 0.12);
    b.connect(bf).connect(bg).connect(out);
    b.start(t, Math.random());
    b.stop(t + 0.3);
  } else {
    danbauWave ??= c.createPeriodicWave(new Float32Array(6), new Float32Array([0, 1, 0.35, 0.18, 0.08, 0.04]));
    o.setPeriodicWave(danbauWave);
    o.frequency.setValueAtTime(f * 0.89, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.13);
    vib(6.2, 0.02, 0.18, o);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3 * vel, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.1 * vel, t + Math.max(0.15, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
    o.connect(g).connect(out);
  }
  o.start(t);
  o.stop(t + dur + 0.6);
}

function startRiser(t: number, dur: number) {
  const c = ctx!;
  riser?.stop();
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 2;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(7000, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + dur * 0.97);
  g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(f).connect(g).connect(drums!);
  src.start(t);
  src.stop(t + dur + 0.05);
  riser = src;
}

function scheduleRemix(track: RemixTrack, s: number, t: number) {
  const sixteenth = 60 / track.bpm / 4;
  const i = s % 16;
  const barInPass = Math.floor(s / 16) % HOOK_BARS;
  const pass = Math.floor(s / (16 * HOOK_BARS));
  const part = REMIX_FORM[pass % REMIX_FORM.length]!;
  const [off, q] = track.chords[barInPass % track.chords.length]!;
  const chordRoot = track.root + off - (off > 7 ? 12 : 0);
  const full = part === "drop" || part === "drop2";

  // Drums.
  if (full && i % 4 === 0) kickHit(t);
  if (full && (i === 4 || i === 12)) clapHit(t);
  if (part !== "break" && i % 2 === 0) noiseHit(t, 0.03, "highpass", 9000, i % 4 === 2 ? 0.16 : 0.08);
  if (full && i % 4 === 2) noiseHit(t, 0.12, "highpass", 7000, part === "drop2" ? 0.2 : 0.13);
  if (part === "build") {
    if (barInPass === 0 && i === 0) startRiser(t, sixteenth * 16 * HOOK_BARS);
    const every = barInPass < 4 ? 4 : barInPass < 6 ? 2 : 1;
    const silent = barInPass === HOOK_BARS - 1 && i >= 12; // the gap before the drop
    if (!silent && i % every === 0) clapHit(t, 0.12 + 0.4 * ((barInPass * 16 + i) / (16 * HOOK_BARS)));
    if (barInPass >= 4 && !silent && i % 4 === 0) kickHit(t);
  }

  // Bass.
  if (full) {
    const hit = track.bass === "roll" ? i % 4 !== 0 : i % 4 === 2;
    if (hit) bassNote(t, chordRoot + (track.bass === "roll" && i % 4 === 3 ? 12 : 0), sixteenth * (track.bass === "roll" ? 0.9 : 1.8));
  }

  // Pad.
  if (i === 0 && part !== "build") {
    const third = q === "min" ? 3 : 4;
    padChord(t, [chordRoot + 12, chordRoot + 12 + third, chordRoot + 19], sixteenth * 16);
  }

  // Hook.
  if (part === "build" && barInPass >= 4) return;
  const tune = tunes[pass % 2]!;
  const pos = s % (16 * HOOK_BARS);
  for (const n of tune) {
    if (n.at !== pos) continue;
    const vel = part === "intro" || part === "break" ? 0.75 : 1;
    leadNote(t, n.midi, n.len * sixteenth, track.lead, vel);
    if (part === "drop2") leadNote(t, n.midi - 12, n.len * sixteenth, "saw", 0.6);
  }
}

const stepSecs = (track: Track) => (track.kind === "piano" ? 60 / track.bpm / 2 : 60 / track.bpm / 4);
const trackSteps = (track: Track) =>
  track.kind === "piano" ? track.steps * track.chords.length * PIANO_PASSES : 16 * HOOK_BARS * REMIX_FORM.length;

function tick() {
  if (!ctx || current === null || current === MINE) return;
  const track = TRACKS[current]!;
  while (nextTime < ctx.currentTime + 0.2) {
    if (track.kind === "piano") scheduleStep(track, step, nextTime);
    else scheduleRemix(track, step, nextTime);
    nextTime += stepSecs(track);
    step++;
    if (step >= trackSteps(track)) {
      loadNext();
      return;
    }
  }
}

const useMine = () => style === "mine" && myTracks.length > 0 && myBlob !== null && typeof Audio !== "undefined";

function stopMine() {
  mineToken++;
  el?.pause();
  if (elUrl) URL.revokeObjectURL(elUrl);
  elUrl = null;
  mineId = null;
}

/** Play one of the learner's files (never the one that just played) through the music bus. */
function loadMine() {
  const pool = myTracks.length > 1 ? myTracks.filter((t) => t.id !== mineId) : myTracks;
  const t = pool[Math.floor(Math.random() * pool.length)]!;
  stopMine();
  riser?.stop();
  riser = null;
  current = MINE;
  mineId = t.id;
  for (const l of listeners) l(t.name);
  const token = mineToken;
  void myBlob!(t.id)
    .then((blob) => {
      if (token !== mineToken || current !== MINE || !ctx || !master) return;
      if (!blob) return void (myTracks.length > 1 && loadNext());
      if (!el) {
        el = new Audio();
        el.onended = () => current === MINE && loadNext();
        el.onerror = () => current === MINE && myTracks.length > 1 && setTimeout(loadNext, 500);
        const g = ctx.createGain();
        g.gain.value = MINE_GAIN;
        ctx.createMediaElementSource(el).connect(g).connect(master);
      }
      elUrl = URL.createObjectURL(blob);
      el.src = elUrl;
      if (!paused) void el.play().catch(() => {});
    })
    .catch(() => {});
}

/** The next song of the chosen style (synth styles when the learner has no files). */
function loadNext() {
  if (useMine()) return loadMine();
  stopMine();
  const synth: SynthStyle = style === "mine" ? "remix" : style;
  load(pickTrack(current === MINE ? null : current, tracksOf(synth)));
}

/** Tell the player which files the learner has (and how to read them). */
export function setMyTracks(list: MyTrack[], getBlob: (id: string) => Promise<Blob | null>): void {
  myTracks = list;
  myBlob = getBlob;
  const gone = current === MINE && !list.some((t) => t.id === mineId);
  const nowAvailable = current !== null && current !== MINE && useMine();
  if (gone || nowAvailable) nextTrack();
}

function load(index: number) {
  current = index;
  const track = TRACKS[index]!;
  const seed = Math.floor(Math.random() * 1e9);
  tunes = track.kind === "piano" ? [melody(track, seed), melody(track, seed + 1)] : [hook(track, seed), hook(track, seed + 1)];
  riser?.stop();
  riser = null;
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
  loadNext();
  ramp(level(), 0.8);
}

export function nextTrack(): void {
  if (current === null) return startMusic();
  ramp(0, 0.25);
  setTimeout(() => {
    if (current === null) return;
    loadNext();
    ramp(level(), 0.5);
  }, 280);
}

/** Choose remix, piano or the learner's files; switches the song now if another style is playing. */
export function setMusicStyle(next: MusicStyle): void {
  if (next === style) return;
  style = next;
  if (current !== null) nextTrack();
}

export function pauseMusic(): void {
  if (!ctx || current === null) return;
  paused = true;
  el?.pause();
  ramp(0, 0.2);
  setTimeout(() => paused && current !== null && void ctx?.suspend(), 220);
}

export function resumeMusic(): void {
  if (!ctx || current === null) return startMusic();
  paused = false;
  if (current === MINE && el?.src) void el.play().catch(() => {});
  void ctx.resume().then(() => {
    nextTime = ctx!.currentTime + 0.05;
    ramp(level(), 0.5);
  });
}

export function stopMusic(): void {
  if (timer !== null) clearInterval(timer);
  timer = null;
  current = null;
  stopMine();
  riser?.stop();
  riser = null;
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
