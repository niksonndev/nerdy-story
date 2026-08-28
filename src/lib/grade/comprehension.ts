import { generateText, Output } from "ai";
import { z } from "zod";

import {
  appendPriorAttempts,
  COMPREHENSION_GRADER_SYSTEM,
  gradeResultSchema,
} from "@/lib/grade/prompts";
import { gradeComprehensionLocally } from "@/lib/grade/comprehension-local";
import {
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
  GradeError,
  gradeAttemptSchema,
  type ComprehensionGradeRequest,
  type GradeAttempt,
  type GradeResult,
} from "@/lib/grade/shared";
import { comprehensionChallenges } from "@/lib/story-data";

export const comprehensionGradeRequestSchema = z.object({
  challengeId: z.string().min(1),
  answer: z.string().trim().min(1),
  priorAttempts: z.array(gradeAttemptSchema).optional(),
});

export type { ComprehensionGradeRequest };

function buildPrompt(
  challenge: (typeof comprehensionChallenges)[string],
  answer: string,
  priorAttempts: GradeAttempt[] | undefined,
): string {
  const lines = [
    `Question: ${challenge.question}`,
    `Story passage: ${challenge.passage}`,
    `Expected understanding: ${challenge.expectedUnderstanding}`,
    `Child's latest answer: ${answer}`,
  ];

  appendPriorAttempts(lines, priorAttempts);

  lines.push(
    "",
    "Does the child's latest answer match the expected understanding of the passage?",
  );
  return lines.join("\n");
}

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

  const answer = request.answer.trim();

  try {
    const { output } = await generateText({
      model: GRADE_PRIMARY_MODEL,
      output: Output.object({
        schema: gradeResultSchema,
        name: "ComprehensionGrade",
        description:
          "Whether the child's answer matches the expected story understanding.",
      }),
      system: COMPREHENSION_GRADER_SYSTEM,
      prompt: buildPrompt(challenge, answer, request.priorAttempts),
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
