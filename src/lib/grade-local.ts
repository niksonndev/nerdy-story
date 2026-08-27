import type { GradeRequest, GradeResult } from "@/lib/grade";
import { mysteryWords, type MysteryWord } from "@/lib/story-data";

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

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

function contentTokens(text: string): Set<string> {
  return new Set(normalizeTokens(text));
}

function overlapCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const token of a) {
    if (b.has(token)) count += 1;
  }
  return count;
}

function matchesAcceptKeywords(
  explanationLower: string,
  keywords: string[] | undefined,
): boolean {
  if (!keywords || keywords.length === 0) return false;
  return keywords.some((keyword) => {
    const needle = keyword.toLowerCase().trim();
    return needle.length > 0 && explanationLower.includes(needle);
  });
}

function isLocallyCorrect(word: MysteryWord, explanation: string): boolean {
  const explanationLower = explanation.toLowerCase();
  if (matchesAcceptKeywords(explanationLower, word.acceptKeywords)) {
    return true;
  }

  const explanationTokens = contentTokens(explanation);
  const definitionTokens = contentTokens(word.targetDefinition);
  if (explanationTokens.size === 0 || definitionTokens.size === 0) {
    return false;
  }

  const overlap = overlapCount(explanationTokens, definitionTokens);
  const threshold = definitionTokens.size <= 3 ? 1 : 2;
  return overlap >= threshold;
}

function hintForAttempt(
  word: MysteryWord,
  priorAttemptCount: number,
): string | null {
  if (word.hints.length === 0) return null;
  return word.hints[Math.min(priorAttemptCount, word.hints.length - 1)] ?? null;
}

/**
 * Simple keyword meaning check used when live AI grading fails.
 * Same GradeResult shape as the live grader — not a second AI call.
 */
export function gradeLocally(request: GradeRequest): GradeResult {
  const word = mysteryWords[request.wordId];

  if (!word) {
    return {
      correct: false,
      reason: "Hmm, I could not find that word. Let's try again together.",
      hint: null,
    };
  }

  const explanation = request.explanation.trim();
  const priorCount = request.priorAttempts?.length ?? 0;

  if (isLocallyCorrect(word, explanation)) {
    return {
      correct: true,
      reason: `Yes — that matches what "${word.word}" means.`,
      hint: null,
    };
  }

  return {
    correct: false,
    reason: "That does not quite match the meaning. Try another way to say it.",
    hint: hintForAttempt(word, priorCount),
  };
}
