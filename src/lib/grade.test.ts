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
}));

import {
  classifyGradeFailure,
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
  GradeError,
  gradeExplanation,
  gradeRequestSchema,
} from "@/lib/grade";

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

describe("gradeExplanation", () => {
  beforeEach(() => {
    generateText.mockReset();
  });

  it("handles an unknown word without calling the model", async () => {
    const result = await gradeExplanation({
      wordId: "nope",
      explanation: "safe cover",
    });
    expect(result).toEqual({
      correct: false,
      reason: "Hmm, I could not find that word. Let's try again together.",
      hint: null,
    });
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
    expect(call.providerOptions.gateway.tags).toContain("feature:vocab-grade");
    expect(call.prompt).toContain(
      "A shelter is a safe, covered place that keeps you protected",
    );
    expect(call.prompt).toContain("a safe place from the rain");
    expect(call.system).toMatch(/encouraging/i);
    expect(call.system).toMatch(/fake enthusiasm/i);
    expect(call.system).toMatch(/hint/i);
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

  it("throws a structured GradeError when output is missing", async () => {
    generateText.mockResolvedValue({ output: undefined });

    await expect(
      gradeExplanation({
        wordId: "shelter",
        explanation: "safe cover",
      }),
    ).rejects.toMatchObject({
      name: "GradeError",
      kind: "structured",
    });
  });

  it("classifies NoObjectGeneratedError as structured", async () => {
    const error = Object.assign(new Error("no object"), {
      name: "AI_NoObjectGeneratedError",
    });
    generateText.mockRejectedValue(error);

    await expect(
      gradeExplanation({
        wordId: "shelter",
        explanation: "safe cover",
      }),
    ).rejects.toMatchObject({ kind: "structured" });
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
});
