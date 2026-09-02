import type { GradeEvalCase } from "../types"

/**
 * Story answers that fake understanding: circular restatements of the question,
 * verbatim passage text from a DIFFERENT part of the story, and vague filler.
 * All must be rejected.
 */
export const comprehensionGamingCases: GradeEvalCase[] = [
  // gaming-parrot — restates the question as the answer
  {
    id: "comp-track-clues-parrot",
    category: "gaming-parrot",
    challengeId: "track-clues",
    childAnswer: "they knew a sloth was nearby because there was a sloth nearby",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
  },
  {
    id: "comp-tracks-parrot",
    category: "gaming-parrot",
    challengeId: "tracks-choice-outcome",
    childAnswer: "following the tracks was risky because it was risky at first",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
  },
  {
    id: "comp-guide-parrot",
    category: "gaming-parrot",
    challengeId: "guide-choice-outcome",
    childAnswer:
      "they learned when to look because the ranger taught them when to look",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
  },

  // gaming-verbatim — real passage text, but from the wrong part of the story
  {
    id: "comp-track-clues-verbatim",
    category: "gaming-verbatim",
    challengeId: "track-clues",
    childAnswer: "You won't see much movement from a sloth at midday — they rest then.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-event",
  },
  {
    id: "comp-tracks-verbatim",
    category: "gaming-verbatim",
    challengeId: "tracks-choice-outcome",
    childAnswer: "This bark was scraped recently — a sloth passed through here, not long ago.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-event",
  },
  {
    id: "comp-guide-verbatim",
    category: "gaming-verbatim",
    challengeId: "guide-choice-outcome",
    childAnswer: "The trail split in two, and the paw prints grew fainter with every step.",
    expectedCorrect: false,
    expectedReasonTag: "wrong-event",
  },

  // gaming-vague — filler that names nothing specific
  {
    id: "comp-track-clues-vague",
    category: "gaming-vague",
    challengeId: "track-clues",
    childAnswer: "because of some stuff they saw",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
  },
  {
    id: "comp-tracks-vague",
    category: "gaming-vague",
    challengeId: "tracks-choice-outcome",
    childAnswer: "because something happened on the trail",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
  },
  {
    id: "comp-guide-vague",
    category: "gaming-vague",
    challengeId: "guide-choice-outcome",
    childAnswer: "because the lady told them something",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
  },
]
