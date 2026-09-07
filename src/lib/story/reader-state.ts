import type { GradeAttempt } from "@/lib/grade/shared";
import {
  BRANCH_PAGE_ID,
  ENDING_PAGE_IDS,
  MAX_ATTEMPTS,
  PATH_SPECIFIC_CHALLENGE_IDS,
  PATH_SPECIFIC_COMPREHENSION_IDS,
  PATH_SPECIFIC_WORD_IDS,
  STORY_START_ID,
  isPathPageId,
} from "@/lib/story/story-data";

export type ChallengePhase = "prompt" | "waiting" | "accepted" | "reveal";

const ENDING_PAGE_ID_SET = new Set(ENDING_PAGE_IDS);

function withoutPathSpecificProgress(state: StorySessionState): Pick<
  StorySessionState,
  "resolvedWordIds" | "resolvedComprehensionIds"
> {
  return {
    resolvedWordIds: state.resolvedWordIds.filter(
      (id) => !PATH_SPECIFIC_WORD_IDS.has(id),
    ),
    resolvedComprehensionIds: state.resolvedComprehensionIds.filter(
      (id) => !PATH_SPECIFIC_COMPREHENSION_IDS.has(id),
    ),
  };
}

export type StorySessionState = {
  pageId: string;
  pageHistory: string[];
  learnedWordIds: string[];
  exploredEndingIds: string[];
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
        state.pageId === BRANCH_PAGE_ID && isPathPageId(action.pageId);
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
      if (!ENDING_PAGE_ID_SET.has(action.pageId)) {
        return state;
      }
      return {
        ...state,
        exploredEndingIds: appendUnique(
          state.exploredEndingIds,
          action.pageId,
        ),
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
        ...withoutPathSpecificProgress(state),
        beatSession: state.beatSession + 1,
      };
  }
}

export type ChallengeKind = "vocabulary" | "comprehension";

export type OpenChallenge = {
  kind: ChallengeKind;
  id: string;
};

export type ChallengeProgress = {
  phase: ChallengePhase;
  childAnswer: string;
  priorAttempts: GradeAttempt[];
  acceptedReason: string | null;
};

export type ChallengeProgressView = ChallengeProgress & {
  missReason: string | null;
  hintText: string | null;
};

export type ChallengeUiState = {
  open: OpenChallenge | null;
  progressById: Record<string, ChallengeProgress>;
};

function defaultChallengeProgress(): ChallengeProgress {
  return {
    phase: "prompt",
    childAnswer: "",
    priorAttempts: [],
    acceptedReason: null,
  };
}

function storedProgressFor(
  state: ChallengeUiState,
  id: string,
): ChallengeProgress {
  return state.progressById[id] ?? defaultChallengeProgress();
}

function missFeedbackFor(progress: ChallengeProgress): {
  missReason: string | null;
  hintText: string | null;
} {
  if (progress.phase !== "prompt") {
    return { missReason: null, hintText: null };
  }
  const last = progress.priorAttempts.at(-1);
  if (!last) return { missReason: null, hintText: null };
  return { missReason: last.reason, hintText: last.hint };
}

export function challengeProgressFor(
  state: ChallengeUiState,
  id: string | null = state.open?.id ?? null,
): ChallengeProgressView {
  if (!id) {
    return { ...defaultChallengeProgress(), missReason: null, hintText: null };
  }
  const progress = storedProgressFor(state, id);
  return { ...progress, ...missFeedbackFor(progress) };
}

function patchCurrent(
  state: ChallengeUiState,
  next: ChallengeProgress | ((current: ChallengeProgress) => ChallengeProgress),
): ChallengeUiState {
  if (!state.open) return state;
  const current = storedProgressFor(state, state.open.id);
  const progress = typeof next === "function" ? next(current) : next;
  return {
    ...state,
    progressById: { ...state.progressById, [state.open.id]: progress },
  };
}

export const initialChallengeUi: ChallengeUiState = {
  open: null,
  progressById: {},
};

export type ChallengeUiAction =
  | { type: "reset" }
  | { type: "open"; kind: ChallengeKind; id: string }
  | { type: "setChildAnswer"; childAnswer: string }
  | { type: "setWaiting" }
  | {
      type: "recordFailedAttempt";
      submitted: string;
      reason: string;
      hint: string | null;
    }
  | { type: "accepted"; reason: string }
  | { type: "close" }
  | { type: "clearPathSpecific" };

export function challengeUiReducer(
  state: ChallengeUiState,
  action: ChallengeUiAction,
): ChallengeUiState {
  switch (action.type) {
    case "reset":
      return initialChallengeUi;
    case "open": {
      return {
        open: { kind: action.kind, id: action.id },
        progressById: {
          ...state.progressById,
          [action.id]:
            state.progressById[action.id] ?? defaultChallengeProgress(),
        },
      };
    }
    case "setChildAnswer":
      return patchCurrent(state, (current) => ({
        ...current,
        childAnswer: action.childAnswer,
      }));
    case "setWaiting":
      return patchCurrent(state, (current) => ({
        ...current,
        phase: "waiting",
      }));
    case "recordFailedAttempt":
      return patchCurrent(state, (current) => {
        const priorAttempts = [
          ...current.priorAttempts,
          {
            childAnswer: action.submitted,
            reason: action.reason,
            hint: action.hint,
          },
        ];
        if (priorAttempts.length >= MAX_ATTEMPTS) {
          return {
            ...current,
            priorAttempts,
            phase: "reveal",
          };
        }
        return {
          ...current,
          priorAttempts,
          childAnswer: "",
          phase: "prompt",
        };
      });
    case "accepted":
      return patchCurrent(state, (current) => ({
        ...current,
        acceptedReason: action.reason,
        phase: "accepted",
      }));
    case "close":
      return { open: null, progressById: state.progressById };
    case "clearPathSpecific": {
      const progressById = { ...state.progressById };
      for (const id of PATH_SPECIFIC_CHALLENGE_IDS) {
        delete progressById[id];
      }
      const stillOpen =
        state.open !== null &&
        !PATH_SPECIFIC_CHALLENGE_IDS.has(state.open.id);
      return {
        open: stillOpen ? state.open : null,
        progressById,
      };
    }
  }
}
