import {
  GradeError,
  type VocabularyGradeRequest,
  type GradeResult,
} from "@/lib/grade/shared";
import {
  buildLocalMissReason,
  hasContentOverlap,
  hintForAttempt,
  matchesAcceptKeywords,
} from "@/lib/grade/local-helpers";
import { mysteryWords, type MysteryWord } from "@/lib/story-data";

function isLocallyCorrect(word: MysteryWord, childAnswer: string): boolean {
  const answerLower = childAnswer.toLowerCase();
  if (matchesAcceptKeywords(answerLower, word.acceptKeywords)) {
    return true;
  }
  return hasContentOverlap(childAnswer, word.targetDefinition);
}

/**
 * Keyword/synonym fallback when live grading fails after Gateway failover.
 * Returns a normal GradeResult — never throws for a known word.
 */
export function gradeVocabularyLocally(
  request: VocabularyGradeRequest,
): GradeResult {
  const word = mysteryWords[request.wordId];
  if (!word) {
    throw new GradeError("fatal", "Unknown mystery word.");
  }

  const childAnswer = request.childAnswer.trim();
  const priorCount = request.priorAttempts?.length ?? 0;

  if (isLocallyCorrect(word, childAnswer)) {
    return {
      correct: true,
      reason: `Yes — ${word.word} is about ${word.coreIdea}.`,
      hint: null,
    };
  }

  return {
    correct: false,
    reason: buildLocalMissReason({
      kind: "vocabulary",
      word: word.word,
      coreIdea: word.coreIdea,
      childAnswer,
    }),
    hint: hintForAttempt(word.hints, priorCount),
  };
}
