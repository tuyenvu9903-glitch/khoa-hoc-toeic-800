import { describe, expect, it } from "vitest";
import { leftVoicing, melody, pickTrack, TRACKS } from "./music";

describe("piano pieces", () => {
  it("ids are unique and every left-hand pattern fills one bar", () => {
    expect(new Set(TRACKS.map((t) => t.id)).size).toBe(TRACKS.length);
    for (const t of TRACKS) {
      expect(t.left).toHaveLength(t.steps);
      expect(t.left).toMatch(/^[0-4-]+$/);
      for (let b = 0; b < t.chords.length; b++) expect(leftVoicing(t, b)).toHaveLength(5);
    }
  });

  it("melody fills the loop bar by bar, stays in range and repeats per seed", () => {
    for (const t of TRACKS) {
      const m = melody(t, 7);
      expect(melody(t, 7)).toEqual(m);
      const total = m.reduce((n, x) => n + x.len, 0);
      expect(total).toBe(t.steps * t.chords.length);
      for (const n of m) {
        expect(n.midi).toBeGreaterThanOrEqual(t.root + 30);
        expect(n.midi).toBeLessThanOrEqual(t.root + 50);
      }
      // Ends on a long note.
      expect(m.at(-1)!.len).toBe(t.steps);
    }
  });

  it("never picks the piece that just played", () => {
    for (let last = 0; last < TRACKS.length; last++) {
      for (let k = 0; k < 20; k++) expect(pickTrack(last, () => (k + 0.5) / 20)).not.toBe(last);
    }
  });
});
