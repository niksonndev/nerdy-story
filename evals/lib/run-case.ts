import type { GradeResult } from "@/lib/grade/shared"

import type { GradeEvalCase } from "../cases/types"
import { assertHardRules, HardRuleError } from "./hard-assertions"
import { gradeCase } from "./live-grade"
import { assertReasonExpectations } from "./reason-assertions"
import { buildErrorOutcome, buildOutcome, recordOutcome } from "./reporter"

/**
 * Grade one case against one model, run every assertion layer, record the
 * outcome for the report, and return the list of failure reasons (empty = pass).
 */
export async function evaluateCase(
  evalCase: GradeEvalCase,
  model: string,
): Promise<string[]> {
  let result: GradeResult
  try {
    result = await gradeCase(evalCase, model)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const failReasons = [`grade call threw: ${message}`]
    recordOutcome(buildErrorOutcome({ model, evalCase, errorMessage: message }))
    return failReasons
  }

  const failReasons: string[] = []

  try {
    assertHardRules(evalCase, result)
  } catch (error) {
    if (error instanceof HardRuleError) failReasons.push(error.message)
    else throw error
  }

  if (!evalCase.expectedCorrect) {
    try {
      assertReasonExpectations(evalCase, result)
    } catch (error) {
      if (error instanceof HardRuleError) failReasons.push(error.message)
      else throw error
    }
  }

  recordOutcome(buildOutcome({ model, evalCase, result, failReasons }))
  return failReasons
}
