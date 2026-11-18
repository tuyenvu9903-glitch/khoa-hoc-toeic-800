import { describe, expect, it } from "vitest";
import { skillRows } from "./curriculum";

const skillByCode = new Map(skillRows.map((s) => [s.code, s]));
import { listeningSets, part2Items } from "./listening";

describe("listening bank", () => {
  it("has unique ids", () => {
    const ids = [...part2Items.map((i) => i.id), ...listeningSets.map((s) => s.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tags every item with an existing skill of the right part", () => {
    for (const i of part2Items) expect(skillByCode.get(i.skill)?.part).toBe("2");
    for (const s of listeningSets) {
      for (const q of s.questions) expect(skillByCode.get(q.skill)?.part).toBe(s.part);
    }
  });

  it("has distinct options and a valid answer index", () => {
    for (const i of part2Items) {
      expect(new Set(i.options).size).toBe(3);
      expect(i.options[i.answer]).toBeDefined();
    }
    for (const s of listeningSets) {
      expect(s.lines.length).toBeGreaterThan(0);
      if (s.part === "4") expect(s.lines).toHaveLength(1);
      for (const q of s.questions) {
        expect(new Set(q.options).size).toBe(4);
        expect(q.options[q.answer]).toBeDefined();
      }
    }
  });
});
