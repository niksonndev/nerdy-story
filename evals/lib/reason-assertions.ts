import type { GradeResult } from "@/lib/grade/shared"
import { comprehensionChallenges, mysteryWords } from "@/lib/story/story-data"

import type { GradeEvalCase } from "../cases/types"
import { HardRuleError } from "./hard-assertions"

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

/**
 * Deterministic Layer 2 checks on a reject's reason: catch a reject reason that
 * dumps the target meaning or answer reveal verbatim.
 */
export function assertReasonExpectations(
  evalCase: GradeEvalCase,
  result: GradeResult,
): void {
  if (result.correct) return

  const reason = normalize(result.reason)

  if (evalCase.wordId) {
    const word = mysteryWords[evalCase.wordId]
    if (word && reason.includes(normalize(word.targetDefinition))) {
      throw new HardRuleError(
        `Reject reason dumps the full definition (reveals the answer): "${result.reason}"`,
      )
    }
    return
  }

  if (evalCase.challengeId) {
    const challenge = comprehensionChallenges[evalCase.challengeId]
    if (challenge && reason.includes(normalize(challenge.answerReveal))) {
      throw new HardRuleError(
        `Reject reason dumps the full answer reveal: "${result.reason}"`,
      )
    }
  }
}
