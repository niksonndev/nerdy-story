import { z } from "zod";

import {
  childAnswerSchema,
  priorAttemptsSchema,
} from "@/lib/grade/child-input";
import { gradeComprehensionLocally } from "@/lib/grade/comprehension-local";
import {
  gradeWithLocalFallback,
  runLiveGrade,
} from "@/lib/grade/live";
import {
  buildComprehensionTrustedContext,
  COMPREHENSION_GRADER_SYSTEM,
} from "@/lib/grade/prompts";
import {
  GradeError,
  type ComprehensionGradeRequest,
  type GradeLiveOptions,
  type GradeResult,
} from "@/lib/grade/shared";
import { comprehensionChallenges } from "@/lib/story/story-data";

export const comprehensionGradeRequestSchema = z.object({
  challengeId: z.string().min(1),
  childAnswer: childAnswerSchema,
  priorAttempts: priorAttemptsSchema,
});

export type { ComprehensionGradeRequest };

/**
 * Live AI comprehension check via AI Gateway. Throws on provider/parse failure.
 * Production omits `options` (primary model + Gateway failover). Evals pass an
 * explicit model with `failoverModels: []` to isolate one model's calibration.
 */
export async function gradeComprehensionLive(
  request: ComprehensionGradeRequest,
  options?: GradeLiveOptions,
): Promise<GradeResult> {
  const challenge = comprehensionChallenges[request.challengeId];

  if (!challenge) {
    throw new GradeError("Unknown comprehension challenge.");
  }

  return runLiveGrade({
    system: COMPREHENSION_GRADER_SYSTEM,
    trustedContext: buildComprehensionTrustedContext(
      challenge,
      request.priorAttempts,
    ),
    childAnswer: request.childAnswer,
    outputName: "ComprehensionGrade",
    outputDescription:
      "Whether the child's answer matches the expected story understanding.",
    tags: ["feature:comprehension-grade"],
    liveOptions: options,
  });
}

/**
 * Production grader: live AI comprehension check via AI Gateway (primary +
 * failover). After the live call fails (failover already attempted inside
 * generateText), returns a local keyword GradeResult instead of throwing.
 */
export async function gradeComprehension(
  request: ComprehensionGradeRequest,
): Promise<GradeResult> {
  return gradeWithLocalFallback(
    () => gradeComprehensionLive(request),
    () => gradeComprehensionLocally(request),
  );
}
