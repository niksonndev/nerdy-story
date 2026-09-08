import { describe, expect, it } from "vitest"

import type { GradeEvalCase } from "../cases/types"
import { heldOutComprehensionCases, heldOutVocabularyCases } from "./index"
import { validateHeldOutSet } from "./validate"

const baseAccept: GradeEvalCase = {
  id: "vocab-hold-a",
  category: "accept-simple",
  wordId: "canopy",
  childAnswer: "unique accept one",
  expectedCorrect: true,
}

const baseReject: GradeEvalCase = {
  id: "vocab-hold-b",
  category: "reject-wrong",
  wordId: "cautious",
  childAnswer: "unique reject one",
  expectedCorrect: false,
  expectedReasonTag: "wrong-concept",
  expectedReasonConcept: "something else",
}

function padCases(extra: GradeEvalCase[]): GradeEvalCase[] {
  const seeds: GradeEvalCase[] = [
    { ...baseAccept, id: "vocab-hold-seed-canopy", wordId: "canopy", childAnswer: "unique seed canopy" },
    { ...baseAccept, id: "vocab-hold-seed-cautious", wordId: "cautious", childAnswer: "unique seed cautious" },
    { ...baseAccept, id: "vocab-hold-seed-camouflage", wordId: "camouflage", childAnswer: "unique seed camouflage" },
    { ...baseReject, id: "vocab-hold-seed-nocturnal", wordId: "nocturnal", childAnswer: "unique seed nocturnal" },
  ]
  const cases = [...extra, ...seeds]
  let index = 0
  while (cases.filter((evalCase) => evalCase.expectedCorrect).length < 8) {
    cases.push({
      ...baseAccept,
      id: `vocab-hold-accept-${index}`,
      wordId: "camouflage",
      childAnswer: `unique accept pad ${index}`,
    })
    index += 1
  }
  index = 0
  while (cases.filter((evalCase) => !evalCase.expectedCorrect).length < 8) {
    cases.push({
      ...baseReject,
      id: `vocab-hold-reject-${index}`,
      wordId: "nocturnal",
      childAnswer: `unique reject pad ${index}`,
    })
    index += 1
  }
  while (cases.length < 18) {
    cases.push({
      ...baseAccept,
      id: `vocab-hold-fill-${cases.length}`,
      wordId: "canopy",
      childAnswer: `unique fill ${cases.length}`,
    })
  }
  return cases.slice(0, 18)
}

describe("held-out datasets", () => {
  it("import with freeze-set checks intact", () => {
    expect(heldOutVocabularyCases).toHaveLength(18)
    expect(heldOutComprehensionCases).toHaveLength(18)
  })

  it("keeps long adversarial answers on the production 200-character cap", () => {
    const vocabLong = heldOutVocabularyCases.find(
      (evalCase) => evalCase.id === "vocab-hold-cautious-long",
    )
    const compLong = heldOutComprehensionCases.find(
      (evalCase) => evalCase.id === "comp-hold-tracks-long",
    )
    expect(vocabLong?.childAnswer.length).toBe(200)
    expect(compLong?.childAnswer.length).toBe(200)
  })
})

describe("validateHeldOutSet", () => {
  it("accepts a complete 18-case mix", () => {
    expect(() =>
      validateHeldOutSet(padCases([]), {
        domain: "vocabulary",
        itemKey: "wordId",
        items: ["canopy", "cautious", "camouflage", "nocturnal"],
        expectedCount: 18,
        idPrefix: "vocab-hold-",
        forbiddenAnswers: ["the top of the trees"],
      }),
    ).not.toThrow()
  })

  it("rejects a reused development answer", () => {
    const cases = padCases([
      {
        ...baseAccept,
        id: "vocab-hold-copy",
        childAnswer: "the top of the trees",
      },
    ])
    expect(() =>
      validateHeldOutSet(cases, {
        domain: "vocabulary",
        itemKey: "wordId",
        items: ["canopy", "cautious", "camouflage", "nocturnal"],
        expectedCount: 18,
        idPrefix: "vocab-hold-",
        forbiddenAnswers: ["the top of the trees"],
      }),
    ).toThrow(/reuses a development-set answer/)
  })

  it("rejects a missing word", () => {
    const cases = padCases([]).map((evalCase) => ({
      ...evalCase,
      wordId: "canopy",
    }))
    expect(() =>
      validateHeldOutSet(cases, {
        domain: "vocabulary",
        itemKey: "wordId",
        items: ["canopy", "cautious", "camouflage", "nocturnal"],
        expectedCount: 18,
        idPrefix: "vocab-hold-",
        forbiddenAnswers: [],
      }),
    ).toThrow(/No case covers wordId "cautious"/)
  })
})
