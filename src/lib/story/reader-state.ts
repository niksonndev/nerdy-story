import type { GradeAttempt } from "@/lib/grade/shared";
import { MAX_ATTEMPTS, STORY_START_ID } from "@/lib/story/story-data";

export type ChallengePhase = "prompt" | "waiting" | "accepted" | "reveal";

export const ENDING_PAGE_IDS = ["page-7a", "page-7b"] as const;

export const BRANCH_PAGE_ID = "page-5";

const PATH_PAGE_IDS = ["page-6a", "page-6b"] as const;

const ENDING_PAGE_ID_SET = new Set<string>(ENDING_PAGE_IDS);
const PATH_PAGE_ID_SET = new Set<string>(PATH_PAGE_IDS);
const PATH_SPECIFIC_WORD_IDS = new Set(["camouflage", "nocturnal"]);
const PATH_SPECIFIC_COMPREHENSION_IDS = new Set([
  "tracks-choice-outcome",
  "guide-choice-outcome",
]);
const PATH_SPECIFIC_CHALLENGE_IDS = new Set([
  ...PATH_SPECIFIC_WORD_IDS,
  ...PATH_SPECIFIC_COMPREHENSION_IDS,
]);

export function isPathPageId(pageId: string): boolean {
  return PATH_PAGE_ID_SET.has(pageId);
}

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
  missReason: string | null;
  hintText: string | null;
  acceptedReason: string | null;
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
    missReason: null,
    hintText: null,
    acceptedReason: null,
  };
}

export function challengeProgressFor(
  state: ChallengeUiState,
  id: string | null = state.open?.id ?? null,
): ChallengeProgress {
  if (!id) return defaultChallengeProgress();
  return state.progressById[id] ?? defaultChallengeProgress();
}

function patchCurrent(
  state: ChallengeUiState,
  next: ChallengeProgress | ((current: ChallengeProgress) => ChallengeProgress),
): ChallengeUiState {
  if (!state.open) return state;
  const current = challengeProgressFor(state);
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
          missReason: action.reason,
          hintText: action.hint,
          childAnswer: "",
          phase: "prompt",
        };
      });
    case "accepted":
      return patchCurrent(state, (current) => ({
        ...current,
        acceptedReason: action.reason,
        hintText: null,
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
