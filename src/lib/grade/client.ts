import type { GradeAttempt, GradeResult } from "@/lib/grade/shared";

async function postGrade(url: string, body: unknown): Promise<GradeResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Grade request failed");
  }
  return (await response.json()) as GradeResult;
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
