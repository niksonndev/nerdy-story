import { describe, expect, it } from "vitest"

import type { GradeResult } from "@/lib/grade/shared"

import type { GradeEvalCase } from "../cases/types"
import { HardRuleError } from "./hard-assertions"
import { assertReasonExpectations } from "./reason-assertions"

const canopyHit: GradeEvalCase = {
  id: "vocab-canopy-simple-1",
  category: "accept-simple",
  wordId: "canopy",
  childAnswer: "the top of the trees",
  expectedCorrect: true,
}

const trackCluesHit: GradeEvalCase = {
  id: "comp-track-clues-simple-1",
  category: "accept-simple",
  challengeId: "track-clues",
  childAnswer: "they saw scraped bark and green fur on the branch",
  expectedCorrect: true,
}

const canopyMiss: GradeEvalCase = {
  id: "vocab-canopy-reject-1",
  category: "reject-wrong",
  wordId: "canopy",
  childAnswer: "a kind of tasty fruit",
  expectedCorrect: false,
  expectedReasonTag: "wrong-concept",
}

function expectHardRule(run: () => void, message: RegExp): void {
  expect(run).toThrow(HardRuleError)
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(HardRuleError)
    expect((error as Error).message).toMatch(message)
  }
}

describe("assertReasonExpectations hits", () => {
  it("accepts an echo-then-name vocab reason", () => {
    const result: GradeResult = {
      correct: true,
      reason: "You said the top of the trees — canopy is that leafy cover high up.",
      hint: null,
    }
    expect(() => assertReasonExpectations(canopyHit, result)).not.toThrow()
  })

  it("rejects a Perfect! canned opener", () => {
    const result: GradeResult = {
      correct: true,
      reason:
        "Perfect! That's exactly it: The roof-like layer formed by the tops of tall rainforest trees.",
      hint: null,
    }
    expectHardRule(
      () => assertReasonExpectations(canopyHit, result),
      /canned opener/i,
    )
  })

  it("rejects a that's-exactly-it stamp even without Perfect!", () => {
    const result: GradeResult = {
      correct: true,
      reason: "That's exactly it: the top of the trees is the canopy.",
      hint: null,
    }
    expectHardRule(
      () => assertReasonExpectations(canopyHit, result),
      /that's exactly it/i,
    )
  })

  it("rejects a hit that dumps the full definition", () => {
    const result: GradeResult = {
      correct: true,
      reason:
        "You said trees — The roof-like layer formed by the tops of tall rainforest trees.",
      hint: null,
    }
    expectHardRule(
      () => assertReasonExpectations(canopyHit, result),
      /dumps the full definition/i,
    )
  })

  it("rejects a hit that never echoes the child", () => {
    const result: GradeResult = {
      correct: true,
      reason: "Yes — canopy is about treetops high in the forest.",
      hint: null,
    }
    expectHardRule(
      () => assertReasonExpectations(canopyHit, result),
      /does not echo/i,
    )
  })

  it("rejects a hit that never names the word or core idea", () => {
    const result: GradeResult = {
      correct: true,
      reason: "You said the top of the trees — that matches.",
      hint: null,
    }
    expectHardRule(
      () => assertReasonExpectations(canopyHit, result),
      /does not name the word or core idea/i,
    )
  })

  it("accepts a comprehension hit that names the idea in other story words", () => {
    const tracksHit: GradeEvalCase = {
      id: "comp-tracks-simple-2",
      category: "accept-simple",
      challengeId: "tracks-choice-outcome",
      childAnswer: "the prints faded and the trail split so she nearly got lost",
      expectedCorrect: true,
    }
    const result: GradeResult = {
      correct: true,
      reason:
        "You said the prints faded and the trail split — that means the path was unclear and she could have gotten lost.",
      hint: null,
    }
    expect(() => assertReasonExpectations(tracksHit, result)).not.toThrow()
  })

  it("accepts an echo-then-name comprehension reason", () => {
    const result: GradeResult = {
      correct: true,
      reason:
        "You noticed the scraped bark and green fur — those are the clues on the branch.",
      hint: null,
    }
    expect(() => assertReasonExpectations(trackCluesHit, result)).not.toThrow()
  })

  it("rejects a comprehension hit that never names the story idea", () => {
    const tracksHit: GradeEvalCase = {
      id: "comp-tracks-simple-2",
      category: "accept-simple",
      challengeId: "tracks-choice-outcome",
      childAnswer: "the prints faded and the trail split so she nearly got lost",
      expectedCorrect: true,
    }
    const result: GradeResult = {
      correct: true,
      reason: "You said the prints faded — nice thinking.",
      hint: null,
    }
    expectHardRule(
      () => assertReasonExpectations(tracksHit, result),
      /does not name the story idea/i,
    )
  })
})

describe("assertReasonExpectations rejects", () => {
  it("accepts a miss that does not dump the definition", () => {
    const result: GradeResult = {
      correct: false,
      reason: "Good guess, but canopy isn't about fruit.",
      hint: "Think about the treetops.",
    }
    expect(() => assertReasonExpectations(canopyMiss, result)).not.toThrow()
  })

  it("rejects a miss that dumps the full definition", () => {
    const result: GradeResult = {
      correct: false,
      reason:
        "Good guess, but canopy isn't about fruit. The roof-like layer formed by the tops of tall rainforest trees.",
      hint: "Think about the treetops.",
    }
    expectHardRule(
      () => assertReasonExpectations(canopyMiss, result),
      /dumps the full definition/i,
    )
  })
})
