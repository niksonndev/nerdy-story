import type { VocabularyGradeRequest, GradeResult } from "@/lib/grade/shared";
import {
  buildLocalHitReason,
  gradeLocally,
  isLocallyCorrectAnswer,
  requireKnown,
} from "@/lib/grade/local-helpers";
import { mysteryWords } from "@/lib/story/story-data";

/**
 * Keyword/synonym fallback when live grading fails after Gateway failover.
 * Returns a normal GradeResult — never throws for a known word.
 */
export function gradeVocabularyLocally(
  request: VocabularyGradeRequest,
): GradeResult {
  const word = requireKnown(
    mysteryWords[request.wordId],
    "Unknown mystery word.",
  );
  const childAnswer = request.childAnswer.trim();

  return gradeLocally({
    childAnswer,
    priorCount: request.priorAttempts?.length ?? 0,
    hints: word.hints,
    isCorrect: isLocallyCorrectAnswer(
      childAnswer,
      word.acceptKeywords,
      word.targetDefinition,
    ),
    correctReason: buildLocalHitReason({
      kind: "vocabulary",
      word: word.word,
      coreIdea: word.coreIdea,
      childAnswer,
    }),
    miss: {
      kind: "vocabulary",
      word: word.word,
      coreIdea: word.coreIdea,
      childAnswer,
    },
  });
}
