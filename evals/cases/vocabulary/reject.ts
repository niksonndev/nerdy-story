import type { GradeEvalCase } from "../types"

/**
 * Genuinely wrong explanations the grader must reject. Two per word with
 * distinct wrong concepts, so we confirm the reason names the right domain the
 * child landed in — not just that the verdict is "incorrect".
 */
export const vocabularyRejectCases: GradeEvalCase[] = [
  {
    id: "vocab-canopy-reject-food",
    category: "reject-wrong",
    wordId: "canopy",
    childAnswer: "a kind of tasty fruit you eat",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "food or fruit",
  },
  {
    id: "vocab-canopy-reject-vehicle",
    category: "reject-wrong",
    wordId: "canopy",
    childAnswer: "a really fast race car",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "cars or vehicles",
  },
  {
    id: "vocab-cautious-reject-brave",
    category: "reject-wrong",
    wordId: "cautious",
    childAnswer: "being super brave and fearless",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "bravery",
  },
  {
    id: "vocab-cautious-reject-anger",
    category: "reject-wrong",
    wordId: "cautious",
    childAnswer: "feeling really angry and grumpy",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "anger",
  },
  {
    id: "vocab-camouflage-reject-sound",
    category: "reject-wrong",
    wordId: "camouflage",
    childAnswer: "a loud noise that animals make",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "sounds or noises",
  },
  {
    id: "vocab-camouflage-reject-food",
    category: "reject-wrong",
    wordId: "camouflage",
    childAnswer: "the food that animals eat for dinner",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "food",
  },
  {
    id: "vocab-nocturnal-reject-water",
    category: "reject-wrong",
    wordId: "nocturnal",
    childAnswer: "an animal that loves to swim in water",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "swimming or water",
  },
  {
    id: "vocab-nocturnal-reject-plant",
    category: "reject-wrong",
    wordId: "nocturnal",
    childAnswer: "a kind of tall tree in the forest",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "trees or plants",
  },
]
