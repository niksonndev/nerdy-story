import { contentTokens } from "@/lib/grade/local-helpers"
import type { GradeResult } from "@/lib/grade/shared"
import { comprehensionChallenges, mysteryWords } from "@/lib/story/story-data"

import type { GradeEvalCase } from "../cases/types"
import { HardRuleError } from "./hard-assertions"

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

const CANNED_EXACTLY_IT = /that's exactly it/i
const CANNED_PERFECT_OPENER = /^perfect!/i

function assertNoCannedHitCopy(reason: string): void {
  if (CANNED_PERFECT_OPENER.test(reason.trim())) {
    throw new HardRuleError(
      `Hit reason starts with canned opener: "${reason}"`,
    )
  }
  if (CANNED_EXACTLY_IT.test(reason)) {
    throw new HardRuleError(
      `Hit reason uses canned "that's exactly it": "${reason}"`,
    )
  }
}

function assertDoesNotDump(reason: string, forbidden: string, label: string): void {
  if (forbidden && normalize(reason).includes(normalize(forbidden))) {
    throw new HardRuleError(`${label}: "${reason}"`)
  }
}

function assertEchoesChild(reason: string, childAnswer: string): void {
  const childContent = contentTokens(childAnswer)
  const reasonContent = contentTokens(reason)
  for (const token of childContent) {
    if (reasonContent.has(token)) return
  }
  throw new HardRuleError(
    `Hit reason does not echo the child's words: "${reason}" (answer: "${childAnswer}")`,
  )
}

function hasIdeaToken(reasonContent: Set<string>, ideaTokens: Set<string>): boolean {
  for (const idea of ideaTokens) {
    if (reasonContent.has(idea)) return true
    if (idea.endsWith("s") && reasonContent.has(idea.slice(0, -1))) return true
    if (reasonContent.has(`${idea}s`)) return true
  }
  return false
}

function assertNamesIdea(
  reason: string,
  ideaTokens: Set<string>,
  extraLiteral: string | undefined,
  label: string,
): void {
  const reasonNorm = normalize(reason)
  if (extraLiteral && reasonNorm.includes(normalize(extraLiteral))) return

  if (hasIdeaToken(contentTokens(reason), ideaTokens)) return
  throw new HardRuleError(`${label}: "${reason}"`)
}

function assertHitReasonShape(
  evalCase: GradeEvalCase,
  result: GradeResult,
): void {
  const reason = result.reason
  assertNoCannedHitCopy(reason)
  assertEchoesChild(reason, evalCase.childAnswer)

  if (evalCase.wordId) {
    const word = mysteryWords[evalCase.wordId]
    if (!word) return
    assertDoesNotDump(
      reason,
      word.targetDefinition,
      "Hit reason dumps the full definition",
    )
    assertNamesIdea(
      reason,
      contentTokens(word.coreIdea),
      word.word,
      "Hit reason does not name the word or core idea",
    )
    return
  }

  if (evalCase.challengeId) {
    const challenge = comprehensionChallenges[evalCase.challengeId]
    if (!challenge) return
    assertDoesNotDump(
      reason,
      challenge.answerReveal,
      "Hit reason dumps the full answer reveal",
    )
    const ideaTokens = new Set([
      ...contentTokens(challenge.coreIdea),
      ...contentTokens((challenge.acceptKeywords ?? []).join(" ")),
    ])
    assertNamesIdea(
      reason,
      ideaTokens,
      undefined,
      "Hit reason does not name the story idea",
    )
  }
}

function assertRejectDoesNotDump(
  evalCase: GradeEvalCase,
  result: GradeResult,
): void {
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

/**
 * Deterministic Layer 2 checks on reason copy: rejects must not dump the
 * answer; hits must echo the child, name the idea, and avoid canned stamps.
 */
export function assertReasonExpectations(
  evalCase: GradeEvalCase,
  result: GradeResult,
): void {
  if (result.correct) {
    assertHitReasonShape(evalCase, result)
    return
  }

  assertRejectDoesNotDump(evalCase, result)
}
