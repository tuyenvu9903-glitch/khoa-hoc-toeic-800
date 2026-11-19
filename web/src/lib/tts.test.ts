import { describe, expect, it } from "vitest";
import { clipKey, splitLetter } from "./tts";
import { ttsCatalog } from "./ttsCatalog";

describe("tts", () => {
  it("computes the same keys as tools/tts/generate.py", () => {
    // Values printed by clip_key() in generate.py.
    expect(clipKey("Trúc Ly", "Ơ kìa, não hoạt động rồi!")).toBe("b2ae982f26810f4e");
    expect(clipKey("Adam", "A.")).toBe("fd11437d7312530e");
  });

  it("splits option letters from the option text", () => {
    expect(splitLetter("B. It was moved to Friday.")).toEqual(["B", "It was moved to Friday."]);
    expect(splitLetter("When is the meeting?")).toEqual([null, "When is the meeting?"]);
  });

  it("records only Tám's Vietnamese lines (English uses the browser's voice), without placeholders", () => {
    const clips = ttsCatalog();
    expect(clips.length).toBeGreaterThan(0);
    expect(clips.every((c) => c.group === "mascot" && c.lang === "vi")).toBe(true);
    expect(clips.every((c) => !/\{\w+\}/.test(c.text))).toBe(true);
  });
});
