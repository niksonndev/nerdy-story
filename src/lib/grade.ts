import { generateText, Output } from "ai";
import { z } from "zod";

import { mysteryWords } from "@/lib/story-data";

export type GradeRequest = {
  wordId: string;
  explanation: string;
};

export type GradeResult = {
  correct: boolean;
  reason: string;
};

const gradeResultSchema = z.object({
  correct: z
    .boolean()
    .describe(
      "True if the child's explanation matches the word's meaning (including simple, partial, or synonym phrasing).",
    ),
  reason: z
    .string()
    .describe(
      "One short kid-friendly sentence explaining why the answer is right or wrong. No jargon.",
    ),
});

const GRADER_SYSTEM = `You grade vocabulary explanations for children ages 7–9 (2nd–3rd grade reading level).

Rules:
- Compare the child's explanation to the target definition for semantic meaning.
- Accept simplified wording, synonyms, and partial-but-correct understanding.
- Reject answers that describe a different or wrong concept.
- Respond only via the structured fields. Keep "reason" to one short, warm, kid-friendly sentence.
- Never invent a different definition than the target provided.`;

/**
 * Live AI meaning check via AI Gateway (openai/gpt-4o-mini).
 * Looks up the target definition server-side; throws on provider/auth failure.
 */
export async function gradeExplanation(
  request: GradeRequest,
): Promise<GradeResult> {
  const word = mysteryWords[request.wordId];

  if (!word) {
    return {
      correct: false,
      reason: "Hmm, I could not find that word. Let's try again together.",
    };
  }

  const { output } = await generateText({
    model: "openai/gpt-4o-mini",
    output: Output.object({
      schema: gradeResultSchema,
      name: "VocabGrade",
      description:
        "Whether the child's explanation matches the mystery word's meaning.",
    }),
    system: GRADER_SYSTEM,
    prompt: [
      `Mystery word: ${word.word}`,
      `Target definition: ${word.targetDefinition}`,
      `Child's explanation: ${request.explanation.trim()}`,
      "",
      "Does the child's explanation match the meaning of the word?",
    ].join("\n"),
  });

  if (!output) {
    throw new Error("Grading model returned no structured output.");
  }

  return {
    correct: output.correct,
    reason: output.reason,
  };
}
