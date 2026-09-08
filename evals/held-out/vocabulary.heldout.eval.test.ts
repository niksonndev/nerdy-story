import { afterAll, describe, expect, it } from "vitest"

import { resolveEvalModels } from "../lib/models"
import { finalizeReport } from "../lib/reporter"
import { evaluateCase } from "../lib/run-case"
import { heldOutVocabularyCases } from "./index"

const RUN = process.env.RUN_LIVE_EVALS === "1"
const evalModels = resolveEvalModels()

describe.skipIf(!RUN)("vocabulary held-out grading evals", () => {
  afterAll(() => {
    finalizeReport("vocabulary", { suite: "heldout" })
  })

  for (const model of evalModels) {
    describe.concurrent(`model: ${model}`, () => {
      it.each(heldOutVocabularyCases)(
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
