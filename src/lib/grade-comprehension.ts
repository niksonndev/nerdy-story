import { generateText, Output } from "ai";
import { z } from "zod";

import {
  classifyGradeFailure,
  GRADE_FALLBACK_MODELS,
  GRADE_PRIMARY_MODEL,
  GradeError,
  gradeAttemptSchema,
  type GradeAttempt,
  type GradeResult,
} from "@/lib/grade";
import { comprehensionChallenges } from "@/lib/story-data";

export const comprehensionGradeRequestSchema = z.object({
  challengeId: z.string().min(1),
  answer: z.string().trim().min(1),
  priorAttempts: z.array(gradeAttemptSchema).optional(),
});

export type ComprehensionGradeRequest = z.infer<
  typeof comprehensionGradeRequestSchema
>;

const comprehensionGradeResultSchema = z.object({
  correct: z
    .boolean()
    .describe(
      "True if the child's latest answer shows understanding that matches the expected understanding (including simple or partial-but-correct phrasing).",
    ),
  reason: z
    .string()
    .describe(
      "Kid-facing why. If correct: one short plain sentence saying why it matches. If incorrect: one short sentence shaped like 'This part is about [core idea], not exactly about [child's idea].' Positive core idea first; soft contrast with 'not exactly about' (or 'not mainly about'). No 'wrong'/'incorrect', no meta openers, no full answer dump. About 8–16 words. Leave the personal nod and next-step nudge to hint.",
    ),
  hint: z
    .string()
    .nullable()
    .describe(
      "When correct is false: one short answer-aware nudge that nods to what the child said and points toward the idea (not the full answer, not repeating the reason). When correct is true: null.",
    ),
});

const COMPREHENSION_GRADER_SYSTEM = `You grade reading-comprehension answers for children ages 7–9 (2nd–3rd grade reading level).

Tone:
- Be encouraging, precise, concise, and age-appropriate.
- Avoid fake enthusiasm, verbosity, and patronizing language (no "great job buddy", baby talk, or piles of exclamation marks).

Grading:
- Compare the child's latest answer to the expected understanding, using the story passage and question as context.
- Accept simplified wording, synonyms, and partial-but-correct understanding of the story idea.
- Reject answers that describe a different event, reason, or wrong idea from the passage.
- Grade only the latest answer. Earlier wrong tries are context, not extra penalties.
- If earlier feedback is provided, do not repeat the same reason or hint wording when you can say it freshly and clearly.
- Respond only via the structured fields.
- When correct is true: reason is one short kid-friendly why it matches; hint must be null.
- When correct is false:
  - reason explains with this shape: "This part is about [core idea in a few kid words], not exactly about [what the child meant]." Put the positive core idea first; soften with "not exactly about" or "not mainly about". Never say wrong/incorrect/no. Do not dump the full expected understanding.
  - hint is the personal nod + next-step nudge: briefly acknowledge their idea and point toward the passage idea — not the full answer, not a repeat of reason.
- Never invent story facts that are not in the passage or expected understanding.`;

function buildPrompt(
  challenge: (typeof comprehensionChallenges)[string],
  answer: string,
  priorAttempts: GradeAttempt[] | undefined,
): string {
  const lines = [
    `Question: ${challenge.question}`,
    `Story passage: ${challenge.passage}`,
    `Expected understanding: ${challenge.expectedUnderstanding}`,
    `Child's latest answer: ${answer}`,
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

  lines.push(
    "",
    "Does the child's latest answer match the expected understanding of the passage?",
  );
  return lines.join("\n");
}

/**
 * Live AI comprehension check via AI Gateway (primary + failover models).
 * Looks up passage / expected understanding server-side.
 * On live failure (after Gateway failover), throws GradeError — no local matcher yet.
 */
export async function gradeComprehension(
  request: ComprehensionGradeRequest,
): Promise<GradeResult> {
  const challenge = comprehensionChallenges[request.challengeId];

  if (!challenge) {
    throw new GradeError("fatal", "Unknown comprehension challenge.");
  }

  const answer = request.answer.trim();

  try {
    const { output } = await generateText({
      model: GRADE_PRIMARY_MODEL,
      output: Output.object({
        schema: comprehensionGradeResultSchema,
        name: "ComprehensionGrade",
        description:
          "Whether the child's answer matches the expected story understanding.",
      }),
      system: COMPREHENSION_GRADER_SYSTEM,
      prompt: buildPrompt(challenge, answer, request.priorAttempts),
      providerOptions: {
        gateway: {
          models: [...GRADE_FALLBACK_MODELS],
          tags: ["feature:comprehension-grade"],
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
  } catch (error) {
    throw classifyGradeFailure(error);
  }
}
