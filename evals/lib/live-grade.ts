import { gradeComprehensionLive } from "@/lib/grade/comprehension"
import type { GradeResult } from "@/lib/grade/shared"
import { gradeExplanationLive } from "@/lib/grade/vocabulary"

import type { GradeEvalCase } from "../cases/types"

/**
 * Grade an eval case against exactly one model — no Gateway failover, no local
 * keyword fallback. This isolates a single model's calibration so a
 * fallback-only run never silently errors into the primary model.
 */
export async function gradeCase(
  evalCase: GradeEvalCase,
  model: string,
): Promise<GradeResult> {
  if (evalCase.wordId) {
    return gradeExplanationLive(
      {
        wordId: evalCase.wordId,
        explanation: evalCase.childAnswer,
        priorAttempts: evalCase.priorAttempts,
      },
      { model, failoverModels: [] },
    )
  }

  if (evalCase.challengeId) {
    return gradeComprehensionLive(
      {
        challengeId: evalCase.challengeId,
        answer: evalCase.childAnswer,
        priorAttempts: evalCase.priorAttempts,
      },
      { model, failoverModels: [] },
    )
  }

  throw new Error(`Eval case "${evalCase.id}" has neither wordId nor challengeId.`)
}
