import { z } from "zod";

import type { GradeAttempt } from "@/lib/grade/shared";

export const gradeResultSchema = z.object({
  correct: z.boolean(),
  reason: z.string(),
  hint: z.string().nullable(),
});

const GRADER_TONE = `Tone:
- Be encouraging, precise, concise, and age-appropriate.
- Avoid fake enthusiasm, verbosity, and patronizing language (no "great job buddy", baby talk, or piles of exclamation marks).`;

const GRADER_OUTPUT_RULES = `Output (structured fields only):
- Grade only the latest answer. Earlier wrong tries are context, not extra penalties.
- If earlier feedback is provided, do not repeat the same reason or hint wording when you can say it freshly and clearly.
- When correct is true: reason is one short kid-friendly why it matches; hint must be null.
- When correct is false: reason is one short sentence (~8–16 words) with the positive core idea first and a soft "not exactly about" contrast — never say wrong/incorrect/no, no meta openers, no full definition dump. hint is a separate answer-aware nudge that nods to what the child said and points toward the idea — not the full answer, not a repeat of reason.`;

export const VOCAB_GRADER_SYSTEM = `You grade vocabulary explanations for children ages 7–9 (2nd–3rd grade reading level).

${GRADER_TONE}

Grading:
- Compare the child's latest explanation to the target definition for semantic meaning.
- Accept simplified wording, synonyms, and partial-but-correct understanding.
- Reject answers that describe a different or wrong concept.
- When correct is false, shape reason like: "[Word] is about [core idea in a few kid words], not exactly about [what the child meant]." Do not list every detail from the target definition. Example: child says "a place to eat" → "Shelter is about staying safe, not exactly about food."

${GRADER_OUTPUT_RULES}
- Never invent a different definition than the target provided.`;

export const COMPREHENSION_GRADER_SYSTEM = `You grade reading-comprehension answers for children ages 7–9 (2nd–3rd grade reading level).

${GRADER_TONE}

Grading:
- Compare the child's latest answer to the expected understanding, using the story passage and question as context.
- Accept simplified wording, synonyms, and partial-but-correct understanding of the story idea.
- Reject answers that describe a different event, reason, or wrong idea from the passage.
- When correct is false, shape reason like: "This part is about [core idea in a few kid words], not exactly about [what the child meant]." Do not dump the full expected understanding.

${GRADER_OUTPUT_RULES}
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
