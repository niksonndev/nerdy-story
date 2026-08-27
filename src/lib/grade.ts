import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

import { gradeLocally } from "@/lib/grade-local";
import { mysteryWords } from "@/lib/story-data";

/** Primary + Gateway failover — educational prompt is independent of these IDs. */
export const GRADE_PRIMARY_MODEL = "openai/gpt-4o-mini";
export const GRADE_FALLBACK_MODELS = ["google/gemini-3.7-flash"] as const;

export const gradeAttemptSchema = z.object({
  explanation: z.string(),
  reason: z.string(),
  hint: z.string().nullable(),
});

export const gradeRequestSchema = z.object({
  wordId: z.string().min(1),
  explanation: z.string().trim().min(1),
  priorAttempts: z.array(gradeAttemptSchema).optional(),
});

export type GradeAttempt = z.infer<typeof gradeAttemptSchema>;
export type GradeRequest = z.infer<typeof gradeRequestSchema>;

export type GradeResult = {
  correct: boolean;
  reason: string;
  hint: string | null;
};

export type GradeErrorKind = "structured" | "retryable" | "fatal";

export class GradeError extends Error {
  readonly kind: GradeErrorKind;

  constructor(kind: GradeErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GradeError";
    this.kind = kind;
  }
}

export function isGradeError(error: unknown): error is GradeError {
  return error instanceof GradeError;
}

function statusCodeOf(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const record = error as { statusCode?: unknown; cause?: unknown };
  if (typeof record.statusCode === "number") return record.statusCode;
  return statusCodeOf(record.cause);
}

/** Map thrown AI SDK / Gateway failures into GradeError kinds. */
export function classifyGradeFailure(error: unknown): GradeError {
  if (isGradeError(error)) return error;

  if (NoObjectGeneratedError.isInstance(error)) {
    return new GradeError("structured", "Structured grade output was invalid.", {
      cause: error,
    });
  }

  const status = statusCodeOf(error);
  if (status === 401 || status === 403) {
    return new GradeError("fatal", "Grading authentication failed.", {
      cause: error,
    });
  }

  return new GradeError("retryable", "Grading provider request failed.", {
    cause: error,
  });
}

const gradeResultSchema = z.object({
  correct: z
    .boolean()
    .describe(
      "True if the child's latest explanation matches the word's meaning (including simple, partial, or synonym phrasing).",
    ),
  reason: z
    .string()
    .describe(
      "One short, plain sentence for a 7–9 year old explaining why the answer is right or wrong. No hype, no baby talk, no exclamation spam.",
    ),
  hint: z
    .string()
    .nullable()
    .describe(
      "When correct is false: one short directional hint toward the idea (not the full definition). When correct is true: null.",
    ),
});

const GRADER_SYSTEM = `You grade vocabulary explanations for children ages 7–9 (2nd–3rd grade reading level).

Tone:
- Be encouraging, precise, concise, and age-appropriate.
- Avoid fake enthusiasm, verbosity, and patronizing language (no "great job buddy", baby talk, or piles of exclamation marks).

Grading:
- Compare the child's latest explanation to the target definition for semantic meaning.
- Accept simplified wording, synonyms, and partial-but-correct understanding.
- Reject answers that describe a different or wrong concept.
- Grade only the latest explanation. Earlier wrong tries are context, not extra penalties.
- If earlier feedback is provided, do not repeat the same reason or hint wording when you can say it freshly and clearly.
- Respond only via the structured fields. Keep "reason" to one short sentence.
- When correct is true: set hint to null. When correct is false: set hint to one short directional hint toward the idea — not the full definition, not a meaning dump.
- Never invent a different definition than the target provided.`;

function buildPrompt(
  word: (typeof mysteryWords)[string],
  explanation: string,
  priorAttempts: GradeAttempt[] | undefined,
): string {
  const lines = [
    `Mystery word: ${word.word}`,
    `Target definition: ${word.targetDefinition}`,
    `Child's latest explanation: ${explanation}`,
  ];

  if (priorAttempts && priorAttempts.length > 0) {
    lines.push("", "Previous tries (context only — do not re-grade these):");
    priorAttempts.forEach((attempt, index) => {
      lines.push(
        `${index + 1}. Child said: ${attempt.explanation}`,
        `   Your prior reason: ${attempt.reason}`,
        `   Hint shown: ${attempt.hint ?? "(none)"}`,
      );
    });
  }

  lines.push("", "Does the child's latest explanation match the meaning of the word?");
  return lines.join("\n");
}

/**
 * Live AI meaning check via AI Gateway (primary + failover models).
 * Looks up the target definition server-side.
 * After the live call fails (failover already attempted inside generateText),
 * returns a local keyword GradeResult instead of throwing.
 */
export async function gradeExplanation(
  request: GradeRequest,
): Promise<GradeResult> {
  const word = mysteryWords[request.wordId];

  if (!word) {
    return {
      correct: false,
      reason: "Hmm, I could not find that word. Let's try again together.",
      hint: null,
    };
  }

  const explanation = request.explanation.trim();

  try {
    const { output } = await generateText({
      model: GRADE_PRIMARY_MODEL,
      output: Output.object({
        schema: gradeResultSchema,
        name: "VocabGrade",
        description:
          "Whether the child's explanation matches the mystery word's meaning.",
      }),
      system: GRADER_SYSTEM,
      prompt: buildPrompt(word, explanation, request.priorAttempts),
      providerOptions: {
        gateway: {
          models: [...GRADE_FALLBACK_MODELS],
          tags: ["feature:vocab-grade"],
        },
      },
    });

    if (!output) {
      throw new GradeError(
        "structured",
        "Grading model returned no structured output.",
      );
    }

    return {
      correct: output.correct,
      reason: output.reason,
      hint: output.correct ? null : output.hint,
    };
  } catch {
    // Gateway already tried primary + failover models inside generateText.
    return gradeLocally({ ...request, explanation });
  }
}
