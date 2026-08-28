import { generateText, Output } from "ai";
import { z } from "zod";

import {
  appendPriorAttempts,
  gradeResultSchema,
  VOCAB_GRADER_SYSTEM,
} from "@/lib/grade/prompts";
import {
  GRADE_FALLBACK_MODELS,
  GRADE_MAX_OUTPUT_TOKENS,
  GRADE_PRIMARY_MODEL,
  GRADE_TEMPERATURE,
  GradeError,
  gradeAttemptSchema,
  type GradeAttempt,
  type GradeRequest,
  type GradeResult,
} from "@/lib/grade/shared";
import { gradeVocabularyLocally } from "@/lib/grade/vocabulary-local";
import { mysteryWords } from "@/lib/story-data";

export const gradeRequestSchema = z.object({
  wordId: z.string().min(1),
  explanation: z.string().trim().min(1),
  priorAttempts: z.array(gradeAttemptSchema).optional(),
});

export type { GradeRequest };

function buildPrompt(
  word: (typeof mysteryWords)[string],
  explanation: string,
  priorAttempts: GradeAttempt[] | undefined,
): string {
  const lines = [
    `Mystery word: ${word.word}`,
    `Target definition: ${word.targetDefinition}`,
    `Child's latest explanation: ${explanation}`,
  ];

  appendPriorAttempts(lines, priorAttempts);

  lines.push("", "Does the child's latest explanation match the meaning of the word?");
  return lines.join("\n");
}

/**
 * Live AI meaning check via AI Gateway (primary + failover models).
 * Looks up the target definition server-side.
 * After the live call fails (failover already attempted inside generateText),
 * returns a local keyword GradeResult instead of throwing.
 */
export async function gradeExplanation(
  request: GradeRequest,
): Promise<GradeResult> {
  const word = mysteryWords[request.wordId];

  if (!word) {
    throw new GradeError("fatal", "Unknown mystery word.");
  }

  const explanation = request.explanation.trim();

  try {
    const { output } = await generateText({
      model: GRADE_PRIMARY_MODEL,
      temperature: GRADE_TEMPERATURE,
      maxOutputTokens: GRADE_MAX_OUTPUT_TOKENS,
      output: Output.object({
        schema: gradeResultSchema,
        name: "VocabularyGrade",
        description:
          "Whether the child's explanation matches the mystery word's meaning.",
      }),
      system: VOCAB_GRADER_SYSTEM,
      prompt: buildPrompt(word, explanation, request.priorAttempts),
      providerOptions: {
        gateway: {
          models: [...GRADE_FALLBACK_MODELS],
          tags: ["feature:vocabulary-grade"],
        },
      },
    });

    return {
      correct: output.correct,
      reason: output.reason,
      hint: output.correct ? null : output.hint,
    };
  } catch {
    // Gateway already tried primary + failover models inside generateText.
    return gradeVocabularyLocally({ ...request, explanation });
  }
}
