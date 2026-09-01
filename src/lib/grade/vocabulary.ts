import { generateText, Output } from "ai";
import { z } from "zod";

import {
  childAnswerSchema,
  priorAttemptsSchema,
} from "@/lib/grade/child-input";
import {
  buildChildAnswerMessage,
  buildVocabTrustedContext,
  gradeResultSchema,
  VOCAB_GRADER_SYSTEM,
} from "@/lib/grade/prompts";
import {
  GRADE_FALLBACK_MODELS,
  GRADE_MAX_OUTPUT_TOKENS,
  GRADE_PRIMARY_MODEL,
  GRADE_TEMPERATURE,
  GradeError,
  type GradeRequest,
  type GradeResult,
} from "@/lib/grade/shared";
import { gradeVocabularyLocally } from "@/lib/grade/vocabulary-local";
import { mysteryWords } from "@/lib/story-data";

export const gradeRequestSchema = z.object({
  wordId: z.string().min(1),
  explanation: childAnswerSchema,
  priorAttempts: priorAttemptsSchema,
});

export type { GradeRequest };

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

  const explanation = request.explanation;

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
      messages: [
        {
          role: "user",
          content: buildVocabTrustedContext(word, request.priorAttempts),
        },
        { role: "user", content: buildChildAnswerMessage(explanation) },
      ],
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
