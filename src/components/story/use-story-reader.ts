"use client";

import { useReducer, useRef } from "react";

import type { StoryPageViewHandle } from "@/components/story/StoryPageView";
import { requestComprehensionGrade, requestVocabularyGrade } from "@/lib/grade/client";
import { CHILD_ANSWER_MAX_LENGTH } from "@/lib/grade/child-input";
import { hintForAttempt } from "@/lib/grade/local-helpers";
import type { GradeResult } from "@/lib/grade/shared";
import {
  playCorrectSfx,
  playStoryCompleteSfx,
} from "@/lib/speech/play-sfx";
import { mysteryWordIdsFor } from "@/lib/story/page-helpers";
import {
  BRANCH_PAGE_ID,
  challengeProgressFor,
  challengeUiReducer,
  initialChallengeUi,
  initialStorySession,
  isPathPageId,
  storySessionReducer,
} from "@/lib/story/reader-state";
import {
  MAX_ATTEMPTS,
  comprehensionChallenges,
  mysteryWords,
  storyPagesById,
} from "@/lib/story/story-data";

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
    beatSession,
    resolvedWordIds,
    resolvedComprehensionIds,
    hasStarted,
  } = session;

  const progress = challengeProgressFor(challenge);
  const {
    phase,
    childAnswer,
    priorAttempts,
    missReason,
    hintText,
    acceptedReason,
  } = progress;

  const page = storyPagesById[pageId];
  const isLastPage = !page.nextPageId && !page.choice;
  const pageWordIds = mysteryWordIdsFor(page);
  const canAdvance = pageWordIds.every((id) => resolvedWordIds.includes(id));
  const challengeKind = challenge.open?.kind ?? null;
  const challengeId = challenge.open?.id ?? null;
  const overlayWord =
    challengeKind === "vocabulary" && challengeId
      ? (mysteryWords[challengeId] ?? null)
      : null;
  const overlayComprehension =
    challengeKind === "comprehension" && challengeId
      ? (comprehensionChallenges[challengeId] ?? null)
      : null;
  const canGoBack =
    pageHistory.length > 0 && challenge.open === null;
  const showEndingBeat = isLastPage && canAdvance && challenge.open === null;

  function openVocabularyChallenge(wordId: string) {
    if (resolvedWordIds.includes(wordId)) return;
    dispatchChallenge({ type: "open", kind: "vocabulary", id: wordId });
  }

  function openComprehensionChallenge(challengeId: string) {
    if (resolvedComprehensionIds.includes(challengeId)) return;
    dispatchChallenge({ type: "open", kind: "comprehension", id: challengeId });
  }

  function recordFailedAttempt(
    submitted: string,
    reason: string,
    hint: string | null,
  ) {
    const nextCount = priorAttempts.length + 1;
    dispatchChallenge({
      type: "recordFailedAttempt",
      submitted,
      reason,
      hint,
    });

    if (nextCount >= MAX_ATTEMPTS && challengeId) {
      if (challengeKind === "vocabulary") {
        dispatchSession({ type: "resolveWord", wordId: challengeId });
      } else if (challengeKind === "comprehension") {
        dispatchSession({
          type: "resolveComprehension",
          challengeId,
        });
      }
    }
  }

  async function submitGrade(options: {
    id: string | null;
    hints: string[];
    requestGrade: (
      id: string,
      childAnswer: string,
    ) => Promise<GradeResult>;
    onCorrect: (id: string) => void;
  }) {
    if (!options.id || childAnswer.trim().length === 0) return;
    dispatchChallenge({ type: "setWaiting" });

    const submittedChildAnswer = childAnswer
      .trim()
      .slice(0, CHILD_ANSWER_MAX_LENGTH);
    let result: GradeResult;
    try {
      result = await options.requestGrade(options.id, submittedChildAnswer);
    } catch {
      recordFailedAttempt(
        submittedChildAnswer,
        "Not quite — try another way.",
        hintForAttempt(options.hints, priorAttempts.length),
      );
      return;
    }

    if (result.correct) {
      playCorrectSfx();
      options.onCorrect(options.id);
      dispatchChallenge({ type: "accepted", reason: result.reason });
      return;
    }

    recordFailedAttempt(
      submittedChildAnswer,
      result.reason,
      result.hint,
    );
  }

  async function handleVocabularyCheck() {
    await submitGrade({
      id: overlayWord?.id ?? null,
      hints: overlayWord?.hints ?? [],
      requestGrade: (id, answer) =>
        requestVocabularyGrade(id, answer, priorAttempts),
      onCorrect: (id) =>
        dispatchSession({ type: "acceptWord", wordId: id }),
    });
  }

  async function handleComprehensionCheck() {
    await submitGrade({
      id: overlayComprehension?.id ?? null,
      hints: overlayComprehension?.hints ?? [],
      requestGrade: (id, answer) =>
        requestComprehensionGrade(id, answer, priorAttempts),
      onCorrect: (id) =>
        dispatchSession({
          type: "resolveComprehension",
          challengeId: id,
        }),
    });
  }

  function closeVocabularyChallenge() {
    dispatchChallenge({ type: "close" });
    if (isLastPage && canAdvance) {
      playStoryCompleteSfx();
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
    if (pageId === BRANCH_PAGE_ID && isPathPageId(nextPageId)) {
      dispatchChallenge({ type: "clearPathSpecific" });
    }
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

  function handleStartReading() {
    dispatchSession({ type: "startReading" });
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

  function setChildAnswer(value: string) {
    dispatchChallenge({ type: "setChildAnswer", childAnswer: value });
  }

  return {
    pageViewRef,
    page,
    pageId,
    pageHistory,
    beatSession,
    learnedWordIds,
    resolvedWordIds,
    resolvedComprehensionIds,
    canAdvance,
    canGoBack,
    isLastPage,
    showEndingBeat,
    exploredEndingIds,
    hasStarted,
    overlay: {
      kind: challengeKind,
      word: overlayWord,
      comprehension: overlayComprehension,
      phase,
      childAnswer,
      missReason,
      hintText,
      acceptedReason,
    },
    openVocabularyChallenge,
    goToPage,
    goToPreviousPage,
    handleBeforeNextPage,
    handleVocabularyCheck,
    handleComprehensionCheck,
    closeVocabularyChallenge,
    closeComprehensionChallenge,
    continueComprehension,
    handleReadAgain,
    handleDiscoverAlternateEnding,
    handleStartReading,
    setChildAnswer,
  };
}
