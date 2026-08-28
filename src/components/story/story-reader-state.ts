import type { EndingBeatView } from "@/components/story/EndingBeat";
import type { ChallengePhase } from "@/components/story/VocabChallengeOverlay";
import type { GradeAttempt } from "@/lib/grade/shared";
import { MAX_ATTEMPTS, STORY_START_ID } from "@/lib/story-data";

export const ENDING_PAGE_IDS = ["page-7a", "page-7b"] as const;

export type EndingPageId = (typeof ENDING_PAGE_IDS)[number];

export const ENDING_MYSTERY_WORD: Record<EndingPageId, string> = {
  "page-7a": "lullaby",
  "page-7b": "shimmered",
};

export const DEFAULT_LEARNED_WORD_IDS: Record<EndingPageId, string[]> = {
  "page-7a": ["shelter", "snug", "lullaby"],
  "page-7b": ["shelter", "snug", "shimmered"],
};

export type StorySessionState = {
  pageId: string;
  learnedWordIds: string[];
  exploredEndingIds: string[];
  endingView: EndingBeatView;
  beatSession: number;
  resolvedWordIds: string[];
  resolvedComprehensionIds: string[];
};

export const initialStorySession: StorySessionState = {
  pageId: STORY_START_ID,
  learnedWordIds: [],
  exploredEndingIds: [],
  endingView: "beat",
  beatSession: 0,
  resolvedWordIds: [],
  resolvedComprehensionIds: [],
};

export type StorySessionAction =
  | { type: "goToPage"; pageId: string }
  | { type: "resolveWord"; wordId: string }
  | { type: "acceptWord"; wordId: string }
  | { type: "resolveComprehension"; challengeId: string }
  | { type: "recordEndingExplored"; pageId: string }
  | { type: "setEndingView"; view: EndingBeatView }
  | {
      type: "debugShowEndingBeat";
      pageId: EndingPageId;
      learnedWordIds: string[];
      exploredEndingIds: string[];
      endingView: EndingBeatView;
    }
  | { type: "readAgain" };

function appendUnique(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

export function storySessionReducer(
  state: StorySessionState,
  action: StorySessionAction,
): StorySessionState {
  switch (action.type) {
    case "goToPage":
      return { ...state, pageId: action.pageId };
    case "resolveWord":
      return {
        ...state,
        resolvedWordIds: appendUnique(state.resolvedWordIds, action.wordId),
      };
    case "acceptWord":
      return {
        ...state,
        resolvedWordIds: appendUnique(state.resolvedWordIds, action.wordId),
        learnedWordIds: appendUnique(state.learnedWordIds, action.wordId),
      };
    case "resolveComprehension":
      return {
        ...state,
        resolvedComprehensionIds: appendUnique(
          state.resolvedComprehensionIds,
          action.challengeId,
        ),
      };
    case "recordEndingExplored":
      if (
        !ENDING_PAGE_IDS.includes(action.pageId as EndingPageId)
      ) {
        return state;
      }
      return {
        ...state,
        exploredEndingIds: appendUnique(
          state.exploredEndingIds,
          action.pageId,
        ),
        endingView: "beat",
      };
    case "setEndingView":
      return { ...state, endingView: action.view };
    case "debugShowEndingBeat":
      return {
        ...state,
        pageId: action.pageId,
        learnedWordIds: action.learnedWordIds,
        exploredEndingIds: action.exploredEndingIds,
        resolvedWordIds: [ENDING_MYSTERY_WORD[action.pageId]],
        resolvedComprehensionIds: [
          "find-shelter",
          "cozy-nap",
          "rainy-surprise",
        ],
        endingView: action.endingView,
        beatSession: state.beatSession + 1,
      };
    case "readAgain":
      return {
        ...initialStorySession,
        beatSession: state.beatSession + 1,
      };
  }
}

export type ChallengeKind = "vocab" | "comprehension";

export type ChallengeUiState = {
  kind: ChallengeKind | null;
  id: string | null;
  phase: ChallengePhase;
  explanation: string;
  attempts: number;
  priorAttempts: GradeAttempt[];
  missReason: string | null;
  hintText: string | null;
  acceptedReason: string | null;
};

export const initialChallengeUi: ChallengeUiState = {
  kind: null,
  id: null,
  phase: "prompt",
  explanation: "",
  attempts: 0,
  priorAttempts: [],
  missReason: null,
  hintText: null,
  acceptedReason: null,
};

export type ChallengeUiAction =
  | { type: "reset" }
  | { type: "open"; kind: ChallengeKind; id: string }
  | { type: "setExplanation"; explanation: string }
  | { type: "setWaiting" }
  | {
      type: "recordFailedAttempt";
      submitted: string;
      reason: string;
      hint: string | null;
      nextAttempts: number;
    }
  | { type: "accepted"; reason: string }
  | { type: "reveal" }
  | { type: "close" };

export function challengeUiReducer(
  state: ChallengeUiState,
  action: ChallengeUiAction,
): ChallengeUiState {
  switch (action.type) {
    case "reset":
      return initialChallengeUi;
    case "open":
      return { ...initialChallengeUi, kind: action.kind, id: action.id };
    case "setExplanation":
      return { ...state, explanation: action.explanation };
    case "setWaiting":
      return { ...state, phase: "waiting" };
    case "recordFailedAttempt": {
      const priorAttempts = [
        ...state.priorAttempts,
        {
          explanation: action.submitted,
          reason: action.reason,
          hint: action.hint,
        },
      ];
      if (action.nextAttempts >= MAX_ATTEMPTS) {
        return {
          ...state,
          priorAttempts,
          attempts: action.nextAttempts,
          phase: "reveal",
        };
      }
      return {
        ...state,
        priorAttempts,
        attempts: action.nextAttempts,
        missReason: action.reason,
        hintText: action.hint,
        explanation: "",
        phase: "prompt",
      };
    }
    case "accepted":
      return {
        ...state,
        acceptedReason: action.reason,
        hintText: null,
        phase: "accepted",
      };
    case "reveal":
      return { ...state, phase: "reveal" };
    case "close":
      return initialChallengeUi;
  }
}

export function endingsExploredCount(exploredEndingIds: string[]): number {
  return ENDING_PAGE_IDS.filter((id) => exploredEndingIds.includes(id)).length;
}
