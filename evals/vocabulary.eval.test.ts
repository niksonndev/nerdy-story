import { afterAll, describe, expect, it } from "vitest"

import { vocabularyCases } from "./cases"
import { resolveEvalModels } from "./lib/models"
import { finalizeReport } from "./lib/reporter"
import { evaluateCase } from "./lib/run-case"

const RUN = process.env.RUN_LIVE_EVALS === "1"
const evalModels = resolveEvalModels()

describe.skipIf(!RUN)("vocabulary grading evals", () => {
  afterAll(() => {
    finalizeReport("vocabulary")
  })

  for (const model of evalModels) {
    describe.concurrent(`model: ${model}`, () => {
      it.each(vocabularyCases)(
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
