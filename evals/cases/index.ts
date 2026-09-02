import { comprehensionChallenges, mysteryWords } from "@/lib/story-data"

import { validateCoverage, type CoverageConfig } from "../lib/coverage"
import { comprehensionAcceptCases } from "./comprehension/accept"
import { comprehensionBoundaryCases } from "./comprehension/boundary"
import { comprehensionGamingCases } from "./comprehension/gaming"
import { comprehensionRejectCases } from "./comprehension/reject"
import type { GradeEvalCase } from "./types"
import { vocabularyAcceptCases } from "./vocabulary/accept"
import { vocabularyBoundaryCases } from "./vocabulary/boundary"
import { vocabularyGamingCases } from "./vocabulary/gaming"
import { vocabularyRejectCases } from "./vocabulary/reject"

export const vocabularyCases: GradeEvalCase[] = [
  ...vocabularyAcceptCases,
  ...vocabularyRejectCases,
  ...vocabularyBoundaryCases,
  ...vocabularyGamingCases,
]

export const comprehensionCases: GradeEvalCase[] = [
  ...comprehensionAcceptCases,
  ...comprehensionRejectCases,
  ...comprehensionBoundaryCases,
  ...comprehensionGamingCases,
]

const vocabularyCoverage: CoverageConfig = {
  domain: "vocabulary",
  itemKey: "wordId",
  items: Object.keys(mysteryWords),
  minCasesPerCategory: 4,
  acceptRejectMinItemSpan: 3,
  gamingMinItemSpan: 3,
  reasonTags: ["wrong-concept"],
  minCasesPerReasonTag: 6,
}

const comprehensionCoverage: CoverageConfig = {
  domain: "comprehension",
  itemKey: "challengeId",
  items: Object.keys(comprehensionChallenges),
  minCasesPerCategory: 3,
  acceptRejectMinItemSpan: 2,
  gamingMinItemSpan: 3,
  reasonTags: ["wrong-event", "wrong-character", "wrong-cause", "ungrounded"],
  minCasesPerReasonTag: 2,
}

// Fail fast at import time if the datasets drift below the rigor thresholds.
validateCoverage(vocabularyCases, vocabularyCoverage)
validateCoverage(comprehensionCases, comprehensionCoverage)
