import { comprehensionChallenges, mysteryWords } from "@/lib/story/story-data"

import { comprehensionCases, vocabularyCases } from "../cases"
import { heldOutComprehensionCases } from "./cases/comprehension"
import { heldOutVocabularyCases } from "./cases/vocabulary"
import { validateHeldOutSet } from "./validate"

export { heldOutComprehensionCases, heldOutVocabularyCases }

validateHeldOutSet(heldOutVocabularyCases, {
  domain: "vocabulary",
  itemKey: "wordId",
  items: Object.keys(mysteryWords),
  expectedCount: 18,
  idPrefix: "vocab-hold-",
  forbiddenAnswers: vocabularyCases.map((evalCase) => evalCase.childAnswer),
})

validateHeldOutSet(heldOutComprehensionCases, {
  domain: "comprehension",
  itemKey: "challengeId",
  items: Object.keys(comprehensionChallenges),
  expectedCount: 18,
  idPrefix: "comp-hold-",
  forbiddenAnswers: comprehensionCases.map((evalCase) => evalCase.childAnswer),
})
