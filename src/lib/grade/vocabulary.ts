import { z } from "zod";

import {
  childAnswerSchema,
  priorAttemptsSchema,
} from "@/lib/grade/child-input";
import { hintLeakMessage } from "@/lib/grade/hint-leak";
import {
  createLiveGrader,
  createProductionGrader,
} from "@/lib/grade/live";
import {
  buildVocabularyTrustedContext,
  VOCABULARY_GRADER_SYSTEM,
} from "@/lib/grade/prompts";
import type { VocabularyGradeRequest } from "@/lib/grade/shared";
import { gradeVocabularyLocally } from "@/lib/grade/vocabulary-local";
import { mysteryWords } from "@/lib/story/story-data";

export const vocabularyGradeRequestSchema = z.object({
  wordId: z.string().min(1),
  childAnswer: childAnswerSchema,
  priorAttempts: priorAttemptsSchema,
});

/**
 * Live AI meaning check via AI Gateway. Throws on provider/parse failure.
 * Production omits `options` (primary model + Gateway failover). Evals pass an
 * explicit model with `failoverModels: []` to isolate one model's calibration.
 */
export const gradeVocabularyLive = createLiveGrader({
  lookup: (request: VocabularyGradeRequest) => mysteryWords[request.wordId],
  unknownError: "Unknown mystery word.",
  system: VOCABULARY_GRADER_SYSTEM,
  trustedContext: (word, request) =>
    buildVocabularyTrustedContext(word, request.priorAttempts),
  outputName: "VocabularyGrade",
  outputDescription:
    "Whether the child's explanation matches the mystery word's meaning.",
  tags: ["feature:vocabulary-grade"],
  leakingHint: (word, request, hint) =>
    hintLeakMessage(hint, [word.targetDefinition], {
      camouflage: word.id === "camouflage",
      nocturnal: word.id === "nocturnal",
      allowedText: request.childAnswer,
    }),
  storyHints: (word) => word.hints,
});

/**
 * Production grader: live AI meaning check via AI Gateway (primary + failover).
 * After the live call fails (failover already attempted inside generateText),
 * returns a local keyword GradeResult instead of throwing.
 */
export const gradeVocabulary = createProductionGrader(
  gradeVocabularyLive,
  gradeVocabularyLocally,
);
