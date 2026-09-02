import {
  ACCEPT_CATEGORIES,
  GAMING_CATEGORIES,
  type EvalCategory,
  type GradeEvalCase,
} from "../cases/types"

const ALL_CATEGORIES: EvalCategory[] = [
  ...ACCEPT_CATEGORIES,
  "reject-wrong",
  "boundary",
  ...GAMING_CATEGORIES,
]

export type CoverageConfig = {
  domain: "vocabulary" | "comprehension"
  itemKey: "wordId" | "challengeId"
  /** All valid item ids (words or challenges). */
  items: string[]
  minCasesPerCategory: number
  /** Distinct items an accept-* / reject-wrong category must span. */
  acceptRejectMinItemSpan: number
  /** Distinct items each gaming category must span. */
  gamingMinItemSpan: number
  /** Reason tags that must each appear at least `minCasesPerReasonTag` times. */
  reasonTags: string[]
  minCasesPerReasonTag: number
}

function itemId(evalCase: GradeEvalCase, key: CoverageConfig["itemKey"]): string {
  const value = evalCase[key]
  if (!value) {
    throw new Error(`Eval case "${evalCase.id}" is missing ${key}.`)
  }
  return value
}

function distinctItems(cases: GradeEvalCase[], key: CoverageConfig["itemKey"]): Set<string> {
  return new Set(cases.map((c) => itemId(c, key)))
}

/**
 * Enforce dataset-level rigor rules at import time. Throws a single aggregated
 * error listing every violation so the fix list is visible at once.
 */
export function validateCoverage(
  cases: GradeEvalCase[],
  config: CoverageConfig,
): void {
  const problems: string[] = []
  const byCategory = new Map<EvalCategory, GradeEvalCase[]>()

  for (const evalCase of cases) {
    itemId(evalCase, config.itemKey) // integrity: throws early if missing
    const bucket = byCategory.get(evalCase.category) ?? []
    bucket.push(evalCase)
    byCategory.set(evalCase.category, bucket)

    if (evalCase.category === "boundary" && !evalCase.boundaryRationale) {
      problems.push(`Boundary case "${evalCase.id}" is missing boundaryRationale.`)
    }
    if (!evalCase.expectedCorrect && !evalCase.expectedReasonTag) {
      problems.push(
        `Reject case "${evalCase.id}" is missing expectedReasonTag.`,
      )
    }
  }

  for (const category of ALL_CATEGORIES) {
    const bucket = byCategory.get(category) ?? []
    if (bucket.length < config.minCasesPerCategory) {
      problems.push(
        `Category "${category}" has ${bucket.length} cases, needs >= ${config.minCasesPerCategory}.`,
      )
    }

    const span = distinctItems(bucket, config.itemKey).size
    const isAcceptOrReject =
      (ACCEPT_CATEGORIES as readonly string[]).includes(category) ||
      category === "reject-wrong"
    const isGaming = (GAMING_CATEGORIES as readonly string[]).includes(category)

    if (isAcceptOrReject && span < config.acceptRejectMinItemSpan) {
      problems.push(
        `Category "${category}" spans ${span} ${config.itemKey}s, needs >= ${config.acceptRejectMinItemSpan}.`,
      )
    }
    if (isGaming && span < config.gamingMinItemSpan) {
      problems.push(
        `Gaming category "${category}" spans ${span} ${config.itemKey}s, needs >= ${config.gamingMinItemSpan}.`,
      )
    }
  }

  const rejectByTag = new Map<string, number>()
  for (const evalCase of cases) {
    if (evalCase.expectedCorrect || !evalCase.expectedReasonTag) continue
    rejectByTag.set(
      evalCase.expectedReasonTag,
      (rejectByTag.get(evalCase.expectedReasonTag) ?? 0) + 1,
    )
  }
  for (const tag of config.reasonTags) {
    const count = rejectByTag.get(tag) ?? 0
    if (count < config.minCasesPerReasonTag) {
      problems.push(
        `Reason tag "${tag}" has ${count} reject cases, needs >= ${config.minCasesPerReasonTag}.`,
      )
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `[${config.domain}] eval dataset coverage violations:\n  - ${problems.join("\n  - ")}`,
    )
  }
}
