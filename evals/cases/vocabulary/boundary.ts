import type { GradeEvalCase } from "../types"

/**
 * Edge answers where partial tips into wrong (or barely stays right). Each
 * documents the human adjudication in boundaryRationale. These are where a
 * lenient grader false-accepts and a strict grader false-rejects.
 */
export const vocabularyBoundaryCases: GradeEvalCase[] = [
  // canopy
  {
    id: "vocab-canopy-boundary-fruit-thing",
    category: "boundary",
    wordId: "canopy",
    childAnswer: "it's a fruit thing",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "fruit",
    boundaryRationale:
      "'fruit' is the wrong domain and 'thing' is too vague to rescue it.",
  },
  {
    id: "vocab-canopy-boundary-high-green",
    category: "boundary",
    wordId: "canopy",
    childAnswer: "high up where its green",
    expectedCorrect: true,
    boundaryRationale:
      "Location plus greenery points at the treetops layer; enough for the 7-9 band.",
  },
  {
    id: "vocab-canopy-boundary-just-leaves",
    category: "boundary",
    wordId: "canopy",
    childAnswer: "leaves",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "just leaves",
    boundaryRationale:
      "'leaves' names a part but misses the top-of-forest layer idea entirely.",
  },
  // cautious
  {
    id: "vocab-cautious-boundary-scared",
    category: "boundary",
    wordId: "cautious",
    childAnswer: "being scared",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "being scared",
    boundaryRationale:
      "Fear is a different frame than choosing to be careful; close but wrong.",
  },
  {
    id: "vocab-cautious-boundary-slow-look",
    category: "boundary",
    wordId: "cautious",
    childAnswer: "going slow and looking first",
    expectedCorrect: true,
    boundaryRationale:
      "Captures careful behavior to avoid trouble without using the word.",
  },
  {
    id: "vocab-cautious-boundary-quiet",
    category: "boundary",
    wordId: "cautious",
    childAnswer: "being really quiet",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "being quiet",
    boundaryRationale:
      "Quietness can go with caution but is not the meaning of careful-to-avoid-danger.",
  },
  // camouflage
  {
    id: "vocab-camouflage-boundary-just-hide",
    category: "boundary",
    wordId: "camouflage",
    childAnswer: "when animals hide",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "just hiding",
    boundaryRationale:
      "Generic hiding misses the blending/matching-colors core of camouflage.",
  },
  {
    id: "vocab-camouflage-boundary-look-like-ground",
    category: "boundary",
    wordId: "camouflage",
    childAnswer: "they look like the ground so you cant see them",
    expectedCorrect: true,
    boundaryRationale:
      "Matching the surroundings to disappear is the blending idea, just informal.",
  },
  {
    id: "vocab-camouflage-boundary-run-away",
    category: "boundary",
    wordId: "camouflage",
    childAnswer: "when animals run away fast",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "running away",
    boundaryRationale:
      "Escaping is a different survival tactic than blending in to hide.",
  },
  // nocturnal
  {
    id: "vocab-nocturnal-boundary-night-animal",
    category: "boundary",
    wordId: "nocturnal",
    childAnswer: "a night animal",
    expectedCorrect: true,
    boundaryRationale:
      "Extremely terse but unambiguously the night-active idea; acceptable for age.",
  },
  {
    id: "vocab-nocturnal-boundary-just-animal",
    category: "boundary",
    wordId: "nocturnal",
    childAnswer: "an animal",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "just any animal",
    boundaryRationale: "No day/night signal at all — far too generic.",
  },
  {
    id: "vocab-nocturnal-boundary-sleeps-a-lot",
    category: "boundary",
    wordId: "nocturnal",
    childAnswer: "an animal that sleeps a lot",
    expectedCorrect: false,
    expectedReasonTag: "wrong-concept",
    expectedReasonConcept: "sleeping a lot",
    boundaryRationale:
      "Sleepiness is not the point; the meaning is the night/day timing.",
  },
]
