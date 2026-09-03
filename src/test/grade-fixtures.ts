import type { GradeResult } from "@/lib/grade/shared";

export function gradeOk(reason: string): GradeResult {
  return { correct: true, reason, hint: null };
}

export function gradeMiss(reason: string, hint: string): GradeResult {
  return { correct: false, reason, hint };
}
