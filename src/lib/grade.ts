import { mysteryWords } from "@/lib/story-data";

export type GradeRequest = {
  wordId: string;
  explanation: string;
};

export type GradeResult = {
  correct: boolean;
  reason: string;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

/**
 * Placeholder grader that stands in for the future live-AI meaning check.
 * Accepts an explanation when it contains any of the word's keywords.
 * Returns a structured, kid-friendly result (never free-form prose).
 */
export function mockGradeExplanation(request: GradeRequest): GradeResult {
  const word = mysteryWords[request.wordId];

  if (!word) {
    return {
      correct: false,
      reason: "Hmm, I could not find that word. Let's try again together.",
    };
  }

  const text = normalize(request.explanation);
  const hasIdea =
    text.trim().length > 0 &&
    word.acceptKeywords.some((keyword) => text.includes(normalize(keyword)));

  if (hasIdea) {
    return {
      correct: true,
      reason: `Yes! ${word.targetDefinition} Great thinking!`,
    };
  }

  return {
    correct: false,
    reason: `That's a good try! Think a little more about what "${word.word}" means. Let's try again.`,
  };
}
