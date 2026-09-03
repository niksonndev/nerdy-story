import type { GradeAttempt } from "@/lib/grade/shared"

/** Vocabulary reject reason (see REASON_FIELD_DESCRIPTION in prompts.ts). */
export type VocabularyReasonTag = "wrong-concept"

/** Comprehension reject reasons (see REASON_FIELD_DESCRIPTION in prompts.ts). */
export type ComprehensionReasonTag =
  | "wrong-event"
  | "wrong-character"
  | "wrong-cause"
  | "ungrounded"

export type ReasonTag = VocabularyReasonTag | ComprehensionReasonTag

export type EvalCategory =
  | "accept-simple"
  | "accept-synonym"
  | "accept-imperfect-grammar"
  | "accept-partial"
  | "accept-rephrase"
  | "reject-wrong"
  | "boundary"
  | "gaming-parrot"
  | "gaming-verbatim"
  | "gaming-vague"

export const ACCEPT_CATEGORIES = [
  "accept-simple",
  "accept-synonym",
  "accept-imperfect-grammar",
  "accept-partial",
  "accept-rephrase",
] as const satisfies readonly EvalCategory[]

export const GAMING_CATEGORIES = [
  "gaming-parrot",
  "gaming-verbatim",
  "gaming-vague",
] as const satisfies readonly EvalCategory[]

export type GradeEvalCase = {
  id: string
  category: EvalCategory
  /** Exactly one of wordId / challengeId is set. */
  wordId?: string
  challengeId?: string
  childAnswer: string
  expectedCorrect: boolean
  /** Required when expectedCorrect is false (boundary rejects included). */
  expectedReasonTag?: ReasonTag
  /** Concept the reason should name (child's domain / miss type). */
  expectedReasonConcept?: string
  /** Required for boundary cases — documents the human adjudication. */
  boundaryRationale?: string
  priorAttempts?: GradeAttempt[]
}
