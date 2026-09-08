import { z } from "zod";

import {
  childAnswerSchema,
  priorAttemptsSchema,
} from "@/lib/grade/child-input";
import { gradeComprehensionLocally } from "@/lib/grade/comprehension-local";
import { hintLeakMessage } from "@/lib/grade/hint-leak";
import {
  createLiveGrader,
  createProductionGrader,
} from "@/lib/grade/live";
import {
  buildComprehensionTrustedContext,
  COMPREHENSION_GRADER_SYSTEM,
} from "@/lib/grade/prompts";
import type { ComprehensionGradeRequest } from "@/lib/grade/shared";
import { comprehensionChallenges } from "@/lib/story/story-data";

export const comprehensionGradeRequestSchema = z.object({
  challengeId: z.string().min(1),
  childAnswer: childAnswerSchema,
  priorAttempts: priorAttemptsSchema,
});

/**
 * Live AI comprehension check via AI Gateway. Throws on provider/parse failure.
 * Production omits `options` (primary model + Gateway failover). Evals pass an
 * explicit model with `failoverModels: []` to isolate one model's calibration.
 */
export const gradeComprehensionLive = createLiveGrader({
  lookup: (request: ComprehensionGradeRequest) =>
    comprehensionChallenges[request.challengeId],
  unknownError: "Unknown comprehension challenge.",
  system: COMPREHENSION_GRADER_SYSTEM,
  trustedContext: (challenge, request) =>
    buildComprehensionTrustedContext(challenge, request.priorAttempts),
  outputName: "ComprehensionGrade",
  outputDescription:
    "Whether the child's answer matches the expected story understanding.",
  tags: ["feature:comprehension-grade"],
  leakingHint: (challenge, request, hint) =>
    hintLeakMessage(hint, [challenge.answerReveal], {
      slothTiming: challenge.id === "guide-choice-outcome",
      tracksSplit: challenge.id === "tracks-choice-outcome",
      allowedText: `${request.childAnswer} ${challenge.question}`,
    }),
  storyHints: (challenge) => challenge.hints,
});

/**
 * Production grader: live AI comprehension check via AI Gateway (primary +
 * failover). After the live call fails (failover already attempted inside
 * generateText), returns a local keyword GradeResult instead of throwing.
 */
export const gradeComprehension = createProductionGrader(
  gradeComprehensionLive,
  gradeComprehensionLocally,
);
