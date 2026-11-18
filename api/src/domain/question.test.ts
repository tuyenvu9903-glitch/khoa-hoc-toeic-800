import { describe, expect, it } from "vitest";
import { questionSchema } from "./question.js";

describe("question schema", () => {
  it("accepts a complete TOEIC item", () => {
    const parsed = questionSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      part: "5",
      skillCode: "R.P5.wordform",
      topic: "office",
      difficulty: "500",
      question: "The manager asked staff to submit their _____ by Friday.",
      options: { A: "propose", B: "proposal", C: "proposing", D: "proposed" },
      correctAnswer: "B",
      explanation: "A noun is required after their.",
      trap: "A looks related but is a verb.",
      vocabulary: [{ word: "proposal", meaning: "a formal plan", paraphrase: "suggestion" }],
      grammar: "word forms",
      estimatedTimeSec: 25,
      errorHints: ["grammar_gap", "distractor_trap"],
    });
    expect(parsed.correctAnswer).toBe("B");
  });
});
