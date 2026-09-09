const ERROR_MESSAGE_MAX_LENGTH = 300;

export type GradeLiveFailureContext = {
  feature: "vocabulary-grade" | "comprehension-grade";
  entityId: string;
};

function truncate(value: string): string {
  if (value.length <= ERROR_MESSAGE_MAX_LENGTH) return value;
  return value.slice(0, ERROR_MESSAGE_MAX_LENGTH);
}

function serializeGradeError(error: unknown): {
  errorName: string;
  errorMessage: string;
} {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: truncate(error.message),
    };
  }
  return {
    errorName: "Unknown",
    errorMessage: truncate(String(error)),
  };
}

function logGradeEvent(payload: Record<string, unknown>): void {
  console.error(JSON.stringify(payload));
}

/** Live generateText failed; local keyword grade is returned as HTTP 200. */
export function logGradeLiveFailure(
  context: GradeLiveFailureContext,
  error: unknown,
  localCorrect: boolean,
): void {
  logGradeEvent({
    msg: "grade.live_failed",
    feature: context.feature,
    entityId: context.entityId,
    ...serializeGradeError(error),
    fallback: "local",
    localCorrect,
  });
}

/** Unexpected throw escaped the grader; route returns HTTP 503. */
export function logGradeUnavailable(error: unknown): void {
  logGradeEvent({
    msg: "grade.unavailable",
    ...serializeGradeError(error),
  });
}
