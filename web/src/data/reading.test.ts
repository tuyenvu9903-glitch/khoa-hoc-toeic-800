import { describe, expect, it } from "vitest";
import { skillRows } from "./curriculum";
import { dailyPlan, missionLink, planForDay } from "./dailyPlan";
import { PART5_SKILLS, part5Items, part7Sets } from "./reading";
import { vocabulary } from "./vocabulary";

const skillByCode = new Map(skillRows.map((s) => [s.code, s]));

describe("reading bank", () => {
  it("has unique ids and valid skills", () => {
    const ids = [...part5Items.map((i) => i.id), ...part7Sets.map((s) => s.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of part5Items) expect(skillByCode.get(i.skill)?.part).toBe("5");
    for (const s of part7Sets) for (const q of s.questions) expect(skillByCode.get(q.skill)?.part).toBe("7");
  });

  it("has one blank per Part 5 sentence and four distinct options", () => {
    for (const i of part5Items) {
      expect(i.sentence.split("-------")).toHaveLength(2);
      expect(new Set(i.options).size).toBe(4);
    }
    for (const s of part7Sets) for (const q of s.questions) expect(new Set(q.options).size).toBe(4);
  });

  it("covers every Part 5 skill with several items", () => {
    for (const s of PART5_SKILLS) expect(part5Items.filter((i) => i.skill === s.code).length).toBeGreaterThanOrEqual(5);
  });
});

describe("daily plan", () => {
  it("has 56 days, 7 per week, with a test at the end of each week", () => {
    expect(dailyPlan).toHaveLength(56);
    for (let w = 1; w <= 8; w++) {
      const days = dailyPlan.filter((d) => d.week === w);
      expect(days).toHaveLength(7);
      expect(days[6]!.test).toBe(true);
    }
  });

  it("only links to existing skills and vocabulary topics", () => {
    const topics = new Set(vocabulary.map((v) => v.topic));
    for (const d of dailyPlan) {
      expect(skillByCode.has(d.grammar)).toBe(true);
      expect(topics.has(d.vocabTopic)).toBe(true);
      expect(d.lesson.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("clamps out-of-range days and builds practice links", () => {
    expect(planForDay(0).day).toBe(1);
    expect(planForDay(99).day).toBe(56);
    const d2 = planForDay(2);
    expect(missionLink("grammar", d2)).toBe("/reading?today=p5");
    expect(missionLink("listening", d2)).toBe("/listening?today=1");
    expect(missionLink("reading", d2)).toBe("/reading?today=p7");
    const d40 = planForDay(40);
    expect(missionLink("grammar", d40)).toMatch(/^\/reading\?(today=p5|part=5&skill=R\.P5\.)/);
    expect(missionLink("error_review", d2)).toBeNull();
  });
});

import { VOCAB_GROUPS, TOPIC_LABEL } from "./vocabulary";

describe("vocabulary groups", () => {
  it("place every topic in exactly one group and sum to 2,000", () => {
    const placed = VOCAB_GROUPS.flatMap((g) => g.topics);
    expect(new Set(placed).size).toBe(placed.length);
    expect(new Set(placed)).toEqual(new Set(Object.keys(TOPIC_LABEL)));
    expect(VOCAB_GROUPS.reduce((n, g) => n + g.target, 0)).toBe(2000);
  });
});
