import { z } from "zod";

export const errorClassSchema = z.enum([
  "vocabulary_gap",
  "grammar_gap",
  "listening_gap",
  "reading_gap",
  "paraphrase_failure",
  "distractor_trap",
  "careless_mistake",
  "time_pressure",
  "misread",
]);

export const toeicPartSchema = z.enum(["1", "2", "3", "4", "5", "6", "7"]);

export const questionSchema = z.object({
  id: z.string().uuid(),
  part: toeicPartSchema,
  skillCode: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["400", "500", "600", "700", "800"]),
  question: z.string().min(1),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string().optional(),
  }),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(1),
  trap: z.string().min(1),
  vocabulary: z.array(
    z.object({
      word: z.string(),
      meaning: z.string(),
      paraphrase: z.string().optional(),
    }),
  ),
  grammar: z.string().nullable(),
  estimatedTimeSec: z.number().int().positive(),
  errorHints: z.array(errorClassSchema),
});

export type QuestionDto = z.infer<typeof questionSchema>;
export type ErrorClass = z.infer<typeof errorClassSchema>;
