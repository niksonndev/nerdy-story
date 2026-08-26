import { beforeEach, describe, expect, it, vi } from "vitest";

const generateText = vi.hoisted(() => vi.fn());

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateText(...args),
  Output: {
    object: (spec: unknown) => spec,
  },
}));

import {
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
  gradeExplanation,
} from "@/lib/grade";

describe("gradeExplanation", () => {
  beforeEach(() => {
    generateText.mockReset();
  });

  it("handles an unknown word without calling the model", async () => {
    const result = await gradeExplanation({
      wordId: "nope",
      explanation: "safe cover",
    });
    expect(result.correct).toBe(false);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("maps a correct model result and configures Gateway failover", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: true,
        reason: "A shelter is a safe place from the rain.",
      },
    });

    const result = await gradeExplanation({
      wordId: "shelter",
      explanation: "a safe place from the rain",
    });

    expect(result).toEqual({
      correct: true,
      reason: "A shelter is a safe place from the rain.",
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
  });

  it("maps an incorrect model result", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "That sounds like something else.",
      },
    });

    const result = await gradeExplanation({
      wordId: "shelter",
      explanation: "a kind of tasty fruit",
    });

    expect(result.correct).toBe(false);
    expect(result.reason).toContain("something else");
  });

  it("throws when the model returns no structured output", async () => {
    generateText.mockResolvedValue({ output: undefined });

    await expect(
      gradeExplanation({
        wordId: "shelter",
        explanation: "safe cover",
      }),
    ).rejects.toThrow(/no structured output/i);
  });
});
