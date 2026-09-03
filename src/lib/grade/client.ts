import type { GradeAttempt, GradeResult } from "@/lib/grade/shared";

export class GradeRequestError extends Error {
  constructor() {
    super("Grade request failed");
    this.name = "GradeRequestError";
  }
}

export function fallbackHintFor(
  hints: string[],
  attemptIndex: number,
): string | null {
  if (hints.length === 0) return null;
  return hints[Math.min(attemptIndex, hints.length - 1)] ?? null;
}

export async function requestVocabularyGrade(
  wordId: string,
  childAnswer: string,
  priorAttempts: GradeAttempt[],
): Promise<GradeResult> {
  const response = await fetch("/api/grade-vocabulary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordId, childAnswer, priorAttempts }),
  });
  if (!response.ok) {
    throw new GradeRequestError();
  }
  return (await response.json()) as GradeResult;
}

export async function requestComprehensionGrade(
  challengeId: string,
  childAnswer: string,
  priorAttempts: GradeAttempt[],
): Promise<GradeResult> {
  const response = await fetch("/api/grade-comprehension", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId, childAnswer, priorAttempts }),
  });
  if (!response.ok) {
    throw new GradeRequestError();
  }
  return (await response.json()) as GradeResult;
}
