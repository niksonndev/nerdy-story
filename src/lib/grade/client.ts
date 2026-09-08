import type { GradeAttempt, GradeResult } from "@/lib/grade/shared";

/** Bound the in-browser grade fetch so a hung Gateway call cannot spin forever. */
export const GRADE_CLIENT_TIMEOUT_MS = 8_000;

async function postGrade(url: string, body: unknown): Promise<GradeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    GRADE_CLIENT_TIMEOUT_MS,
  );
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error("Grade request failed");
    }
    return (await response.json()) as GradeResult;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestVocabularyGrade(
  wordId: string,
  childAnswer: string,
  priorAttempts: GradeAttempt[],
): Promise<GradeResult> {
  return postGrade("/api/grade-vocabulary", {
    wordId,
    childAnswer,
    priorAttempts,
  });
}

export async function requestComprehensionGrade(
  challengeId: string,
  childAnswer: string,
  priorAttempts: GradeAttempt[],
): Promise<GradeResult> {
  return postGrade("/api/grade-comprehension", {
    challengeId,
    childAnswer,
    priorAttempts,
  });
}
