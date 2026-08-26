"use client";

import { useState } from "react";

import { StoryPageView } from "@/components/story/StoryPageView";
import {
  VocabChallengeOverlay,
  type ChallengePhase,
} from "@/components/story/VocabChallengeOverlay";
import type { GradeResult } from "@/lib/grade";
import {
  MAX_ATTEMPTS,
  mysteryWords,
  STORY_START_ID,
  storyPagesById,
  type StoryPage,
} from "@/lib/story-data";

function mysteryWordIdsFor(page: StoryPage): string[] {
  return page.segments
    .filter((segment) => segment.type === "mystery")
    .map((segment) => segment.wordId);
}

class GradeRequestError extends Error {
  readonly retryable: boolean;

  constructor(retryable: boolean) {
    super("Grade request failed");
    this.name = "GradeRequestError";
    this.retryable = retryable;
  }
}

async function requestGrade(
  wordId: string,
  explanation: string,
): Promise<GradeResult> {
  const response = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordId, explanation }),
  });
  if (!response.ok) {
    let retryable = response.status === 503;
    try {
      const payload = (await response.json()) as { retryable?: unknown };
      if (typeof payload.retryable === "boolean") {
        retryable = payload.retryable;
      }
    } catch {
      // keep status-based default
    }
    throw new GradeRequestError(retryable);
  }
  return (await response.json()) as GradeResult;
}

export function StoryReader() {
  const [pageId, setPageId] = useState(STORY_START_ID);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [resolvedWordIds, setResolvedWordIds] = useState<string[]>([]);

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ChallengePhase>("prompt");
  const [explanation, setExplanation] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lastReason, setLastReason] = useState<string | null>(null);
  const [acceptedReason, setAcceptedReason] = useState<string | null>(null);

  const page = storyPagesById[pageId];
  const isLastPage = !page.nextPageId && !page.choice;
  const pageWordIds = mysteryWordIdsFor(page);
  const canAdvance = pageWordIds.every((id) => resolvedWordIds.includes(id));

  const activeWord = activeWordId ? mysteryWords[activeWordId] : null;
  const hintText =
    activeWord && attempts > 0
      ? activeWord.hints[Math.min(attempts - 1, activeWord.hints.length - 1)]
      : null;

  function openChallenge(wordId: string) {
    if (resolvedWordIds.includes(wordId)) return;
    setActiveWordId(wordId);
    setPhase("prompt");
    setExplanation("");
    setAttempts(0);
    setLastReason(null);
    setAcceptedReason(null);
  }

  async function handleCheck() {
    if (!activeWordId || explanation.trim().length === 0) return;
    setPhase("waiting");

    let result: GradeResult;
    try {
      result = await requestGrade(activeWordId, explanation);
    } catch (error) {
      const retryable =
        error instanceof GradeRequestError ? error.retryable : true;
      setLastReason(
        retryable
          ? "Hmm, that did not go through. Let's try again!"
          : "I could not check that answer. Try again in a moment.",
      );
      setPhase("prompt");
      return;
    }

    if (result.correct) {
      setResolvedWordIds((prev) =>
        prev.includes(activeWordId) ? prev : [...prev, activeWordId],
      );
      setWordsLearned((count) => count + 1);
      setAcceptedReason(result.reason);
      setPhase("accepted");
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (nextAttempts >= MAX_ATTEMPTS) {
      setResolvedWordIds((prev) =>
        prev.includes(activeWordId) ? prev : [...prev, activeWordId],
      );
      setPhase("reveal");
      return;
    }

    setLastReason(result.reason);
    setExplanation("");
    setPhase("prompt");
  }

  function closeChallenge() {
    setActiveWordId(null);
    setPhase("prompt");
    setExplanation("");
    setLastReason(null);
    setAcceptedReason(null);
  }

  function goToPage(nextPageId: string) {
    if (!canAdvance || !storyPagesById[nextPageId]) return;
    setPageId(nextPageId);
  }

  return (
    <div className="flex flex-1 flex-col">
      <StoryPageView
        page={page}
        wordsLearned={wordsLearned}
        resolvedWordIds={resolvedWordIds}
        canAdvance={canAdvance}
        isLastPage={isLastPage}
        onMysteryClick={openChallenge}
        onChoosePath={goToPage}
      />

      <VocabChallengeOverlay
        open={activeWordId !== null}
        word={activeWord}
        phase={phase}
        value={explanation}
        lastReason={lastReason}
        hintText={hintText}
        acceptedReason={acceptedReason}
        onChange={setExplanation}
        onCheck={handleCheck}
        onClose={closeChallenge}
      />
    </div>
  );
}
