import type { GradeResult } from "@/lib/grade/shared"
import { comprehensionChallenges, mysteryWords } from "@/lib/story/story-data"

import type { GradeEvalCase } from "../cases/types"

const REASON_MIN_LENGTH = 10
const REASON_MAX_LENGTH = 300

/** Story vocabulary that contains "wrong" but is not evaluative shame. */
const STORY_WRONG_PHRASE = /\bwrong (?:path|trail|way|turn|direction|route)\b/gi

/** Kid-facing copy must never shame — mirrors the grader prompt constraints. */
const SHAME_PATTERNS = [
  /\b(?:that'?s|you'?re|you are|that is) wrong\b/i,
  /\bwrong answer\b/i,
  /\bincorrect\b/i,
  /\bno,? that\b/i,
  /\b(?:stupid|dumb)\b/i,
  /\bbad answer\b/i,
] as const

function containsShameLanguage(reason: string): boolean {
  const scrubbed = reason.replace(STORY_WRONG_PHRASE, "")
  return SHAME_PATTERNS.some((pattern) => pattern.test(scrubbed))
}

export class HardRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "HardRuleError"
  }
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

/**
 * The hint must not hand the child the answer. We reject when the hint contains
 * the full definition / expected understanding / reveal text verbatim.
 */
function forbiddenRevealTexts(evalCase: GradeEvalCase): string[] {
  if (evalCase.wordId) {
    const word = mysteryWords[evalCase.wordId]
    return word ? [word.targetDefinition, word.meaningReveal] : []
  }
  if (evalCase.challengeId) {
    const challenge = comprehensionChallenges[evalCase.challengeId]
    return challenge
      ? [challenge.expectedUnderstanding, challenge.answerReveal]
      : []
  }
  return []
}

/**
 * Deterministic pass/fail checks that need no model judgment. Throws
 * HardRuleError on the first violation so the test fails with a clear reason.
 */
export function assertHardRules(
  evalCase: GradeEvalCase,
  result: GradeResult,
): void {
  if (result.correct !== evalCase.expectedCorrect) {
    throw new HardRuleError(
      `Verdict mismatch: expected correct=${evalCase.expectedCorrect}, got ${result.correct}. ` +
        `Reason: "${result.reason}"`,
    )
  }

  if (result.correct) {
    if (result.hint !== null) {
      throw new HardRuleError(
        `Correct answers must clear the hint, got: "${result.hint}"`,
      )
    }
  } else if (!result.hint || result.hint.trim().length === 0) {
    throw new HardRuleError("Wrong answers must include a non-empty hint.")
  }

  const reason = result.reason.trim()
  if (reason.length < REASON_MIN_LENGTH || reason.length > REASON_MAX_LENGTH) {
    throw new HardRuleError(
      `Reason length ${reason.length} outside [${REASON_MIN_LENGTH}, ${REASON_MAX_LENGTH}]: "${reason}"`,
    )
  }

  if (!result.correct && containsShameLanguage(result.reason)) {
    throw new HardRuleError(`Reason contains shame language: "${result.reason}"`)
  }

  if (result.hint) {
    const hint = normalize(result.hint)
    for (const reveal of forbiddenRevealTexts(evalCase)) {
      if (hint.includes(normalize(reveal))) {
        throw new HardRuleError(
          `Hint reveals the answer (contains reveal text verbatim): "${result.hint}"`,
        )
      }
    }
  }
}
