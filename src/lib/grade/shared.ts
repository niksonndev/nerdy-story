import {
  NoObjectGeneratedError,
  NoOutputGeneratedError,
} from "ai";

import { priorAttemptSchema } from "@/lib/grade/child-input";
import type { z } from "zod";

/** Primary + Gateway failover — educational prompt is independent of these IDs. */
export const GRADE_PRIMARY_MODEL = "openai/gpt-oss-120b";
export const GRADE_FALLBACK_MODELS = [
  "google/gemini-2.5-flash-lite",
] as const;

/** Shared live-grade generation limits (vocab + comprehension). */
export const GRADE_MAX_OUTPUT_TOKENS = 1024;
export const GRADE_TEMPERATURE = 0.1;

export const gradeAttemptSchema = priorAttemptSchema;

export type GradeAttempt = z.infer<typeof priorAttemptSchema>;

/** Vocabulary grade request shape (schema lives in vocabulary.ts). */
export type GradeRequest = {
  wordId: string;
  explanation: string;
  priorAttempts?: GradeAttempt[];
};

/** Comprehension grade request shape (schema lives in comprehension.ts). */
export type ComprehensionGradeRequest = {
  challengeId: string;
  answer: string;
  priorAttempts?: GradeAttempt[];
};

export type GradeResult = {
  correct: boolean;
  reason: string;
  hint: string | null;
};

export type GradeErrorKind = "structured" | "retryable" | "fatal";

export class GradeError extends Error {
  readonly kind: GradeErrorKind;

  constructor(kind: GradeErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GradeError";
    this.kind = kind;
  }
}

export function isGradeError(error: unknown): error is GradeError {
  return error instanceof GradeError;
}

function statusCodeOf(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const record = error as { statusCode?: unknown; cause?: unknown };
  if (typeof record.statusCode === "number") return record.statusCode;
  return statusCodeOf(record.cause);
}

/** Map thrown AI SDK / Gateway failures into GradeError kinds. */
export function classifyGradeFailure(error: unknown): GradeError {
  if (isGradeError(error)) return error;

  if (
    NoObjectGeneratedError.isInstance(error) ||
    NoOutputGeneratedError.isInstance(error)
  ) {
    return new GradeError("structured", "Structured grade output was invalid.", {
      cause: error,
    });
  }

  const status = statusCodeOf(error);
  if (status === 401 || status === 403) {
    return new GradeError("fatal", "Grading authentication failed.", {
      cause: error,
    });
  }

  return new GradeError("retryable", "Grading provider request failed.", {
    cause: error,
  });
}
