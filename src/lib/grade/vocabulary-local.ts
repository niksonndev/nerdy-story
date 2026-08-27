import {
  GradeError,
  type GradeRequest,
  type GradeResult,
} from "@/lib/grade/shared";
import {
  hasContentOverlap,
  hintForAttempt,
  matchesAcceptKeywords,
} from "@/lib/grade/local-helpers";
import { mysteryWords, type MysteryWord } from "@/lib/story-data";

function isLocallyCorrect(word: MysteryWord, explanation: string): boolean {
  const explanationLower = explanation.toLowerCase();
  if (matchesAcceptKeywords(explanationLower, word.acceptKeywords)) {
    return true;
  }
  return hasContentOverlap(explanation, word.targetDefinition);
}

/**
 * Simple keyword meaning check used when live AI grading fails.
 * Same GradeResult shape as the live grader — not a second AI call.
 */
export function gradeVocabularyLocally(request: GradeRequest): GradeResult {
  const word = mysteryWords[request.wordId];

  if (!word) {
    throw new GradeError("fatal", "Unknown mystery word.");
  }

  const explanation = request.explanation.trim();
  const priorCount = request.priorAttempts?.length ?? 0;

  if (isLocallyCorrect(word, explanation)) {
    return {
      correct: true,
      reason: `Yes — that matches what "${word.word}" means.`,
      hint: null,
    };
  }

  return {
    correct: false,
    reason: "That does not quite match the meaning. Try another way to say it.",
    hint: hintForAttempt(word.hints, priorCount),
  };
}
