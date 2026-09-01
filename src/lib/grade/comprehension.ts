import { generateText, Output } from "ai";
import { z } from "zod";

import {
  childAnswerSchema,
  priorAttemptsSchema,
} from "@/lib/grade/child-input";
import { gradeComprehensionLocally } from "@/lib/grade/comprehension-local";
import {
  buildChildAnswerMessage,
  buildComprehensionTrustedContext,
  COMPREHENSION_GRADER_SYSTEM,
  gradeResultSchema,
} from "@/lib/grade/prompts";
import {
  GRADE_FALLBACK_MODELS,
  GRADE_MAX_OUTPUT_TOKENS,
  GRADE_PRIMARY_MODEL,
  GRADE_TEMPERATURE,
  GradeError,
  type ComprehensionGradeRequest,
  type GradeResult,
} from "@/lib/grade/shared";
import { comprehensionChallenges } from "@/lib/story-data";

export const comprehensionGradeRequestSchema = z.object({
  challengeId: z.string().min(1),
  answer: childAnswerSchema,
  priorAttempts: priorAttemptsSchema,
});

export type { ComprehensionGradeRequest };

/**
 * Live AI comprehension check via AI Gateway (primary + failover models).
 * Looks up passage / expected understanding server-side.
 * After the live call fails (failover already attempted inside generateText),
 * returns a local keyword GradeResult instead of throwing.
 */
export async function gradeComprehension(
  request: ComprehensionGradeRequest,
): Promise<GradeResult> {
  const challenge = comprehensionChallenges[request.challengeId];

  if (!challenge) {
    throw new GradeError("fatal", "Unknown comprehension challenge.");
  }

  const answer = request.answer;

  try {
    const { output } = await generateText({
      model: GRADE_PRIMARY_MODEL,
      temperature: GRADE_TEMPERATURE,
      maxOutputTokens: GRADE_MAX_OUTPUT_TOKENS,
      output: Output.object({
        schema: gradeResultSchema,
        name: "ComprehensionGrade",
        description:
          "Whether the child's answer matches the expected story understanding.",
      }),
      system: COMPREHENSION_GRADER_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildComprehensionTrustedContext(
            challenge,
            request.priorAttempts,
          ),
        },
        { role: "user", content: buildChildAnswerMessage(answer) },
      ],
      providerOptions: {
        gateway: {
          models: [...GRADE_FALLBACK_MODELS],
          tags: ["feature:comprehension-grade"],
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
    return gradeComprehensionLocally({ ...request, answer });
  }
}
