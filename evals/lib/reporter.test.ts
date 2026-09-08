import { describe, expect, it } from "vitest"

import type { GradeEvalCase } from "../cases/types"
import {
  buildErrorOutcome,
  buildOutcome,
  reportFileName,
} from "./reporter"

const sampleCase: GradeEvalCase = {
  id: "vocab-hold-canopy-phrased",
  category: "accept-simple",
  wordId: "canopy",
  childAnswer: "the high leafy layer",
  expectedCorrect: true,
}

describe("reportFileName", () => {
  it("keeps development reports on the existing suffix", () => {
    expect(reportFileName("run-1", "vocabulary")).toBe("run-1-vocabulary.json")
  })

  it("prefixes held-out reports so they do not mix with development runs", () => {
    expect(reportFileName("run-1", "vocabulary", "heldout")).toBe(
      "run-1-heldout-vocabulary.json",
    )
    expect(reportFileName("run-1", "comprehension", "heldout")).toBe(
      "run-1-heldout-comprehension.json",
    )
  })
})

describe("buildOutcome", () => {
  it("records latency and isolated-live fallback flags", () => {
    const outcome = buildOutcome({
      model: "openai/gpt-oss-120b",
      evalCase: sampleCase,
      result: { correct: true, reason: "Yes — leafy layer. Canopy is about treetops.", hint: null },
      failReasons: [],
      latencyMs: 812,
    })
    expect(outcome.latencyMs).toBe(812)
    expect(outcome.liveFailed).toBe(false)
    expect(outcome.usedLocalFallback).toBe(false)
    expect(outcome.actualCorrect).toBe(true)
  })
})

describe("buildErrorOutcome", () => {
  it("marks a thrown grade call as liveFailed without a verdict", () => {
    const outcome = buildErrorOutcome({
      model: "openai/gpt-oss-120b",
      evalCase: sampleCase,
      errorMessage: "rate limited",
      latencyMs: 41,
    })
    expect(outcome.liveFailed).toBe(true)
    expect(outcome.usedLocalFallback).toBe(false)
    expect(outcome.actualCorrect).toBeNull()
    expect(outcome.latencyMs).toBe(41)
  })
})
