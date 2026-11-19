import { describe, expect, it } from "vitest";
import { hook, HOOK_BARS, leftVoicing, melody, pickTrack, TRACKS, tracksOf, type PianoTrack, type RemixTrack } from "./music";

const piano = TRACKS.filter((t): t is PianoTrack => t.kind === "piano");
const remix = TRACKS.filter((t): t is RemixTrack => t.kind === "remix");

describe("music", () => {
  it("has both styles and unique ids", () => {
    expect(new Set(TRACKS.map((t) => t.id)).size).toBe(TRACKS.length);
    expect(tracksOf("remix").length).toBeGreaterThanOrEqual(4);
    expect(tracksOf("piano").length).toBeGreaterThanOrEqual(4);
  });

  it("piano: left hand fills one bar, melody fills the loop", () => {
    for (const t of piano) {
      expect(t.left).toHaveLength(t.steps);
      for (let b = 0; b < t.chords.length; b++) expect(leftVoicing(t, b)).toHaveLength(5);
      const m = melody(t, 7);
      expect(melody(t, 7)).toEqual(m);
      expect(m.reduce((n, x) => n + x.len, 0)).toBe(t.steps * t.chords.length);
      expect(m.at(-1)!.len).toBe(t.steps);
    }
  });

  it("remix: the hook is pentatonic, repeats its motif and ends on the tonic", () => {
    for (const t of remix) {
      for (const seed of [1, 2, 3]) {
        const h = hook(t, seed);
        expect(hook(t, seed)).toEqual(h);
        for (const n of h) {
          expect([0, 3, 5, 7, 10]).toContain((n.midi - t.root) % 12);
          expect(n.at + n.len).toBeLessThanOrEqual(16 * HOOK_BARS);
        }
        const bar = (b: number) => h.filter((n) => Math.floor(n.at / 16) === b).map((n) => [n.at % 16, n.midi, n.len]);
        expect(bar(2)).toEqual(bar(0));
        expect(bar(4)).toEqual(bar(0));
        expect(bar(5)).toEqual(bar(1));
        expect((h.at(-1)!.midi - t.root) % 12).toBe(0);
      }
    }
  });

  it("picks within the style and never repeats the last song", () => {
    const pool = tracksOf("remix");
    for (const last of pool)
      for (let k = 0; k < 20; k++) {
        const i = pickTrack(last, pool, () => (k + 0.5) / 20);
        expect(i).not.toBe(last);
        expect(pool).toContain(i);
      }
  });
});

describe("your own music", () => {
  it("recognises audio files and names them without the extension", async () => {
    const { isAudioFile, trackName } = await import("./myMusic");
    expect(isAudioFile({ name: "song.mp3", type: "" })).toBe(true);
    expect(isAudioFile({ name: "x", type: "audio/mpeg" })).toBe(true);
    expect(isAudioFile({ name: "notes.txt", type: "text/plain" })).toBe(false);
    expect(trackName("Some_Song (Remix).mp3")).toBe("Some Song (Remix)");
  });
});
