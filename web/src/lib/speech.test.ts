import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** A fake speechSynthesis where cancel() fires onerror on pending utterances, like browsers do. */
class FakeSynth {
  spoken: string[] = [];
  queue: SpeechSynthesisUtterance[] = [];
  getVoices() {
    return [];
  }
  addEventListener() {}
  removeEventListener() {}
  speak(u: SpeechSynthesisUtterance) {
    this.spoken.push(u.text);
    this.queue.push(u);
    u.onstart?.({} as SpeechSynthesisEvent);
  }
  /** Finish the utterance currently speaking. */
  finish() {
    const u = this.queue.shift();
    u?.onend?.({} as SpeechSynthesisEvent);
  }
  cancel() {
    const q = this.queue;
    this.queue = [];
    for (const u of q) u.onerror?.({} as SpeechSynthesisErrorEvent);
  }
}

let synth: FakeSynth;

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  synth = new FakeSynth();
  vi.stubGlobal("window", { speechSynthesis: synth });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      text: string;
      lang = "";
      pitch = 1;
      rate = 1;
      voice: unknown = null;
      onstart?: (e: unknown) => void;
      onend?: (e: unknown) => void;
      onerror?: (e: unknown) => void;
      constructor(t: string) {
        this.text = t;
      }
    },
  );
  vi.stubGlobal("fetch", () => Promise.resolve({ ok: true, json: () => Promise.resolve({ keys: [] }) }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const lines = (p: string) => [
  { speaker: "W" as const, text: `${p}1` },
  { speaker: "M" as const, text: `${p}2` },
  { speaker: "M" as const, text: `${p}3` },
];

describe("playScript", () => {
  it("starting a new script ends the previous one (no interleaving)", async () => {
    const { playScript } = await import("./speech");
    const seenA: number[] = [];
    playScript(lines("a"), { onLine: (i) => seenA.push(i) });
    await vi.runAllTimersAsync();
    expect(synth.spoken).toEqual(["a1"]);

    playScript(lines("b"));
    await vi.runAllTimersAsync();
    // a1 was cancelled; its onerror must not move script A on to a2.
    for (let i = 0; i < 3; i++) {
      synth.finish();
      await vi.runAllTimersAsync();
    }
    expect(synth.spoken).toEqual(["a1", "b1", "b2", "b3"]);
    expect(seenA).toEqual([0]);
  });

  it("a stopped script never starts, even if stop comes before it begins", async () => {
    const { playScript } = await import("./speech");
    const onEnd = vi.fn();
    const stop = playScript(lines("x"), { onEnd });
    stop();
    await vi.runAllTimersAsync();
    expect(synth.spoken).toEqual([]);
    expect(onEnd).not.toHaveBeenCalled();
  });
});
