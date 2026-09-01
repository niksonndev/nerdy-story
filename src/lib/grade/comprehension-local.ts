import {
  GradeError,
  type ComprehensionGradeRequest,
  type GradeResult,
} from "@/lib/grade/shared";
import {
  buildLocalMissReason,
  hasContentOverlap,
  hintForAttempt,
  matchesAcceptKeywords,
} from "@/lib/grade/local-helpers";
import {
  comprehensionChallenges,
  type ComprehensionChallenge,
} from "@/lib/story-data";

function isLocallyCorrect(
  challenge: ComprehensionChallenge,
  answer: string,
): boolean {
  const answerLower = answer.toLowerCase();
  if (matchesAcceptKeywords(answerLower, challenge.acceptKeywords)) {
    return true;
  }
  return hasContentOverlap(answer, challenge.expectedUnderstanding);
}

/**
 * Simple keyword story-understanding check used when live AI grading fails.
 * Same GradeResult shape as the live grader — not a second AI call.
 */
export function gradeComprehensionLocally(
  request: ComprehensionGradeRequest,
): GradeResult {
  const challenge = comprehensionChallenges[request.challengeId];

  if (!challenge) {
    throw new GradeError("fatal", "Unknown comprehension challenge.");
  }

  const answer = request.answer.trim();
  const priorCount = request.priorAttempts?.length ?? 0;

  if (isLocallyCorrect(challenge, answer)) {
    return {
      correct: true,
      reason: "Yes — that matches what this part of the story is about.",
      hint: null,
    };
  }

  return {
    correct: false,
    reason: buildLocalMissReason({
      kind: "comprehension",
      coreIdea: challenge.coreIdea,
      answer,
    }),
    hint: hintForAttempt(challenge.hints, priorCount),
  };
}
