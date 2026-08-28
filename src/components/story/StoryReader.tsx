"use client";

import { useEffect, useReducer, useRef } from "react";

import { ComprehensionChallengeOverlay } from "@/components/story/ComprehensionChallengeOverlay";
import {
  EndingBeat,
  type EndingBeatView,
} from "@/components/story/EndingBeat";
import {
  StoryPageView,
  type StoryPageViewHandle,
} from "@/components/story/StoryPageView";
import {
  DEFAULT_LEARNED_WORD_IDS,
  type EndingPageId,
  challengeUiReducer,
  endingsExploredCount,
  initialChallengeUi,
  initialStorySession,
  storySessionReducer,
} from "@/components/story/story-reader-state";
import { VocabChallengeOverlay } from "@/components/story/VocabChallengeOverlay";
import type { GradeAttempt, GradeResult } from "@/lib/grade/shared";
import {
  MAX_ATTEMPTS,
  comprehensionChallenges,
  mysteryWords,
  storyPagesById,
  type ComprehensionChallenge,
  type MysteryWord,
  type StoryPage,
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

function mysteryWordIdsFor(page: StoryPage): string[] {
  return page.segments
    .filter((segment) => segment.type === "mystery")
    .map((segment) => segment.wordId);
}

function fallbackHintFor(
  hints: string[],
  attemptIndex: number,
): string | null {
  if (hints.length === 0) return null;
  return hints[Math.min(attemptIndex, hints.length - 1)] ?? null;
}

class GradeRequestError extends Error {
  constructor() {
    super("Grade request failed");
    this.name = "GradeRequestError";
  }
}

async function requestVocabGrade(
  wordId: string,
  explanation: string,
  priorAttempts: GradeAttempt[],
): Promise<GradeResult> {
  const response = await fetch("/api/grade-vocabulary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordId, explanation, priorAttempts }),
  });
  if (!response.ok) {
    throw new GradeRequestError();
  }
  return (await response.json()) as GradeResult;
}

async function requestComprehensionGrade(
  challengeId: string,
  answer: string,
  priorAttempts: GradeAttempt[],
): Promise<GradeResult> {
  const response = await fetch("/api/grade-comprehension", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId, answer, priorAttempts }),
  });
  if (!response.ok) {
    throw new GradeRequestError();
  }
  return (await response.json()) as GradeResult;
}

export function StoryReader() {
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

  function handleReadChapter2() {
    dispatchSession({ type: "setEndingView", view: "chapter2" });
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

  return (
    <div className="flex flex-1 flex-col">
      {showEndingBeat ? (
        <EndingBeat
          key={`${pageId}-${beatSession}`}
          wordsLearned={wordsLearned}
          learnedWords={learnedWords}
          endingsExplored={endingsExploredCount(exploredEndingIds)}
          view={endingView}
          onReadAgain={handleReadAgain}
          onReadChapter2={handleReadChapter2}
        />
      ) : (
        <>
          <StoryPageView
            ref={pageViewRef}
            page={page}
            wordsLearned={wordsLearned}
            resolvedWordIds={resolvedWordIds}
            canAdvance={canAdvance}
            isLastPage={isLastPage}
            onMysteryClick={openVocabChallenge}
            onChoosePath={goToPage}
            onBeforeNextPage={handleBeforeNextPage}
          />

          <VocabChallengeOverlay
            open={activeWordId !== null}
            word={activeWord}
            phase={phase}
            value={explanation}
            missReason={missReason}
            hintText={hintText}
            acceptedReason={acceptedReason}
            onChange={(value) =>
              dispatchChallenge({ type: "setExplanation", explanation: value })
            }
            onCheck={handleVocabCheck}
            onClose={closeVocabChallenge}
          />

          <ComprehensionChallengeOverlay
            open={activeComprehensionId !== null}
            challenge={activeChallenge}
            phase={phase}
            value={explanation}
            missReason={missReason}
            hintText={hintText}
            acceptedReason={acceptedReason}
            onChange={(value) =>
              dispatchChallenge({ type: "setExplanation", explanation: value })
            }
            onCheck={handleComprehensionCheck}
            onContinue={continueComprehension}
            onClose={closeComprehensionChallenge}
          />
        </>
      )}
    </div>
  );
}
