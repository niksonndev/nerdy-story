import { afterAll, describe, expect, it } from "vitest"

import { comprehensionCases } from "./cases"
import { resolveEvalModels } from "./lib/models"
import { finalizeReport } from "./lib/reporter"
import { evaluateCase } from "./lib/run-case"

const RUN = process.env.RUN_LIVE_EVALS === "1"
const evalModels = resolveEvalModels()

describe.skipIf(!RUN)("comprehension grading evals", () => {
  afterAll(() => {
    finalizeReport("comprehension")
  })

  for (const model of evalModels) {
    describe.concurrent(`model: ${model}`, () => {
      it.each(comprehensionCases)(
        "$id ($category)",
        async (evalCase) => {
          const failReasons = await evaluateCase(evalCase, model)
          expect(failReasons, failReasons.join(" | ")).toEqual([])
        },
        60_000,
      )
    })
  }
})
