import type { GradeEvalCase } from "../types"

/**
 * Wrong story answers spanning all four miss types, at least two per reason tag,
 * so we confirm the grader picks the RIGHT reason (the copy the child sees), not
 * just the right verdict.
 */
export const comprehensionRejectCases: GradeEvalCase[] = [
  // wrong-event — something else from the story, not this part
  {
    id: "comp-track-clues-reject-event-monkeys",
    category: "reject-wrong",
    challengeId: "track-clues",
    childAnswer: "because they heard monkeys screeching in the trees",
    expectedCorrect: false,
    expectedReasonTag: "wrong-event",
    expectedReasonConcept: "hearing monkeys",
  },
  {
    id: "comp-tracks-reject-event-jaguar",
    category: "reject-wrong",
    challengeId: "tracks-choice-outcome",
    childAnswer: "because a jaguar jumped out and chased them",
    expectedCorrect: false,
    expectedReasonTag: "wrong-event",
    expectedReasonConcept: "a jaguar chasing them",
  },

  // wrong-character — right-ish event, wrong person
  {
    id: "comp-track-clues-reject-character-ranger",
    category: "reject-wrong",
    challengeId: "track-clues",
    childAnswer: "the ranger crouched down and showed them the fur on the bark",
    expectedCorrect: false,
    expectedReasonTag: "wrong-character",
    expectedReasonConcept: "the ranger finding the clues",
  },
  {
    id: "comp-guide-reject-character-grandpa",
    category: "reject-wrong",
    challengeId: "guide-choice-outcome",
    childAnswer: "Grandpa Elias told them sloths are active at dusk",
    expectedCorrect: false,
    expectedReasonTag: "wrong-character",
    expectedReasonConcept: "Grandpa Elias explaining the timing",
  },

  // wrong-cause — event is real, the reasoning is off
  {
    id: "comp-tracks-reject-cause-rain",
    category: "reject-wrong",
    challengeId: "tracks-choice-outcome",
    childAnswer: "because it started raining really hard on them",
    expectedCorrect: false,
    expectedReasonTag: "wrong-cause",
    expectedReasonConcept: "rain",
  },
  {
    id: "comp-guide-reject-cause-tired",
    category: "reject-wrong",
    challengeId: "guide-choice-outcome",
    childAnswer: "they waited at the platform because they were tired",
    expectedCorrect: false,
    expectedReasonTag: "wrong-cause",
    expectedReasonConcept: "being tired",
  },

  // ungrounded — not in the passage at all
  {
    id: "comp-track-clues-reject-ungrounded-sign",
    category: "reject-wrong",
    challengeId: "track-clues",
    childAnswer: "because a park sign told them a sloth lived there",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
    expectedReasonConcept: "a sign telling them",
  },
  {
    id: "comp-guide-reject-ungrounded-map",
    category: "reject-wrong",
    challengeId: "guide-choice-outcome",
    childAnswer: "the ranger gave them a treasure map to find the sloth",
    expectedCorrect: false,
    expectedReasonTag: "ungrounded",
    expectedReasonConcept: "a map",
  },
]
