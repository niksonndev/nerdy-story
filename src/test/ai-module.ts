export function aiTestDoubles(
  generateText: (...args: unknown[]) => unknown,
) {
  return {
    generateText,
    Output: {
      object: (spec: unknown) => spec,
    },
    NoObjectGeneratedError: {
      isInstance: (error: unknown) =>
        Boolean(
          error &&
            typeof error === "object" &&
            (error as { name?: string }).name === "AI_NoObjectGeneratedError",
        ),
    },
    NoOutputGeneratedError: {
      isInstance: (error: unknown) =>
        Boolean(
          error &&
            typeof error === "object" &&
            (error as { name?: string }).name === "AI_NoOutputGeneratedError",
        ),
    },
  };
}

