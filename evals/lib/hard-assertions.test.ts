import { describe, expect, it } from "vitest"

import type { GradeResult } from "@/lib/grade/shared"

import { comprehensionCases, vocabularyCases } from "../cases"
import type { GradeEvalCase } from "../cases/types"
import { assertHardRules, HardRuleError } from "./hard-assertions"

const camouflageMiss: GradeEvalCase = {
  id: "vocab-camouflage-reject-1",
  category: "reject-wrong",
  wordId: "camouflage",
  childAnswer: "a loud noise",
  expectedCorrect: false,
  expectedReasonTag: "wrong-concept",
}

function missResult(hint: string): GradeResult {
  return {
    correct: false,
    reason: "Camouflage is about blending in and hiding, not exactly about noise.",
    hint,
  }
}

describe("eval datasets", () => {
  it("import with coverage floors intact", () => {
    expect(vocabularyCases.length).toBeGreaterThan(0)
    expect(comprehensionCases.length).toBeGreaterThan(0)
  })
})

describe("assertHardRules hint leak", () => {
  it("fails when a camouflage hint names blend", () => {
    expect(() =>
      assertHardRules(
        camouflageMiss,
        missResult("Think of colors or patterns that blend."),
      ),
    ).toThrow(HardRuleError)
    expect(() =>
      assertHardRules(
        camouflageMiss,
        missResult("Think of colors or patterns that blend."),
      ),
    ).toThrow(/blend/i)
  })

  it("allows a wondering camouflage hint", () => {
    expect(() =>
      assertHardRules(
        camouflageMiss,
        missResult("Why might you walk right past this animal and never notice it?"),
      ),
    ).not.toThrow()
  })

  it("allows a canopy hint that only nods to the child's tall-trees miss", () => {
    const tallTrees: GradeEvalCase = {
      id: "vocab-canopy-reject-tall-trees",
      category: "reject-wrong",
      wordId: "canopy",
      childAnswer: "the trees are tall",
      expectedCorrect: false,
      expectedReasonTag: "wrong-concept",
    }
    expect(() =>
      assertHardRules(tallTrees, {
        correct: false,
        reason: "Canopy is about treetops high in the forest, not exactly about trees.",
        hint: "What covers the very tops of those tall trees?",
      }),
    ).not.toThrow()
  })

  it("still flags a camouflage colors/patterns hint", () => {
    expect(() =>
      assertHardRules(
        camouflageMiss,
        missResult(
          "What colors or patterns might an animal have to look like its surroundings?",
        ),
      ),
    ).toThrow(/colors\/patterns/i)
  })
})
