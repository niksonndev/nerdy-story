import { GradeError, type GradeResult } from "@/lib/grade/shared";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "means",
  "mean",
  "to",
  "from",
  "or",
  "and",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "you",
  "your",
  "that",
  "this",
  "it",
  "its",
  "as",
  "like",
  "when",
  "who",
  "what",
  "which",
  "someone",
  "something",
  "keeps",
  "keep",
  "feeling",
  "feel",
  "helps",
  "help",
  "fall",
]);

export function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

export function contentTokens(text: string): Set<string> {
  return new Set(normalizeTokens(text));
}

export function overlapCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const token of a) {
    if (b.has(token)) count += 1;
  }
  return count;
}

export function isLocallyCorrectAnswer(
  childAnswer: string,
  acceptKeywords: string[] | undefined,
  targetText: string,
): boolean {
  if (matchesAcceptKeywords(childAnswer.toLowerCase(), acceptKeywords)) {
    return true;
  }
  return hasContentOverlap(childAnswer, targetText);
}

export function requireKnown<T>(entity: T | undefined, message: string): T {
  if (!entity) throw new GradeError(message);
  return entity;
}

export type LocalMissReasonOptions =
  | { kind: "vocabulary"; word: string; coreIdea: string; childAnswer: string }
  | { kind: "comprehension"; coreIdea: string; childAnswer: string };

export function gradeLocally(options: {
  childAnswer: string;
  priorCount: number;
  hints: string[];
  isCorrect: boolean;
  correctReason: string;
  miss: LocalMissReasonOptions;
}): GradeResult {
  if (options.isCorrect) {
    return {
      correct: true,
      reason: options.correctReason,
      hint: null,
    };
  }
  return {
    correct: false,
    reason: buildLocalMissReason(options.miss),
    hint: hintForAttempt(options.hints, options.priorCount),
  };
}

export function matchesAcceptKeywords(
  textLower: string,
  keywords: string[] | undefined,
): boolean {
  if (!keywords || keywords.length === 0) return false;
  return keywords.some((keyword) => {
    const needle = keyword.toLowerCase().trim();
    return needle.length > 0 && textLower.includes(needle);
  });
}

/** Token overlap vs a target text — same thresholds as vocabulary local grading. */
export function hasContentOverlap(childAnswer: string, target: string): boolean {
  const answerTokens = contentTokens(childAnswer);
  const targetTokens = contentTokens(target);
  if (answerTokens.size === 0 || targetTokens.size === 0) {
    return false;
  }

  const overlap = overlapCount(answerTokens, targetTokens);
  const threshold = targetTokens.size <= 3 ? 1 : 2;
  return overlap >= threshold;
}

export function hintForAttempt(
  hints: string[],
  priorAttemptCount: number,
): string | null {
  if (hints.length === 0) return null;
  return hints[Math.min(priorAttemptCount, hints.length - 1)] ?? null;
}

const CHILD_IDEA_FALLBACK = "what you said";

const MEANINGLESS_TOKENS = new Set([
  "dunno",
  "idk",
  "maybe",
  "no",
  "nothing",
  "yes",
]);

function capitalizeWord(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const MAX_HIT_PHRASE_CHARS = 40;
const MAX_HIT_PHRASE_CONTENT_WORDS = 6;

function isContentWord(word: string): boolean {
  const token = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    token.length > 0 &&
    !STOPWORDS.has(token) &&
    !MEANINGLESS_TOKENS.has(token)
  );
}

/**
 * Short slice of the child's original wording for local hit-reason echo.
 * Skips leading filler, keeps their phrases, caps length.
 */
export function extractChildPhrase(childAnswer: string): string {
  const trimmed = childAnswer.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return CHILD_IDEA_FALLBACK;

  const words = trimmed.split(" ");
  const kept: string[] = [];
  let contentCount = 0;
  for (const word of words) {
    const content = isContentWord(word);
    if (kept.length === 0 && !content) continue;
    kept.push(word);
    if (content) contentCount += 1;
    if (contentCount >= MAX_HIT_PHRASE_CONTENT_WORDS) break;
  }

  if (kept.length === 0) return CHILD_IDEA_FALLBACK;

  let phrase = kept.join(" ");
  if (phrase.length > MAX_HIT_PHRASE_CHARS) {
    phrase = phrase.slice(0, MAX_HIT_PHRASE_CHARS).replace(/\s+\S*$/, "").trim();
  }
  phrase = phrase.replace(/[.,!?;:]+$/, "");
  return phrase.length > 0 ? phrase : CHILD_IDEA_FALLBACK;
}

export type LocalHitReasonOptions =
  | { kind: "vocabulary"; word: string; coreIdea: string; childAnswer: string }
  | { kind: "comprehension"; coreIdea: string; childAnswer: string };

/** Build MVP hit-reason copy: echo their words, then name the idea. */
export function buildLocalHitReason(options: LocalHitReasonOptions): string {
  const phrase = extractChildPhrase(options.childAnswer);
  if (options.kind === "vocabulary") {
    return `Yes — you said ${phrase}. ${capitalizeWord(options.word)} is about ${options.coreIdea}.`;
  }
  return `Yes — you said ${phrase}. This part is about ${options.coreIdea}.`;
}

/** Pick a kid-facing phrase from the child's answer for local miss-reason copy. */
export function extractChildIdea(childAnswer: string, coreIdea: string): string {
  const answerTokens = normalizeTokens(childAnswer);
  const coreIdeaTokens = contentTokens(coreIdea);
  const remaining = answerTokens.filter(
    (token) =>
      !coreIdeaTokens.has(token) && !MEANINGLESS_TOKENS.has(token),
  );

  if (remaining.length === 0) {
    return CHILD_IDEA_FALLBACK;
  }

  let best = remaining[0]!;
  for (const token of remaining.slice(1)) {
    if (token.length >= best.length) {
      best = token;
    }
  }
  return best;
}

/** Build MVP miss-reason copy for server local grading fallback. */
export function buildLocalMissReason(options: LocalMissReasonOptions): string {
  const childIdea = extractChildIdea(options.childAnswer, options.coreIdea);

  if (options.kind === "vocabulary") {
    return `${capitalizeWord(options.word)} is about ${options.coreIdea}, not exactly about ${childIdea}.`;
  }

  return `This part is about ${options.coreIdea}, not exactly about ${childIdea}.`;
}
