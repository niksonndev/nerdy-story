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

  it("allows a camouflage hint that wonders without naming colors or patterns", () => {
    expect(() =>
      assertHardRules(
        camouflageMiss,
        missResult(
          "What might an animal do so it doesn't stand out in its surroundings?",
        ),
      ),
    ).not.toThrow()
  })

  it("allows a tracks hint that asks about the prints without naming faint/split", () => {
    const miss: GradeEvalCase = {
      id: "comp-tracks-boundary-walking-fast",
      category: "boundary",
      challengeId: "tracks-choice-outcome",
      childAnswer: "because she was walking way too fast",
      expectedCorrect: false,
      expectedReasonTag: "wrong-cause",
    }
    expect(() =>
      assertHardRules(miss, {
        correct: false,
        reason: "That did happen, but that's not quite why.",
        hint: "What happened to the paw prints as she kept walking that made the trail hard to follow?",
      }),
    ).not.toThrow()
  })

  it("allows a tracks wondering hint that uses way/her without naming the clues", () => {
    const parrot: GradeEvalCase = {
      id: "comp-tracks-parrot",
      category: "gaming-parrot",
      challengeId: "tracks-choice-outcome",
      childAnswer: "following the tracks was risky because it was risky at first",
      expectedCorrect: false,
      expectedReasonTag: "ungrounded",
    }
    expect(() =>
      assertHardRules(parrot, {
        correct: false,
        reason: "Hmm, let's think about what the story actually says.",
        hint: "What part of the trail made it hard to know the right way at first?",
      }),
    ).not.toThrow()

    const verbatim: GradeEvalCase = {
      id: "comp-tracks-verbatim",
      category: "gaming-verbatim",
      challengeId: "tracks-choice-outcome",
      childAnswer:
        "This bark was scraped recently — a sloth passed through here, not long ago.",
      expectedCorrect: false,
      expectedReasonTag: "wrong-event",
    }
    expect(() =>
      assertHardRules(verbatim, {
        correct: false,
        reason: "That's a different part of the story.",
        hint: "If you look at the path Mia was following, what made it hard for her to know which way to go?",
      }),
    ).not.toThrow()
  })

  it("allows a comprehension hint that only uses the question's words", () => {
    const miss: GradeEvalCase = {
      id: "comp-track-clues-reject-event-monkeys",
      category: "reject-wrong",
      challengeId: "track-clues",
      childAnswer: "they heard monkeys in the trees",
      expectedCorrect: false,
      expectedReasonTag: "wrong-event",
    }
    expect(() =>
      assertHardRules(miss, {
        correct: false,
        reason: "That happened, but not right here.",
        hint: "What did Grandpa Elias notice on the branch?",
      }),
    ).not.toThrow()
  })

  it("flags a guide hint that names rest and moving together", () => {
    const miss: GradeEvalCase = {
      id: "comp-guide-boundary-always-sleeping",
      category: "boundary",
      challengeId: "guide-choice-outcome",
      childAnswer: "sloths are always sleeping all the time",
      expectedCorrect: false,
      expectedReasonTag: "wrong-cause",
    }
    expect(() =>
      assertHardRules(miss, {
        correct: false,
        reason: "That did happen, but that's not quite why.",
        hint: "What time of day did the ranger say the sloths rest and then start moving?",
      }),
    ).toThrow(/rest\/moving/i)
  })

  it("allows a guide hint that nods at always-sleeping without the rest/moving contrast", () => {
    const miss: GradeEvalCase = {
      id: "comp-guide-boundary-always-sleeping",
      category: "boundary",
      challengeId: "guide-choice-outcome",
      childAnswer: "sloths are always sleeping all the time",
      expectedCorrect: false,
      expectedReasonTag: "wrong-cause",
    }
    expect(() =>
      assertHardRules(miss, {
        correct: false,
        reason: "That did happen, but that's not quite why.",
        hint: "When did she say they start moving around?",
      }),
    ).not.toThrow()
  })
})
