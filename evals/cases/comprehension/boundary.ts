import type { GradeEvalCase } from "../types"

/**
 * Edge story answers — one barely-enough accept and one just-over-the-line
 * reject per challenge, each with a documented rationale.
 */
export const comprehensionBoundaryCases: GradeEvalCase[] = [
  // track-clues
  {
    id: "comp-track-clues-boundary-one-clue",
    category: "boundary",
    challengeId: "track-clues",
    childAnswer: "there was fur caught in the branch",
    expectedCorrect: true,
    boundaryRationale:
      "Only one of the two clues, but it is grounded, correct evidence — enough for the age band.",
  },
  {
    id: "comp-track-clues-boundary-general-knowledge",
    category: "boundary",
    challengeId: "track-clues",
    childAnswer: "because sloths live up in trees",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
    expectedReasonConcept: "sloths living in trees in general",
    boundaryRationale:
      "A true general fact, but not the passage's specific clues that told them a sloth had passed.",
  },
  // tracks-choice-outcome
  {
    id: "comp-tracks-boundary-could-get-confused",
    category: "boundary",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the trail split so she could get confused",
    expectedCorrect: true,
    boundaryRationale:
      "Captures the core risk (a split trail leading her astray) even if terse.",
  },
  {
    id: "comp-tracks-boundary-walking-fast",
    category: "boundary",
    challengeId: "tracks-choice-outcome",
    childAnswer: "because she was walking way too fast",
    expectedCorrect: false,
    expectedReasonTag: "wrong-cause",
    expectedReasonConcept: "walking too fast",
    boundaryRationale:
      "Invents a cause; the passage shows she moved slowly and carefully.",
  },
  // guide-choice-outcome
  {
    id: "comp-guide-boundary-wait-later",
    category: "boundary",
    challengeId: "guide-choice-outcome",
    childAnswer: "they waited for later in the day to look",
    expectedCorrect: true,
    boundaryRationale:
      "'Later in the day' maps onto the dusk timing the ranger described; acceptable partial.",
  },
  {
    id: "comp-guide-boundary-always-sleeping",
    category: "boundary",
    challengeId: "guide-choice-outcome",
    childAnswer: "sloths are always sleeping all the time",
    expectedCorrect: false,
    expectedReasonTag: "wrong-cause",
    expectedReasonConcept: "sloths sleeping all the time",
    boundaryRationale:
      "Overgeneralizes rest into never active, missing the dusk-activity point.",
  },
]
