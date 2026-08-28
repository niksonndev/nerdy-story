import { z } from "zod";

import type { GradeAttempt } from "@/lib/grade/shared";

const REASON_FIELD_DESCRIPTION = `One short kid-friendly sentence that always praises — what you praise depends on correct.
When correct is true: affirm the result and explain why — tie their words to the target.
Templates: "Perfect! That's exactly it: [definition]." "Exactly! Since [word] is about [dimension], that fits perfectly." "Right — [word] means [definition], just like you said."
For story comprehension, use "this part" instead of [word].
When correct is false: name the domain or category their answer landed in and contrast against the target without revealing the target.
Templates: "Good guess, but [word] isn't about [child's concept]." "That's more about [child's concept] than about this word."
For comprehension: "...isn't about [child's concept]" / "...than about this story part."`;

const HINT_FIELD_DESCRIPTION = `When correct is false: one short answer-aware thinking question that nods to what the child said and points toward the target idea — make them wonder, not give the answer. Not a repeat of reason. Null when correct is true.`;

export const gradeResultSchema = z.object({
  correct: z
    .boolean()
    .describe("Whether the child's latest answer semantically matches."),
  reason: z.string().describe(REASON_FIELD_DESCRIPTION),
  hint: z.string().nullable().describe(HINT_FIELD_DESCRIPTION),
});

const GRADER_TONE = `Tone:
- Be encouraging, precise, concise, and age-appropriate.
- Avoid fake enthusiasm, verbosity, and patronizing language (no "great job buddy", baby talk, or piles of exclamation marks).`;

const GRADER_OUTPUT_BEHAVIOR = `Output behavior:
- Grade only the latest answer. Earlier wrong tries are context, not extra penalties.
- If earlier feedback is provided, do not repeat the same reason or hint wording when you can say it freshly and clearly.
- When correct is true: hint must be null.`;

const GRADER_ACCEPTANCE_RULES = `Acceptance:
- Accept simplified wording, synonyms, and partial-but-correct understanding.
- Reject answers that describe a different or wrong idea than the target.`;

export const VOCAB_GRADER_SYSTEM = `You grade vocabulary explanations for children ages 7–9 (2nd–3rd grade reading level).

${GRADER_TONE}

Grading:
- Compare the child's latest explanation to the target definition for semantic meaning.

${GRADER_ACCEPTANCE_RULES}

${GRADER_OUTPUT_BEHAVIOR}

- Never invent a different definition than the target provided.`;

export const COMPREHENSION_GRADER_SYSTEM = `You grade reading-comprehension answers for children ages 7–9 (2nd–3rd grade reading level).

${GRADER_TONE}

Grading:
- Compare the child's latest answer to the expected understanding, using the story passage and question as context.
- Reject answers that describe a different event, reason, or wrong idea from the passage.

${GRADER_ACCEPTANCE_RULES}

${GRADER_OUTPUT_BEHAVIOR}

- Never invent story facts that are not in the passage or expected understanding.`;

export function appendPriorAttempts(
  lines: string[],
  priorAttempts: GradeAttempt[] | undefined,
): void {
  if (!priorAttempts || priorAttempts.length === 0) return;

  lines.push("", "Previous tries (context only — do not re-grade these):");
  priorAttempts.forEach((attempt, index) => {
    lines.push(
      `${index + 1}. Child said: ${attempt.explanation}`,
      `   Your prior reason: ${attempt.reason}`,
      `   Hint shown: ${attempt.hint ?? "(none)"}`,
    );
  });
}
