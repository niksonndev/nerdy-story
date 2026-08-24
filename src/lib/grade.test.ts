import { describe, expect, it } from "vitest";

import { mockGradeExplanation } from "@/lib/grade";

describe("mockGradeExplanation", () => {
  it("accepts an explanation that captures the meaning", () => {
    const result = mockGradeExplanation({
      wordId: "shelter",
      explanation: "a safe place to hide from the rain",
    });
    expect(result.correct).toBe(true);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("rejects an explanation about a different concept", () => {
    const result = mockGradeExplanation({
      wordId: "shelter",
      explanation: "a kind of tasty fruit you eat",
    });
    expect(result.correct).toBe(false);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("rejects an empty explanation", () => {
    const result = mockGradeExplanation({
      wordId: "shelter",
      explanation: "   ",
    });
    expect(result.correct).toBe(false);
  });

  it("handles an unknown word gracefully", () => {
    const result = mockGradeExplanation({
      wordId: "nope",
      explanation: "safe cover",
    });
    expect(result.correct).toBe(false);
  });
});
