import type {
  ComprehensionGradeRequest,
  GradeResult,
} from "@/lib/grade/shared";
import {
  buildLocalHitReason,
  gradeLocally,
  isLocallyCorrectAnswer,
  requireKnown,
} from "@/lib/grade/local-helpers";
import { comprehensionChallenges } from "@/lib/story/story-data";

/**
 * Simple keyword story-understanding check used when live AI grading fails.
 * Same GradeResult shape as the live grader — not a second AI call.
 */
export function gradeComprehensionLocally(
  request: ComprehensionGradeRequest,
): GradeResult {
  const challenge = requireKnown(
    comprehensionChallenges[request.challengeId],
    "Unknown comprehension challenge.",
  );
  const childAnswer = request.childAnswer.trim();

  return gradeLocally({
    childAnswer,
    priorCount: request.priorAttempts?.length ?? 0,
    hints: challenge.hints,
    isCorrect: isLocallyCorrectAnswer(
      childAnswer,
      challenge.acceptKeywords,
      challenge.expectedUnderstanding,
      { passage: challenge.passage },
    ),
    correctReason: buildLocalHitReason({
      kind: "comprehension",
      coreIdea: challenge.coreIdea,
      childAnswer,
    }),
    miss: {
      kind: "comprehension",
      coreIdea: challenge.coreIdea,
      childAnswer,
    },
  });
}
