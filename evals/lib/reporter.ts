import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import type { GradeResult } from "@/lib/grade/shared"

import {
  GAMING_CATEGORIES,
  type EvalCategory,
  type GradeEvalCase,
} from "../cases/types"

export type CaseOutcome = {
  model: string
  caseId: string
  category: EvalCategory
  itemId: string
  childAnswer: string
  expectedCorrect: boolean
  /** Null when the live grade call failed — not a real model verdict. */
  actualCorrect: boolean | null
  passed: boolean
  failReasons: string[]
  reason: string
  hint: string | null
  expectedReasonTag?: string
  expectedReasonConcept?: string
  boundaryRationale?: string
  manualReview: boolean
}

const RUN_ID =
  process.env.EVAL_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, "-")

const outcomes: CaseOutcome[] = []

function isManualReviewCategory(category: EvalCategory): boolean {
  return (
    category === "boundary" ||
    (GAMING_CATEGORIES as readonly string[]).includes(category)
  )
}

export function recordOutcome(outcome: CaseOutcome): void {
  outcomes.push(outcome)
}

function baseOutcomeFields(
  model: string,
  evalCase: GradeEvalCase,
): Pick<
  CaseOutcome,
  | "model"
  | "caseId"
  | "category"
  | "itemId"
  | "childAnswer"
  | "expectedCorrect"
  | "expectedReasonTag"
  | "expectedReasonConcept"
  | "boundaryRationale"
  | "manualReview"
> {
  return {
    model,
    caseId: evalCase.id,
    category: evalCase.category,
    itemId: evalCase.wordId ?? evalCase.challengeId ?? "(unknown)",
    childAnswer: evalCase.childAnswer,
    expectedCorrect: evalCase.expectedCorrect,
    expectedReasonTag: evalCase.expectedReasonTag,
    expectedReasonConcept: evalCase.expectedReasonConcept,
    boundaryRationale: evalCase.boundaryRationale,
    manualReview: isManualReviewCategory(evalCase.category),
  }
}

export function buildOutcome(args: {
  model: string
  evalCase: GradeEvalCase
  result: GradeResult
  failReasons: string[]
}): CaseOutcome {
  const { model, evalCase, result, failReasons } = args
  return {
    ...baseOutcomeFields(model, evalCase),
    actualCorrect: result.correct,
    passed: failReasons.length === 0,
    failReasons,
    reason: result.reason,
    hint: result.hint,
  }
}

/** Record a failed grade call without inventing a synthetic verdict. */
export function buildErrorOutcome(args: {
  model: string
  evalCase: GradeEvalCase
  errorMessage: string
}): CaseOutcome {
  const { model, evalCase, errorMessage } = args
  return {
    ...baseOutcomeFields(model, evalCase),
    actualCorrect: null,
    passed: false,
    failReasons: [`grade call threw: ${errorMessage}`],
    reason: "(threw)",
    hint: null,
  }
}

function rate(passed: number, total: number): string {
  if (total === 0) return "n/a"
  return `${passed}/${total} (${Math.round((passed / total) * 100)}%)`
}

function groupBy<K>(items: CaseOutcome[], key: (o: CaseOutcome) => K): Map<K, CaseOutcome[]> {
  const map = new Map<K, CaseOutcome[]>()
  for (const item of items) {
    const bucket = map.get(key(item)) ?? []
    bucket.push(item)
    map.set(key(item), bucket)
  }
  return map
}

function passCount(items: CaseOutcome[]): number {
  return items.filter((o) => o.passed).length
}

type DivergenceEntry = {
  caseId: string
  category: EvalCategory
  itemId: string
  childAnswer: string
  verdictByModel: Record<string, boolean>
}

function computeDivergence(items: CaseOutcome[]): DivergenceEntry[] {
  const entries: DivergenceEntry[] = []
  for (const [, group] of groupBy(items, (o) => o.caseId)) {
    const graded = group.filter((o) => o.actualCorrect !== null)
    if (graded.length < 2) continue

    const verdicts = new Set(graded.map((o) => o.actualCorrect))
    if (verdicts.size > 1) {
      const first = graded[0]
      entries.push({
        caseId: first.caseId,
        category: first.category,
        itemId: first.itemId,
        childAnswer: first.childAnswer,
        verdictByModel: Object.fromEntries(
          graded.map((o) => [o.model, o.actualCorrect as boolean]),
        ),
      })
    }
  }
  return entries
}

function excludedCount(items: CaseOutcome[]): number {
  return items.filter((o) => o.actualCorrect === null).length
}

function gradedOutcomes(items: CaseOutcome[]): CaseOutcome[] {
  return items.filter((o) => o.actualCorrect !== null)
}

function formatManualReviewEntry(o: CaseOutcome): string[] {
  const entry: string[] = [
    `    [${o.caseId}] (${o.category})`,
    `      answer: "${o.childAnswer}"`,
    `      expected correct=${o.expectedCorrect}, got ${o.actualCorrect === null ? "(excluded — grade call failed)" : o.actualCorrect}`,
    `      reason: "${o.reason}"`,
    `      hint: ${o.hint ? `"${o.hint}"` : "(none)"}`,
  ]
  if (o.boundaryRationale) {
    entry.push(`      rationale: ${o.boundaryRationale}`)
  }
  if (o.expectedReasonConcept) {
    entry.push(`      expected concept: ${o.expectedReasonConcept}`)
  }
  if (o.failReasons.length > 0) {
    entry.push(`      flags: ${o.failReasons.join("; ")}`)
  }
  return entry
}

/**
 * Write the JSON report for a domain and print human-readable summaries:
 * per-model overall, per-category, per-category x item matrix, reason tags,
 * manual review for boundary/gaming cases, and cross-model divergence when
 * more than one model ran.
 */
export function finalizeReport(domain: "vocabulary" | "comprehension"): void {
  const domainOutcomes = outcomes.filter(
    (o) => o.caseId.startsWith(`${domain === "vocabulary" ? "vocab" : "comp"}-`),
  )
  if (domainOutcomes.length === 0) return

  const models = [...new Set(domainOutcomes.map((o) => o.model))]
  const lines: string[] = []
  lines.push("", `=== ${domain} eval report (run ${RUN_ID}) ===`)

  for (const model of models) {
    const modelOutcomes = domainOutcomes.filter((o) => o.model === model)
    lines.push("", `Model: ${model}`)
    const modelExcluded = excludedCount(modelOutcomes)
    const modelGraded = gradedOutcomes(modelOutcomes)
    lines.push(`  Overall: ${rate(passCount(modelOutcomes), modelOutcomes.length)}`)
    if (modelExcluded > 0) {
      lines.push(`  Excluded (grade call failed): ${modelExcluded}`)
      lines.push(
        `  Graded only: ${rate(passCount(modelGraded), modelGraded.length)}`,
      )
    }

    lines.push("  By category:")
    for (const [category, group] of groupBy(modelOutcomes, (o) => o.category)) {
      const excluded = excludedCount(group)
      const graded = gradedOutcomes(group)
      const suffix =
        excluded > 0
          ? ` (${excluded} excluded, graded ${rate(passCount(graded), graded.length)})`
          : ""
      lines.push(`    ${category}: ${rate(passCount(group), group.length)}${suffix}`)
    }

    lines.push("  By category x item:")
    for (const [category, group] of groupBy(modelOutcomes, (o) => o.category)) {
      const parts: string[] = []
      for (const [item, itemGroup] of groupBy(group, (o) => o.itemId)) {
        parts.push(`${item} ${rate(passCount(itemGroup), itemGroup.length)}`)
      }
      lines.push(`    ${category}: ${parts.join(" | ")}`)
    }

    const rejects = modelOutcomes.filter((o) => o.expectedReasonTag)
    if (rejects.length > 0) {
      lines.push("  By reason tag:")
      for (const [tag, group] of groupBy(rejects, (o) => o.expectedReasonTag)) {
        lines.push(`    ${tag}: ${rate(passCount(group), group.length)}`)
      }
    }

    const failures = modelOutcomes.filter((o) => !o.passed)
    if (failures.length > 0) {
      lines.push(`  Failures (${failures.length}):`)
      for (const f of failures) {
        lines.push(
          `    [${f.caseId}] "${f.childAnswer}" -> ${f.failReasons.join("; ")}`,
        )
      }
    }

    const manualReview = modelOutcomes.filter((o) => o.manualReview)
    if (manualReview.length > 0) {
      lines.push(`  Manual review (${manualReview.length} boundary/gaming cases):`)
      for (const o of manualReview) {
        lines.push(...formatManualReviewEntry(o))
      }
    }
  }

  let divergence: DivergenceEntry[] = []
  if (models.length > 1) {
    divergence = computeDivergence(domainOutcomes)
    lines.push(
      "",
      `Cross-model divergence: ${divergence.length}/${new Set(domainOutcomes.map((o) => o.caseId)).size} cases`,
    )
    for (const d of divergence) {
      const verdicts = Object.entries(d.verdictByModel)
        .map(([m, v]) => `${m}=${v}`)
        .join(", ")
      lines.push(`    [${d.caseId}] "${d.childAnswer}" -> ${verdicts}`)
    }
  }

  const excluded = excludedCount(domainOutcomes)
  const graded = gradedOutcomes(domainOutcomes)

  const report = {
    runId: RUN_ID,
    domain,
    models,
    total: domainOutcomes.length,
    passed: passCount(domainOutcomes),
    excluded,
    gradedTotal: graded.length,
    gradedPassed: passCount(graded),
    divergence,
    outcomes: domainOutcomes,
  }

  const dir = path.resolve(__dirname, "../results")
  mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${RUN_ID}-${domain}.json`)
  writeFileSync(file, JSON.stringify(report, null, 2))
  lines.push("", `Wrote ${file}`)

  console.log(lines.join("\n"))
}
