import type { GradeEvalCase } from "../types"

/**
 * Correct story answers the grader must accept, two per challenge per category.
 * Rephrase wording avoids each challenge's acceptKeywords.
 */
export const comprehensionAcceptCases: GradeEvalCase[] = [
  // accept-simple
  {
    id: "comp-track-clues-simple-1",
    category: "accept-simple",
    challengeId: "track-clues",
    childAnswer: "they saw scraped bark and green fur on the branch",
    expectedCorrect: true,
  },
  {
    id: "comp-track-clues-simple-2",
    category: "accept-simple",
    challengeId: "track-clues",
    childAnswer: "the bark was scratched and there was fur stuck in it",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-simple-1",
    category: "accept-simple",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the tracks got faint and she almost went the wrong way",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-simple-2",
    category: "accept-simple",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the prints faded and the trail split so she nearly got lost",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-simple-1",
    category: "accept-simple",
    challengeId: "guide-choice-outcome",
    childAnswer: "sloths rest at midday and move at dusk so they waited",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-simple-2",
    category: "accept-simple",
    challengeId: "guide-choice-outcome",
    childAnswer: "the ranger said come back at dusk when sloths get active",
    expectedCorrect: true,
  },

  // accept-synonym
  {
    id: "comp-track-clues-synonym-1",
    category: "accept-synonym",
    challengeId: "track-clues",
    childAnswer:
      "there were signs on the wood, like rub marks and fuzzy hair the animal left",
    expectedCorrect: true,
  },
  {
    id: "comp-track-clues-synonym-2",
    category: "accept-synonym",
    challengeId: "track-clues",
    childAnswer: "clues on the limb showed a slow furry creature had passed by",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-synonym-1",
    category: "accept-synonym",
    challengeId: "tracks-choice-outcome",
    childAnswer:
      "the footprints slowly disappeared and she nearly picked the wrong route",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-synonym-2",
    category: "accept-synonym",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the path was tough to follow and forked so she could go astray",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-synonym-1",
    category: "accept-synonym",
    challengeId: "guide-choice-outcome",
    childAnswer:
      "the ranger explained these animals grow lively toward evening, not noon",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-synonym-2",
    category: "accept-synonym",
    challengeId: "guide-choice-outcome",
    childAnswer: "they learned the creatures nap through midday and stir as light fades",
    expectedCorrect: true,
  },

  // accept-imperfect-grammar
  {
    id: "comp-track-clues-grammar-1",
    category: "accept-imperfect-grammar",
    challengeId: "track-clues",
    childAnswer: "they seen scratched bark an some green furs stuck in it",
    expectedCorrect: true,
  },
  {
    id: "comp-track-clues-grammar-2",
    category: "accept-imperfect-grammar",
    challengeId: "track-clues",
    childAnswer: "the bark was scrape up and green fur was their on the branch",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-grammar-1",
    category: "accept-imperfect-grammar",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the prints was gettin faint and she almost go the wrong way",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-grammar-2",
    category: "accept-imperfect-grammar",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the trail splitted and she nearly pick the wrong path twice",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-grammar-1",
    category: "accept-imperfect-grammar",
    challengeId: "guide-choice-outcome",
    childAnswer: "ranger say sloth rest at noon an move at dusk so they wait",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-grammar-2",
    category: "accept-imperfect-grammar",
    challengeId: "guide-choice-outcome",
    childAnswer: "they waited coz sloths dont move much til it get dark",
    expectedCorrect: true,
  },

  // accept-partial
  {
    id: "comp-track-clues-partial-1",
    category: "accept-partial",
    challengeId: "track-clues",
    childAnswer: "there was fur stuck on the branch",
    expectedCorrect: true,
  },
  {
    id: "comp-track-clues-partial-2",
    category: "accept-partial",
    challengeId: "track-clues",
    childAnswer: "the bark looked scraped",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-partial-1",
    category: "accept-partial",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the tracks got faint",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-partial-2",
    category: "accept-partial",
    challengeId: "tracks-choice-outcome",
    childAnswer: "the trail split in two and she nearly went wrong",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-partial-1",
    category: "accept-partial",
    challengeId: "guide-choice-outcome",
    childAnswer: "sloths rest at midday",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-partial-2",
    category: "accept-partial",
    challengeId: "guide-choice-outcome",
    childAnswer: "they come out near dusk",
    expectedCorrect: true,
  },

  // accept-rephrase — distinct from acceptKeywords
  {
    id: "comp-track-clues-rephrase-1",
    category: "accept-rephrase",
    challengeId: "track-clues",
    childAnswer:
      "the tree showed rubbed-off marks and strands of mossy hair the creature left behind",
    expectedCorrect: true,
  },
  {
    id: "comp-track-clues-rephrase-2",
    category: "accept-rephrase",
    challengeId: "track-clues",
    childAnswer:
      "the evidence on the limb pointed to a slow animal that had climbed through recently",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-rephrase-1",
    category: "accept-rephrase",
    challengeId: "tracks-choice-outcome",
    childAnswer:
      "the footprints kept vanishing so she nearly took the incorrect route more than once",
    expectedCorrect: true,
  },
  {
    id: "comp-tracks-rephrase-2",
    category: "accept-rephrase",
    challengeId: "tracks-choice-outcome",
    childAnswer:
      "with the trail dividing and marks disappearing she could easily have headed the wrong direction",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-rephrase-1",
    category: "accept-rephrase",
    challengeId: "guide-choice-outcome",
    childAnswer:
      "the staff member said the animals turn lively toward evening, so hanging around made sense",
    expectedCorrect: true,
  },
  {
    id: "comp-guide-rephrase-2",
    category: "accept-rephrase",
    challengeId: "guide-choice-outcome",
    childAnswer:
      "they found out the creatures are still through noon and get moving as daylight fades",
    expectedCorrect: true,
  },
]
