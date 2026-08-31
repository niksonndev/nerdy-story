"use client";

import { useEffect, useReducer, useRef } from "react";

import type { StoryPageViewHandle } from "@/components/story/StoryPageView";
import {
  fallbackHintFor,
  requestComprehensionGrade,
  requestVocabGrade,
} from "@/lib/grade/client";
import type { GradeResult } from "@/lib/grade/shared";
import { mysteryWordIdsFor } from "@/lib/story/page-helpers";
import {
  DEFAULT_LEARNED_WORD_IDS,
  type EndingPageId,
  challengeUiReducer,
  endingsExploredCount,
  initialChallengeUi,
  initialStorySession,
  storySessionReducer,
} from "@/lib/story/reader-state";
import type { EndingBeatView } from "@/lib/story/types";
import {
  MAX_ATTEMPTS,
  comprehensionChallenges,
  mysteryWords,
  storyPagesById,
  type ComprehensionChallenge,
  type MysteryWord,
} from "@/lib/story-data";

type DebugShowEndingBeatOptions = {
  pageId?: EndingPageId;
  learnedWordIds?: string[];
  exploredEndingIds?: string[];
  endingView?: EndingBeatView;
};

declare global {
  interface Window {
    __debugShowEndingBeat?: (options?: DebugShowEndingBeatOptions) => void;
  }
}

export function useStoryReader() {
  const pageViewRef = useRef<StoryPageViewHandle>(null);
  const pendingAdvanceId = useRef<string | null>(null);

  const [session, dispatchSession] = useReducer(
    storySessionReducer,
    initialStorySession,
  );
  const [challenge, dispatchChallenge] = useReducer(
    challengeUiReducer,
    initialChallengeUi,
  );

  const {
    pageId,
    pageHistory,
    learnedWordIds,
    exploredEndingIds,
    endingView,
    beatSession,
    resolvedWordIds,
    resolvedComprehensionIds,
  } = session;

  const {
    kind: challengeKind,
    id: challengeId,
    phase,
    explanation,
    attempts,
    priorAttempts,
    missReason,
    hintText,
    acceptedReason,
  } = challenge;

  const page = storyPagesById[pageId];
  const isLastPage = !page.nextPageId && !page.choice;
  const pageWordIds = mysteryWordIdsFor(page);
  const canAdvance = pageWordIds.every((id) => resolvedWordIds.includes(id));
  const activeWordId = challengeKind === "vocab" ? challengeId : null;
  const activeComprehensionId =
    challengeKind === "comprehension" ? challengeId : null;
  const canGoBack =
    pageHistory.length > 0 &&
    activeWordId === null &&
    activeComprehensionId === null;
  const showEndingBeat =
    isLastPage &&
    canAdvance &&
    activeWordId === null &&
    activeComprehensionId === null;

  const wordsLearned = learnedWordIds.length;
  const activeWord: MysteryWord | null = activeWordId
    ? mysteryWords[activeWordId]
    : null;
  const activeChallenge: ComprehensionChallenge | null = activeComprehensionId
    ? comprehensionChallenges[activeComprehensionId]
    : null;
  const learnedWords = learnedWordIds.map(
    (wordId) => mysteryWords[wordId]?.word ?? wordId,
  );

  function openVocabChallenge(wordId: string) {
    if (resolvedWordIds.includes(wordId)) return;
    dispatchChallenge({ type: "open", kind: "vocab", id: wordId });
  }

  function openComprehensionChallenge(challengeId: string) {
    if (resolvedComprehensionIds.includes(challengeId)) return;
    dispatchChallenge({ type: "open", kind: "comprehension", id: challengeId });
  }

  function recordFailedAttempt(
    submitted: string,
    reason: string,
    hint: string | null,
    nextAttempts: number,
  ) {
    dispatchChallenge({
      type: "recordFailedAttempt",
      submitted,
      reason,
      hint,
      nextAttempts,
    });

    if (nextAttempts >= MAX_ATTEMPTS && challengeId) {
      if (challengeKind === "vocab") {
        dispatchSession({ type: "resolveWord", wordId: challengeId });
      } else if (challengeKind === "comprehension") {
        dispatchSession({
          type: "resolveComprehension",
          challengeId,
        });
      }
    }
  }

  async function handleVocabCheck() {
    if (!activeWordId || explanation.trim().length === 0) return;
    dispatchChallenge({ type: "setWaiting" });

    const submittedExplanation = explanation.trim();
    let result: GradeResult;
    try {
      result = await requestVocabGrade(
        activeWordId,
        submittedExplanation,
        priorAttempts,
      );
    } catch {
      const nextAttempts = attempts + 1;
      const hint = fallbackHintFor(
        activeWord?.hints ?? [],
        nextAttempts - 1,
      );
      recordFailedAttempt(
        submittedExplanation,
        "Not quite — try another way.",
        hint,
        nextAttempts,
      );
      return;
    }

    if (result.correct) {
      dispatchSession({ type: "acceptWord", wordId: activeWordId });
      dispatchChallenge({ type: "accepted", reason: result.reason });
      return;
    }

    recordFailedAttempt(
      submittedExplanation,
      result.reason,
      result.hint,
      attempts + 1,
    );
  }

  async function handleComprehensionCheck() {
    if (!activeComprehensionId || explanation.trim().length === 0) return;
    dispatchChallenge({ type: "setWaiting" });

    const submittedAnswer = explanation.trim();
    let result: GradeResult;
    try {
      result = await requestComprehensionGrade(
        activeComprehensionId,
        submittedAnswer,
        priorAttempts,
      );
    } catch {
      const nextAttempts = attempts + 1;
      const hint = fallbackHintFor(
        activeChallenge?.hints ?? [],
        nextAttempts - 1,
      );
      recordFailedAttempt(
        submittedAnswer,
        "Not quite — try another way.",
        hint,
        nextAttempts,
      );
      return;
    }

    if (result.correct) {
      dispatchSession({
        type: "resolveComprehension",
        challengeId: activeComprehensionId,
      });
      dispatchChallenge({ type: "accepted", reason: result.reason });
      return;
    }

    recordFailedAttempt(
      submittedAnswer,
      result.reason,
      result.hint,
      attempts + 1,
    );
  }

  function closeVocabChallenge() {
    dispatchChallenge({ type: "close" });
    if (isLastPage && canAdvance) {
      dispatchSession({ type: "recordEndingExplored", pageId });
    }
  }

  function closeComprehensionChallenge() {
    pendingAdvanceId.current = null;
    dispatchChallenge({ type: "close" });
  }

  function continueComprehension() {
    const nextPageId = pendingAdvanceId.current;
    pendingAdvanceId.current = null;
    dispatchChallenge({ type: "close" });
    if (nextPageId) {
      pageViewRef.current?.advanceTo(nextPageId);
    }
  }

  function goToPage(nextPageId: string) {
    if (!canAdvance || !storyPagesById[nextPageId]) return;
    dispatchSession({ type: "goToPage", pageId: nextPageId });
  }

  function goToPreviousPage() {
    if (!canGoBack) return;
    pendingAdvanceId.current = null;
    dispatchSession({ type: "goToPreviousPage" });
  }

  function handleBeforeNextPage(nextPageId: string): boolean {
    const comprehensionId = page.comprehensionId;
    if (
      comprehensionId &&
      !resolvedComprehensionIds.includes(comprehensionId)
    ) {
      pendingAdvanceId.current = nextPageId;
      openComprehensionChallenge(comprehensionId);
      return false;
    }
    return true;
  }

  function handleReadAgain() {
    pendingAdvanceId.current = null;
    dispatchSession({ type: "readAgain" });
    dispatchChallenge({ type: "reset" });
  }

  function handleDiscoverAlternateEnding() {
    pendingAdvanceId.current = null;
    dispatchSession({ type: "jumpToBranch" });
    dispatchChallenge({ type: "reset" });
  }

  function handleReadChapter2() {
    dispatchSession({ type: "setEndingView", view: "chapter2" });
  }

  function setExplanation(value: string) {
    dispatchChallenge({ type: "setExplanation", explanation: value });
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    window.__debugShowEndingBeat = (options = {}) => {
      const debugPageId = options.pageId ?? "page-7a";
      const debugLearnedWordIds =
        options.learnedWordIds ?? DEFAULT_LEARNED_WORD_IDS[debugPageId];

      pendingAdvanceId.current = null;
      dispatchSession({
        type: "debugShowEndingBeat",
        pageId: debugPageId,
        learnedWordIds: debugLearnedWordIds,
        exploredEndingIds: options.exploredEndingIds ?? [debugPageId],
        endingView: options.endingView ?? "beat",
      });
      dispatchChallenge({ type: "reset" });

      console.info(
        "[nerdy-story] Ending beat shown.",
        "Try: __debugShowEndingBeat({ exploredEndingIds: ['page-7a','page-7b'] })",
        "or: __debugShowEndingBeat({ endingView: 'chapter2' })",
      );
    };

    console.info(
      "[nerdy-story] Dev hook ready: __debugShowEndingBeat()",
    );

    return () => {
      delete window.__debugShowEndingBeat;
    };
  }, []);

  return {
    pageViewRef,
    page,
    pageId,
    beatSession,
    wordsLearned,
    learnedWords,
    learnedWordIds,
    resolvedWordIds,
    canAdvance,
    canGoBack,
    isLastPage,
    showEndingBeat,
    endingsExplored: endingsExploredCount(exploredEndingIds),
    exploredEndingIds,
    endingView,
    activeWordId,
    activeComprehensionId,
    activeWord,
    activeChallenge,
    phase,
    explanation,
    missReason,
    hintText,
    acceptedReason,
    openVocabChallenge,
    goToPage,
    goToPreviousPage,
    handleBeforeNextPage,
    handleVocabCheck,
    handleComprehensionCheck,
    closeVocabChallenge,
    closeComprehensionChallenge,
    continueComprehension,
    handleReadAgain,
    handleDiscoverAlternateEnding,
    handleReadChapter2,
    setExplanation,
  };
}
