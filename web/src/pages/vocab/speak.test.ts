import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let release: () => void = () => {};
const stopMascot = vi.fn();
vi.mock("../../voice/mascotVoice", () => ({
  mascotDone: () => new Promise<void>((r) => (release = r)),
  stopMascot: () => stopMascot(),
}));

let spoken: string[] = [];
beforeEach(() => {
  vi.useFakeTimers();
  spoken = [];
  stopMascot.mockClear();
  vi.stubGlobal("window", { speechSynthesis: { cancel() {}, speak: (u: { text: string }) => spoken.push(u.text), getVoices: () => [], addEventListener() {}, removeEventListener() {} } });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("speak", () => {
  it("an automatic read waits until Tám has finished", async () => {
    const { speak } = await import("./shared");
    speak("transfer", { afterTam: true });
    await vi.advanceTimersByTimeAsync(3000);
    expect(spoken).toEqual([]);
    release();
    await vi.advanceTimersByTimeAsync(0);
    expect(spoken).toEqual(["transfer"]);
  });

  it("a click reads at once and cuts Tám off; a newer read replaces a waiting one", async () => {
    const { speak } = await import("./shared");
    speak("assign", { afterTam: true });
    speak("transfer");
    expect(spoken).toEqual(["transfer"]);
    expect(stopMascot).toHaveBeenCalled();
    release();
    await vi.advanceTimersByTimeAsync(9000);
    expect(spoken).toEqual(["transfer"]);
  });
});
