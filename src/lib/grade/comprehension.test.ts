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
  GRADE_MAX_OUTPUT_TOKENS,
  GRADE_PRIMARY_MODEL,
  GRADE_TEMPERATURE,
} from "@/lib/grade/shared";
import { comprehensionChallenges } from "@/lib/story-data";

describe("comprehensionGradeRequestSchema", () => {
  it("accepts a valid request and trims answer", () => {
    const parsed = comprehensionGradeRequestSchema.safeParse({
      challengeId: "track-clues",
      answer: "  because of the scraped bark and fur  ",
      priorAttempts: [
        {
          explanation: "they heard monkeys",
          reason: "This part is about clues on the branch.",
          hint: null,
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.answer).toBe("because of the scraped bark and fur");
      expect(parsed.data.priorAttempts).toHaveLength(1);
    }
  });

  it("rejects empty answer and malformed priorAttempts", () => {
    expect(
      comprehensionGradeRequestSchema.safeParse({
        challengeId: "track-clues",
        answer: "   ",
      }).success,
    ).toBe(false);

    expect(
      comprehensionGradeRequestSchema.safeParse({
        challengeId: "track-clues",
        answer: "because they heard monkeys",
        priorAttempts: [{ explanation: "x", reason: "y" }],
      }).success,
    ).toBe(false);
  });
});

describe("gradeComprehensionLocally", () => {
  it("accepts acceptKeywords phrases as correct", () => {
    const result = gradeComprehensionLocally({
      challengeId: "track-clues",
      answer: "because of the scraped bark and green fur",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
    expect(result.reason).toMatch(/matches/i);
  });

  it("accepts overlapping expectedUnderstanding tokens as correct", () => {
    const result = gradeComprehensionLocally({
      challengeId: "tracks-choice-outcome",
      answer: "the tracks got faint and she almost went the wrong way",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
  });

  it("accepts overlapping expectedUnderstanding tokens for guide path", () => {
    const result = gradeComprehensionLocally({
      challengeId: "guide-choice-outcome",
      answer: "sloths rest at midday and get active near dusk so they waited",
    });
    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
  });

  it("rejects a wrong idea and returns a story hint", () => {
    const result = gradeComprehensionLocally({
      challengeId: "track-clues",
      answer: "bananas and candy",
    });
    expect(result).toEqual({
      correct: false,
      reason:
        "That does not quite match this part of the story. Try another way to say it.",
      hint: comprehensionChallenges["track-clues"].hints[0],
    });
  });

  it("uses the next hint tier after prior attempts", () => {
    const result = gradeComprehensionLocally({
      challengeId: "track-clues",
      answer: "bananas",
      priorAttempts: [
        {
          explanation: "hungry",
          reason: "nope",
          hint: comprehensionChallenges["track-clues"].hints[0],
        },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.hint).toBe(comprehensionChallenges["track-clues"].hints[1]);
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
        answer: "because they heard monkeys",
      }),
    ).rejects.toMatchObject({ kind: "fatal" });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("maps a correct model result and configures Gateway failover", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: true,
        reason: "They found scraped bark and green fur from a sloth.",
        hint: "should be cleared",
      },
    });

    const result = await gradeComprehension({
      challengeId: "track-clues",
      answer: "they saw scraped bark and green fur on the branch",
    });

    expect(result).toEqual({
      correct: true,
      reason: "They found scraped bark and green fur from a sloth.",
      hint: null,
    });
    expect(generateText).toHaveBeenCalledTimes(1);

    const call = generateText.mock.calls[0]?.[0] as {
      model: string;
      temperature: number;
      maxOutputTokens: number;
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
    expect(call.temperature).toBe(GRADE_TEMPERATURE);
    expect(call.maxOutputTokens).toBe(GRADE_MAX_OUTPUT_TOKENS);
    expect(call.providerOptions.gateway.models).toEqual([
      ...GRADE_FALLBACK_MODELS,
    ]);
    expect(call.providerOptions.gateway.tags).toContain(
      "feature:comprehension-grade",
    );
    expect(call.prompt).toContain(
      comprehensionChallenges["track-clues"].question,
    );
    expect(call.prompt).toContain(
      comprehensionChallenges["track-clues"].expectedUnderstanding,
    );
    expect(call.prompt).toContain(
      "they saw scraped bark and green fur on the branch",
    );
    expect(call.system).toMatch(/reading-comprehension/i);
    expect(call.system).toMatch(/expected understanding/i);
    expect(gradeResultSchema.shape.reason.description).toMatch(
      /Story comprehension/i,
    );
  });

  it("includes prior attempts in the prompt as context", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "This part is about branch clues, not exactly about animals nearby.",
        hint: "Look again at what Grandpa Elias noticed on the branch.",
      },
    });

    await gradeComprehension({
      challengeId: "track-clues",
      answer: "because they heard monkeys",
      priorAttempts: [
        {
          explanation: "they saw a bird",
          reason: "This part is about clues on the branch.",
          hint: comprehensionChallenges["track-clues"].hints[0],
        },
      ],
    });

    const call = generateText.mock.calls[0]?.[0] as { prompt: string };
    expect(call.prompt).toContain("Previous tries");
    expect(call.prompt).toContain("they saw a bird");
    expect(call.prompt).toContain(
      "Child's latest answer: because they heard monkeys",
    );
  });

  it("maps an incorrect model result with a hint", async () => {
    generateText.mockResolvedValue({
      output: {
        correct: false,
        reason: "This part is about branch clues, not exactly about snacks.",
        hint: "Look again at what was on the branch.",
      },
    });

    const result = await gradeComprehension({
      challengeId: "track-clues",
      answer: "she wants a snack",
    });

    expect(result).toEqual({
      correct: false,
      reason: "This part is about branch clues, not exactly about snacks.",
      hint: "Look again at what was on the branch.",
    });
  });

  it("falls back to local grading when NoObjectGeneratedError is thrown", async () => {
    const error = Object.assign(new Error("no object"), {
      name: "AI_NoObjectGeneratedError",
    });
    generateText.mockRejectedValue(error);

    const result = await gradeComprehension({
      challengeId: "track-clues",
      answer: "bananas",
    });

    expect(result.correct).toBe(false);
    expect(result.hint).toBe(comprehensionChallenges["track-clues"].hints[0]);
  });

  it("falls back to local grading when NoOutputGeneratedError is thrown", async () => {
    const error = Object.assign(new Error("no output"), {
      name: "AI_NoOutputGeneratedError",
    });
    generateText.mockRejectedValue(error);

    const result = await gradeComprehension({
      challengeId: "track-clues",
      answer: "scraped bark and green fur on the branch",
    });

    expect(result.correct).toBe(true);
    expect(result.hint).toBeNull();
  });
});
