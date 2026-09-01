import type { GradeAttempt } from "@/lib/grade/shared";
import { MAX_ATTEMPTS, STORY_START_ID } from "@/lib/story-data";
import type { ChallengePhase, EndingBeatView } from "@/lib/story/types";

export const ENDING_PAGE_IDS = ["page-7a", "page-7b"] as const;

export type EndingPageId = (typeof ENDING_PAGE_IDS)[number];

export const BRANCH_PAGE_ID = "page-5";

const PATH_PAGE_IDS = ["page-6a", "page-6b"] as const;

const PATH_SPECIFIC_WORD_IDS = ["camouflage", "nocturnal"] as const;
const PATH_SPECIFIC_COMPREHENSION_IDS = [
  "tracks-choice-outcome",
  "guide-choice-outcome",
] as const;

function withoutPathSpecificProgress(state: StorySessionState): Pick<
  StorySessionState,
  "resolvedWordIds" | "resolvedComprehensionIds"
> {
  return {
    resolvedWordIds: state.resolvedWordIds.filter(
      (id) =>
        !PATH_SPECIFIC_WORD_IDS.includes(
          id as (typeof PATH_SPECIFIC_WORD_IDS)[number],
        ),
    ),
    resolvedComprehensionIds: state.resolvedComprehensionIds.filter(
      (id) =>
        !PATH_SPECIFIC_COMPREHENSION_IDS.includes(
          id as (typeof PATH_SPECIFIC_COMPREHENSION_IDS)[number],
        ),
    ),
  };
}

export const ENDING_MYSTERY_WORD: Record<EndingPageId, string> = {
  "page-7a": "camouflage",
  "page-7b": "nocturnal",
};

export const DEFAULT_LEARNED_WORD_IDS: Record<EndingPageId, string[]> = {
  "page-7a": ["canopy", "cautious", "camouflage"],
  "page-7b": ["canopy", "cautious", "nocturnal"],
};

export type StorySessionState = {
  pageId: string;
  pageHistory: string[];
  learnedWordIds: string[];
  exploredEndingIds: string[];
  endingView: EndingBeatView;
  beatSession: number;
  resolvedWordIds: string[];
  resolvedComprehensionIds: string[];
  hasStarted: boolean;
};

export const initialStorySession: StorySessionState = {
  pageId: STORY_START_ID,
  pageHistory: [],
  learnedWordIds: [],
  exploredEndingIds: [],
  endingView: "beat",
  beatSession: 0,
  resolvedWordIds: [],
  resolvedComprehensionIds: [],
  hasStarted: false,
};

export type StorySessionAction =
  | { type: "goToPage"; pageId: string }
  | { type: "goToPreviousPage" }
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
  | { type: "readAgain" }
  | { type: "startReading" }
  | { type: "jumpToBranch" };

function appendUnique(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

export function storySessionReducer(
  state: StorySessionState,
  action: StorySessionAction,
): StorySessionState {
  switch (action.type) {
    case "goToPage": {
      const leavingBranchForPath =
        state.pageId === BRANCH_PAGE_ID &&
        PATH_PAGE_IDS.includes(
          action.pageId as (typeof PATH_PAGE_IDS)[number],
        );
      return {
        ...state,
        ...(leavingBranchForPath
          ? withoutPathSpecificProgress(state)
          : {}),
        pageHistory: [...state.pageHistory, state.pageId],
        pageId: action.pageId,
      };
    }
    case "goToPreviousPage": {
      if (state.pageHistory.length === 0) return state;
      const pageHistory = state.pageHistory.slice(0, -1);
      const pageId = state.pageHistory[state.pageHistory.length - 1]!;
      return { ...state, pageId, pageHistory };
    }
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
        pageHistory: [],
        learnedWordIds: action.learnedWordIds,
        exploredEndingIds: action.exploredEndingIds,
        resolvedWordIds: [ENDING_MYSTERY_WORD[action.pageId]],
        resolvedComprehensionIds: [
          "track-clues",
          "tracks-choice-outcome",
          "guide-choice-outcome",
        ],
        endingView: action.endingView,
        beatSession: state.beatSession + 1,
      };
    case "readAgain":
      return {
        ...initialStorySession,
        hasStarted: true,
        beatSession: state.beatSession + 1,
      };
    case "startReading":
      return { ...state, hasStarted: true };
    case "jumpToBranch":
      return {
        ...state,
        pageId: BRANCH_PAGE_ID,
        pageHistory: [],
        endingView: "beat",
        ...withoutPathSpecificProgress(state),
        beatSession: state.beatSession + 1,
      };
  }
}

export type ChallengeKind = "vocab" | "comprehension";

export type ChallengeProgress = {
  phase: ChallengePhase;
  explanation: string;
  attempts: number;
  priorAttempts: GradeAttempt[];
  missReason: string | null;
  hintText: string | null;
  acceptedReason: string | null;
};

export type ChallengeUiState = ChallengeProgress & {
  kind: ChallengeKind | null;
  id: string | null;
  progressById: Record<string, ChallengeProgress>;
};

function defaultChallengeProgress(): ChallengeProgress {
  return {
    phase: "prompt",
    explanation: "",
    attempts: 0,
    priorAttempts: [],
    missReason: null,
    hintText: null,
    acceptedReason: null,
  };
}

function snapshotProgress({
  phase,
  explanation,
  attempts,
  priorAttempts,
  missReason,
  hintText,
  acceptedReason,
}: ChallengeUiState): ChallengeProgress {
  return {
    phase,
    explanation,
    attempts,
    priorAttempts,
    missReason,
    hintText,
    acceptedReason,
  };
}

function closedChallengeUi(
  progressById: Record<string, ChallengeProgress>,
): ChallengeUiState {
  return {
    ...initialChallengeUi,
    progressById,
  };
}

function saveProgressForId(
  state: ChallengeUiState,
  id: string,
): Record<string, ChallengeProgress> {
  return {
    ...state.progressById,
    [id]: snapshotProgress(state),
  };
}

export const initialChallengeUi: ChallengeUiState = {
  ...defaultChallengeProgress(),
  kind: null,
  id: null,
  progressById: {},
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
    case "open": {
      let progressById = state.progressById;
      if (state.id) {
        progressById = saveProgressForId(state, state.id);
      }
      const saved = progressById[action.id] ?? defaultChallengeProgress();
      return {
        ...saved,
        kind: action.kind,
        id: action.id,
        progressById,
      };
    }
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
    case "close": {
      if (!state.id) {
        return closedChallengeUi(state.progressById);
      }
      return closedChallengeUi(saveProgressForId(state, state.id));
    }
  }
}

export function endingsExploredCount(exploredEndingIds: string[]): number {
  return ENDING_PAGE_IDS.filter((id) => exploredEndingIds.includes(id)).length;
}
