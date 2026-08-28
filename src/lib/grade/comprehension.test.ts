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
  comprehensionGradeRequestSchema,
  gradeComprehension,
} from "@/lib/grade/comprehension";
import { gradeComprehensionLocally } from "@/lib/grade/comprehension-local";
import { gradeResultSchema } from "@/lib/grade/prompts";
import {
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
} from "@/lib/grade/shared";
import { comprehensionChallenges } from "@/lib/story-data";

describe("comprehensionGradeRequestSchema", () => {
  it("accepts a valid request and trims answer", () => {
    const parsed = comprehensionGradeRequestSchema.safeParse({
      challengeId: "find-shelter",
      answer: "  because it is raining  ",
      priorAttempts: [
        {
          explanation: "she is hungry",
          reason: "This part is about the rain.",
          hint: null,
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.answer).toBe("because it is raining");
      expect(parsed.data.priorAttempts).toHaveLength(1);
    }
  });

  it("rejects empty answer and malformed priorAttempts", () => {
    expect(
      comprehensionGradeRequestSchema.safeParse({
        challengeId: "find-shelter",
        answer: "   ",
      }).success,
    ).toBe(false);

    expect(
      comprehensionGradeRequestSchema.safeParse({
        challengeId: "find-shelter",
        answer: "because it is raining",
        priorAttempts: [{ explanation: "x", reason: "y" }],
      }).success,
    ).toBe(false);
  });
});

describe("gradeComprehensionLocally", () => {
  it("accepts acceptKeywords phrases as correct", () => {
    const result = gradeComprehensionLocally({
      challengeId: "find-shelter",
      answer: "because of the rain",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
    expect(result.reason).toMatch(/matches/i);
  });

  it("accepts overlapping expectedUnderstanding tokens as correct", () => {
    const result = gradeComprehensionLocally({
      challengeId: "cozy-nap",
      answer: "she is cozy and sleepy in the hollow",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
  });

  it("rejects a wrong idea and returns a story hint", () => {
    const result = gradeComprehensionLocally({
      challengeId: "find-shelter",
      answer: "bananas and candy",
    });
    expect(result).toEqual({
      correct: false,
      reason:
        "That does not quite match this part of the story. Try another way to say it.",
      hint: comprehensionChallenges["find-shelter"].hints[0],
    });
  });

  it("uses the next hint tier after prior attempts", () => {
    const result = gradeComprehensionLocally({
      challengeId: "find-shelter",
      answer: "bananas",
      priorAttempts: [
        {
          explanation: "hungry",
          reason: "nope",
          hint: comprehensionChallenges["find-shelter"].hints[0],
        },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.hint).toBe(comprehensionChallenges["find-shelter"].hints[1]);
  });
});

describe("gradeComprehension", () => {
  beforeEach(() => {
    generateText.mockReset();
  });

  it("throws fatal GradeError for an unknown challenge without calling the model", async () => {
    await expect(
      gradeComprehension({
        challengeId: "nope",
        answer: "because rain",
      }),
    ).rejects.toMatchObject({ kind: "fatal" });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("maps a correct model result and configures Gateway failover", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: true,
        reason: "Pip needs somewhere dry from the rain.",
        hint: "should be cleared",
      },
    });

    const result = await gradeComprehension({
      challengeId: "find-shelter",
      answer: "so she can stay dry in the storm",
    });

    expect(result).toEqual({
      correct: true,
      reason: "Pip needs somewhere dry from the rain.",
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
    expect(call.providerOptions.gateway.tags).toContain(
      "feature:comprehension-grade",
    );
    expect(call.prompt).toContain(
      comprehensionChallenges["find-shelter"].question,
    );
    expect(call.prompt).toContain(
      comprehensionChallenges["find-shelter"].expectedUnderstanding,
    );
    expect(call.prompt).toContain("so she can stay dry in the storm");
    expect(call.system).toMatch(/reading-comprehension/i);
    expect(gradeResultSchema.shape.reason.description).toMatch(
      /this story part/,
    );
  });

  it("includes prior attempts in the prompt as context", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "This part is about staying dry, not exactly about food.",
        hint: "Think about the rain.",
      },
    });

    await gradeComprehension({
      challengeId: "find-shelter",
      answer: "she wants a dry spot",
      priorAttempts: [
        {
          explanation: "she is hungry",
          reason: "This part is about the storm.",
          hint: "Think about the rain.",
        },
      ],
    });

    const call = generateText.mock.calls[0]?.[0] as { prompt: string };
    expect(call.prompt).toContain("Previous tries");
    expect(call.prompt).toContain("she is hungry");
    expect(call.prompt).toContain("Child's latest answer: she wants a dry spot");
  });

  it("maps an incorrect model result with a hint", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "This part is about staying dry, not exactly about snacks.",
        hint: "Think about rain and a safe place.",
      },
    });

    const result = await gradeComprehension({
      challengeId: "find-shelter",
      answer: "she wants a snack",
    });

    expect(result).toEqual({
      correct: false,
      reason: "This part is about staying dry, not exactly about snacks.",
      hint: "Think about rain and a safe place.",
    });
  });

  it("falls back to local grading when NoObjectGeneratedError is thrown", async () => {
    const error = Object.assign(new Error("no object"), {
      name: "AI_NoObjectGeneratedError",
    });
    generateText.mockRejectedValue(error);

    const result = await gradeComprehension({
      challengeId: "find-shelter",
      answer: "bananas",
    });

    expect(result.correct).toBe(false);
    expect(result.hint).toBe(comprehensionChallenges["find-shelter"].hints[0]);
  });

  it("falls back to local grading when NoOutputGeneratedError is thrown", async () => {
    const error = Object.assign(new Error("no output"), {
      name: "AI_NoOutputGeneratedError",
    });
    generateText.mockRejectedValue(error);

    const result = await gradeComprehension({
      challengeId: "find-shelter",
      answer: "to stay dry",
    });

    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
  });
});
