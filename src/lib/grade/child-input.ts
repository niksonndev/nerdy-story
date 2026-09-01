import { z } from "zod";

import { MAX_ATTEMPTS } from "@/lib/story-data";

export const CHILD_ANSWER_MAX_LENGTH = 200;
export const PRIOR_ATTEMPT_META_MAX_LENGTH = 300;
export const MAX_PRIOR_ATTEMPTS = MAX_ATTEMPTS - 1;

const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/g;
const WHITESPACE_RUN_PATTERN = /\s+/g;

/** Strip control chars, collapse whitespace, trim, and cap length. */
export function sanitizeChildAnswer(raw: string): string {
  const withoutControls = raw.replace(CONTROL_CHAR_PATTERN, "");
  const collapsed = withoutControls.replace(WHITESPACE_RUN_PATTERN, " ").trim();
  return collapsed.slice(0, CHILD_ANSWER_MAX_LENGTH);
}

function sanitizePriorAttemptMeta(raw: string): string {
  const withoutControls = raw.replace(CONTROL_CHAR_PATTERN, "");
  const collapsed = withoutControls.replace(WHITESPACE_RUN_PATTERN, " ").trim();
  return collapsed.slice(0, PRIOR_ATTEMPT_META_MAX_LENGTH);
}

export const childAnswerSchema = z
  .string()
  .transform(sanitizeChildAnswer)
  .pipe(z.string().min(1).max(CHILD_ANSWER_MAX_LENGTH));

export const priorAttemptSchema = z.object({
  explanation: childAnswerSchema,
  reason: z
    .string()
    .transform(sanitizePriorAttemptMeta)
    .pipe(z.string().min(1).max(PRIOR_ATTEMPT_META_MAX_LENGTH)),
  hint: z
    .string()
    .nullable()
    .transform((value) =>
      value === null ? null : sanitizePriorAttemptMeta(value),
    )
    .pipe(z.string().max(PRIOR_ATTEMPT_META_MAX_LENGTH).nullable()),
});

export const priorAttemptsSchema = z
  .array(priorAttemptSchema)
  .max(MAX_PRIOR_ATTEMPTS)
  .optional();
