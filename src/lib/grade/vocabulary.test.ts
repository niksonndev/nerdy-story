import { beforeEach, describe, expect, it, vi } from "vitest";

const generateText = vi.hoisted(() => vi.fn());

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateText(...args),
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
}));

import {
  classifyGradeFailure,
  GradeError,
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
} from "@/lib/grade/shared";
import { gradeExplanation, gradeRequestSchema } from "@/lib/grade/vocabulary";
import { gradeVocabularyLocally } from "@/lib/grade/vocabulary-local";
import { mysteryWords } from "@/lib/story-data";

describe("gradeRequestSchema", () => {
  it("accepts a valid request and trims explanation", () => {
    const parsed = gradeRequestSchema.safeParse({
      wordId: "shelter",
      explanation: "  a safe place  ",
      priorAttempts: [
        {
          explanation: "a fruit",
          reason: "That sounds like food.",
          hint: null,
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.explanation).toBe("a safe place");
      expect(parsed.data.priorAttempts).toHaveLength(1);
    }
  });

  it("rejects empty explanation and malformed priorAttempts", () => {
    expect(
      gradeRequestSchema.safeParse({
        wordId: "shelter",
        explanation: "   ",
      }).success,
    ).toBe(false);

    expect(
      gradeRequestSchema.safeParse({
        wordId: "shelter",
        explanation: "a safe place",
        priorAttempts: [{ explanation: "x", reason: "y" }],
      }).success,
    ).toBe(false);
  });
});

describe("gradeVocabularyLocally", () => {
  it("accepts overlapping definition tokens as correct", () => {
    const result = gradeVocabularyLocally({
      wordId: "shelter",
      explanation: "a safe covered place from rain",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
    expect(result.reason).toMatch(/shelter/i);
  });

  it("accepts acceptKeywords phrases as correct", () => {
    const result = gradeVocabularyLocally({
      wordId: "snug",
      explanation: "it feels cozy under a blanket",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
  });

  it("rejects a wrong concept and returns a story hint", () => {
    const result = gradeVocabularyLocally({
      wordId: "shelter",
      explanation: "a kind of tasty fruit",
    });
    expect(result).toEqual({
      correct: false,
      reason:
        "That does not quite match the meaning. Try another way to say it.",
      hint: mysteryWords.shelter.hints[0],
    });
  });

  it("uses the next hint tier after prior attempts", () => {
    const result = gradeVocabularyLocally({
      wordId: "shelter",
      explanation: "a banana",
      priorAttempts: [
        {
          explanation: "a fruit",
          reason: "nope",
          hint: mysteryWords.shelter.hints[0],
        },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.hint).toBe(mysteryWords.shelter.hints[1]);
  });
});

describe("gradeExplanation", () => {
  beforeEach(() => {
    generateText.mockReset();
  });

  it("throws fatal GradeError for an unknown word without calling the model", async () => {
    await expect(
      gradeExplanation({
        wordId: "nope",
        explanation: "safe cover",
      }),
    ).rejects.toMatchObject({ kind: "fatal" });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("maps a correct model result and configures Gateway failover", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: true,
        reason: "A shelter is a safe place from the rain.",
        hint: "should be cleared",
      },
    });

    const result = await gradeExplanation({
      wordId: "shelter",
      explanation: "a safe place from the rain",
    });

    expect(result).toEqual({
      correct: true,
      reason: "A shelter is a safe place from the rain.",
      hint: null,
    });
    expect(generateText).toHaveBeenCalledTimes(1);

    const call = generateText.mock.calls[0]?.[0] as {
      model: string;
      prompt: string;
      system: string;
      providerOptions: {
        gateway: {
          models: string[];
          tags: string[];
        };
      };
    };
    expect(call.model).toBe(GRADE_PRIMARY_MODEL);
    expect(call.providerOptions.gateway.models).toEqual([
      ...GRADE_FALLBACK_MODELS,
    ]);
    expect(call.providerOptions.gateway).not.toHaveProperty("providerTimeouts");
    expect(call.providerOptions.gateway.tags).toContain(
      "feature:vocabulary-grade",
    );
    expect(call.prompt).toContain(
      "A shelter is a safe, covered place that keeps you protected",
    );
    expect(call.prompt).toContain("a safe place from the rain");
    expect(call.system).toMatch(/encouraging/i);
    expect(call.system).toMatch(/fake enthusiasm/i);
    expect(call.system).toMatch(/hint/i);
    expect(call.system).toMatch(/not exactly about/i);
    expect(call.system).toMatch(/staying safe, not exactly about food/i);
  });

  it("includes prior attempts in the prompt as context", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "That still sounds like something else.",
        hint: "Think about a covered place.",
      },
    });

    await gradeExplanation({
      wordId: "shelter",
      explanation: "a dry roof",
      priorAttempts: [
        {
          explanation: "a tasty fruit",
          reason: "That sounds like food, not a place.",
          hint: "Think about staying dry in the rain.",
        },
      ],
    });

    const call = generateText.mock.calls[0]?.[0] as { prompt: string };
    expect(call.prompt).toContain("Previous tries");
    expect(call.prompt).toContain("a tasty fruit");
    expect(call.prompt).toContain("Think about staying dry in the rain.");
    expect(call.prompt).toContain("Child's latest explanation: a dry roof");
  });

  it("maps an incorrect model result with a hint", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "That sounds like something else.",
        hint: "Think about a safe, covered spot.",
      },
    });

    const result = await gradeExplanation({
      wordId: "shelter",
      explanation: "a kind of tasty fruit",
    });

    expect(result).toEqual({
      correct: false,
      reason: "That sounds like something else.",
      hint: "Think about a safe, covered spot.",
    });
  });

  it("falls back to local grading when generateText rejects", async () => {
    const error = Object.assign(new Error("no object"), {
      name: "AI_NoObjectGeneratedError",
    });
    generateText.mockRejectedValue(error);

    const result = await gradeExplanation({
      wordId: "shelter",
      explanation: "a banana",
    });

    expect(result.correct).toBe(false);
    expect(result.hint).toBe(mysteryWords.shelter.hints[0]);
  });

  it("falls back to local grading when NoOutputGeneratedError is thrown", async () => {
    const error = Object.assign(new Error("no output"), {
      name: "AI_NoOutputGeneratedError",
    });
    generateText.mockRejectedValue(error);

    const result = await gradeExplanation({
      wordId: "shelter",
      explanation: "a banana",
    });

    expect(result.correct).toBe(false);
    expect(result.hint).toBe(mysteryWords.shelter.hints[0]);
  });

  it("classifies 403 provider errors as fatal", () => {
    const error = Object.assign(new Error("forbidden"), { statusCode: 403 });
    expect(classifyGradeFailure(error)).toMatchObject({ kind: "fatal" });
  });

  it("classifies unknown failures as retryable", () => {
    expect(classifyGradeFailure(new Error("network down"))).toMatchObject({
      kind: "retryable",
    });
  });

  it("preserves an existing GradeError", () => {
    const original = new GradeError("fatal", "auth");
    expect(classifyGradeFailure(original)).toBe(original);
  });

  it("classifies NoObjectGeneratedError as structured", () => {
    const error = Object.assign(new Error("no object"), {
      name: "AI_NoObjectGeneratedError",
    });
    expect(classifyGradeFailure(error)).toMatchObject({ kind: "structured" });
  });

  it("classifies NoOutputGeneratedError as structured", () => {
    const error = Object.assign(new Error("no output"), {
      name: "AI_NoOutputGeneratedError",
    });
    expect(classifyGradeFailure(error)).toMatchObject({ kind: "structured" });
  });
});
