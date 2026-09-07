import { priorAttemptSchema } from "@/lib/grade/child-input";
import type { z } from "zod";

/** Primary + Gateway failover — educational prompt is independent of these IDs. */
export const GRADE_PRIMARY_MODEL = "openai/gpt-oss-120b";
export const GRADE_FALLBACK_MODELS = [
  "google/gemini-3.1-flash-lite",
] as const;

/** Shared live-grade generation limits (vocab + comprehension). */
export const GRADE_MAX_OUTPUT_TOKENS = 1024;
export const GRADE_TEMPERATURE = 0;

export type GradeAttempt = z.infer<typeof priorAttemptSchema>;

/** Vocabulary grade request shape (schema lives in vocabulary.ts). */
export type VocabularyGradeRequest = {
  wordId: string;
  childAnswer: string;
  priorAttempts?: GradeAttempt[];
};

/** Comprehension grade request shape (schema lives in comprehension.ts). */
export type ComprehensionGradeRequest = {
  challengeId: string;
  childAnswer: string;
  priorAttempts?: GradeAttempt[];
};

export type GradeResult = {
  correct: boolean;
  reason: string;
  hint: string | null;
};

/**
 * Overrides for the live grade call. Production omits this and uses the
 * default primary model + Gateway failover. Evals pass an explicit model with
 * `failoverModels: []` to grade one model's calibration in isolation.
 */
export type GradeLiveOptions = {
  model?: string;
  failoverModels?: readonly string[];
};

export class GradeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GradeError";
  }
}

export function isGradeError(error: unknown): error is GradeError {
  return error instanceof GradeError;
}
