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
export function hasContentOverlap(answer: string, target: string): boolean {
  const answerTokens = contentTokens(answer);
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
