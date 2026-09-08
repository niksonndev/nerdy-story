import { CHILD_ANSWER_MAX_LENGTH } from "@/lib/grade/child-input"

import type { GradeEvalCase } from "../cases/types"

export type HeldOutConfig = {
  domain: "vocabulary" | "comprehension"
  itemKey: "wordId" | "challengeId"
  items: string[]
  expectedCount: number
  idPrefix: string
  forbiddenAnswers: readonly string[]
}

function normalizeAnswer(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

function itemId(evalCase: GradeEvalCase, key: HeldOutConfig["itemKey"]): string {
  const value = evalCase[key]
  if (!value) {
    throw new Error(`Held-out case "${evalCase.id}" is missing ${key}.`)
  }
  return value
}

/**
 * Lightweight freeze-set checks. Does not apply development coverage floors.
 */
export function validateHeldOutSet(
  cases: GradeEvalCase[],
  config: HeldOutConfig,
): void {
  const problems: string[] = []

  if (cases.length !== config.expectedCount) {
    problems.push(
      `Has ${cases.length} cases, needs exactly ${config.expectedCount}.`,
    )
  }

  const ids = new Set<string>()
  const answers = new Set<string>()
  const items = new Set<string>()
  let accepts = 0
  let rejects = 0

  const forbidden = new Set(config.forbiddenAnswers.map(normalizeAnswer))

  for (const evalCase of cases) {
    if (!evalCase.id.startsWith(config.idPrefix)) {
      problems.push(
        `Case "${evalCase.id}" must start with "${config.idPrefix}".`,
      )
    }
    if (ids.has(evalCase.id)) {
      problems.push(`Duplicate case id "${evalCase.id}".`)
    }
    ids.add(evalCase.id)

    const item = itemId(evalCase, config.itemKey)
    items.add(item)

    const answer = normalizeAnswer(evalCase.childAnswer)
    if (evalCase.childAnswer.length === 0) {
      problems.push(`Case "${evalCase.id}" has an empty childAnswer.`)
    }
    if (evalCase.childAnswer.length > CHILD_ANSWER_MAX_LENGTH) {
      problems.push(
        `Case "${evalCase.id}" exceeds the ${CHILD_ANSWER_MAX_LENGTH}-character API cap.`,
      )
    }
    if (answers.has(answer)) {
      problems.push(`Duplicate childAnswer on "${evalCase.id}".`)
    }
    answers.add(answer)

    if (forbidden.has(answer)) {
      problems.push(
        `Case "${evalCase.id}" reuses a development-set answer.`,
      )
    }

    if (evalCase.expectedCorrect) {
      accepts += 1
    } else {
      rejects += 1
      if (!evalCase.expectedReasonTag) {
        problems.push(`Reject case "${evalCase.id}" is missing expectedReasonTag.`)
      }
      if (
        evalCase.category === "reject-wrong" &&
        !evalCase.expectedReasonConcept
      ) {
        problems.push(
          `Reject-wrong case "${evalCase.id}" is missing expectedReasonConcept.`,
        )
      }
    }
  }

  if (accepts < 8) {
    problems.push(`Has ${accepts} accept cases, needs >= 8.`)
  }
  if (rejects < 8) {
    problems.push(`Has ${rejects} reject cases, needs >= 8.`)
  }

  for (const item of config.items) {
    if (!items.has(item)) {
      problems.push(`No case covers ${config.itemKey} "${item}".`)
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `[${config.domain} held-out] dataset violations:\n  - ${problems.join("\n  - ")}`,
    )
  }
}
