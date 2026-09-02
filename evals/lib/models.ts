import {
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
} from "@/lib/grade/shared"

export type EvalModelsMode = "primary" | "fallback" | "all"

function parseMode(raw: string | undefined): EvalModelsMode {
  const value = (raw ?? "primary").toLowerCase()
  if (value === "fallback" || value === "all" || value === "primary") {
    return value
  }
  throw new Error(
    `Invalid EVAL_MODELS="${raw}" — expected one of: primary, fallback, all.`,
  )
}

/**
 * Resolve which grader model(s) to run against from the EVAL_MODELS env var.
 * Sourced from the production model constants — never hardcoded here.
 */
export function resolveEvalModels(): string[] {
  const mode = parseMode(process.env.EVAL_MODELS)
  const fallback = GRADE_FALLBACK_MODELS[0]

  switch (mode) {
    case "primary":
      return [GRADE_PRIMARY_MODEL]
    case "fallback":
      return [fallback]
    case "all":
      return [GRADE_PRIMARY_MODEL, fallback]
  }
}
