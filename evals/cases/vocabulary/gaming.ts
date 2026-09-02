import type { GradeEvalCase } from "../types"

/**
 * Answers that try to slip past a lenient grader without showing understanding:
 * parroting the word, pasting authoritative-sounding text about the wrong thing,
 * and vague filler. All must be rejected.
 */
export const vocabularyGamingCases: GradeEvalCase[] = [
  // gaming-parrot — repeats the word instead of explaining it
  {
    id: "vocab-canopy-parrot",
    category: "gaming-parrot",
    wordId: "canopy",
    childAnswer: "canopy means canopy",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-cautious-parrot",
    category: "gaming-parrot",
    wordId: "cautious",
    childAnswer: "cautious is when you are being cautious",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-camouflage-parrot",
    category: "gaming-parrot",
    wordId: "camouflage",
    childAnswer: "camouflage is to camouflage something",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-nocturnal-parrot",
    category: "gaming-parrot",
    wordId: "nocturnal",
    childAnswer: "nocturnal means being nocturnal",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },

  // gaming-verbatim — a real definition, but of the WRONG word
  {
    id: "vocab-canopy-verbatim",
    category: "gaming-verbatim",
    wordId: "canopy",
    childAnswer: "Active mostly at night and resting during the day.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-cautious-verbatim",
    category: "gaming-verbatim",
    wordId: "cautious",
    childAnswer: "The roof-like layer formed by the tops of tall rainforest trees.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-camouflage-verbatim",
    category: "gaming-verbatim",
    wordId: "camouflage",
    childAnswer: "Active mostly at night and resting during the day.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-nocturnal-verbatim",
    category: "gaming-verbatim",
    wordId: "nocturnal",
    childAnswer: "Colors or patterns that help an animal blend in and hide.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },

  // gaming-vague — filler that says nothing specific
  {
    id: "vocab-canopy-vague",
    category: "gaming-vague",
    wordId: "canopy",
    childAnswer: "it's a thing that happens",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-cautious-vague",
    category: "gaming-vague",
    wordId: "cautious",
    childAnswer: "idk its just something you do",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-camouflage-vague",
    category: "gaming-vague",
    wordId: "camouflage",
    childAnswer: "its a kind of thing i guess",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
  {
    id: "vocab-nocturnal-vague",
    category: "gaming-vague",
    wordId: "nocturnal",
    childAnswer: "its something about animals",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
  },
]
