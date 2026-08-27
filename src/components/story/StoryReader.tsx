"use client";

import { useRef, useState } from "react";

import { ComprehensionChallengeOverlay } from "@/components/story/ComprehensionChallengeOverlay";
import {
  StoryPageView,
  type StoryPageViewHandle,
} from "@/components/story/StoryPageView";
import {
  VocabChallengeOverlay,
  type ChallengePhase,
} from "@/components/story/VocabChallengeOverlay";
import type { GradeAttempt, GradeResult } from "@/lib/grade/shared";
import {
  MAX_ATTEMPTS,
  comprehensionChallenges,
  mysteryWords,
  STORY_START_ID,
  storyPagesById,
  type ComprehensionChallenge,
  type MysteryWord,
  type StoryPage,
} from "@/lib/story-data";

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

  const [pageId, setPageId] = useState(STORY_START_ID);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [resolvedWordIds, setResolvedWordIds] = useState<string[]>([]);
  const [resolvedComprehensionIds, setResolvedComprehensionIds] = useState<
    string[]
  >([]);

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [activeComprehensionId, setActiveComprehensionId] = useState<
    string | null
  >(null);
  const [phase, setPhase] = useState<ChallengePhase>("prompt");
  const [explanation, setExplanation] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [priorAttempts, setPriorAttempts] = useState<GradeAttempt[]>([]);
  const [missReason, setMissReason] = useState<string | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const [acceptedReason, setAcceptedReason] = useState<string | null>(null);

  const page = storyPagesById[pageId];
  const isLastPage = !page.nextPageId && !page.choice;
  const pageWordIds = mysteryWordIdsFor(page);
  const canAdvance = pageWordIds.every((id) => resolvedWordIds.includes(id));

  const activeWord: MysteryWord | null = activeWordId
    ? mysteryWords[activeWordId]
    : null;
  const activeChallenge: ComprehensionChallenge | null = activeComprehensionId
    ? comprehensionChallenges[activeComprehensionId]
    : null;

  function resetChallengeFields() {
    setPhase("prompt");
    setExplanation("");
    setAttempts(0);
    setPriorAttempts([]);
    setMissReason(null);
    setHintText(null);
    setAcceptedReason(null);
  }

  function openVocabChallenge(wordId: string) {
    if (resolvedWordIds.includes(wordId)) return;
    setActiveComprehensionId(null);
    setActiveWordId(wordId);
    resetChallengeFields();
  }

  function openComprehensionChallenge(challengeId: string) {
    if (resolvedComprehensionIds.includes(challengeId)) return;
    setActiveWordId(null);
    setActiveComprehensionId(challengeId);
    resetChallengeFields();
  }

  function resolveWordWithReveal(wordId: string) {
    setResolvedWordIds((prev) =>
      prev.includes(wordId) ? prev : [...prev, wordId],
    );
    setPhase("reveal");
  }

  function resolveComprehensionWithReveal(challengeId: string) {
    setResolvedComprehensionIds((prev) =>
      prev.includes(challengeId) ? prev : [...prev, challengeId],
    );
    setPhase("reveal");
  }

  function recordVocabFailedAttempt(
    submittedExplanation: string,
    reason: string,
    hint: string | null,
    nextAttempts: number,
  ) {
    setPriorAttempts((prev) => [
      ...prev,
      {
        explanation: submittedExplanation,
        reason,
        hint,
      },
    ]);
    setAttempts(nextAttempts);

    if (nextAttempts >= MAX_ATTEMPTS && activeWordId) {
      resolveWordWithReveal(activeWordId);
      return;
    }

    setMissReason(reason);
    setHintText(hint);
    setExplanation("");
    setPhase("prompt");
  }

  function recordComprehensionFailedAttempt(
    submittedAnswer: string,
    reason: string,
    hint: string | null,
    nextAttempts: number,
  ) {
    setPriorAttempts((prev) => [
      ...prev,
      {
        explanation: submittedAnswer,
        reason,
        hint,
      },
    ]);
    setAttempts(nextAttempts);

    if (nextAttempts >= MAX_ATTEMPTS && activeComprehensionId) {
      resolveComprehensionWithReveal(activeComprehensionId);
      return;
    }

    setMissReason(reason);
    setHintText(hint);
    setExplanation("");
    setPhase("prompt");
  }

  async function handleVocabCheck() {
    if (!activeWordId || explanation.trim().length === 0) return;
    setPhase("waiting");

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
      recordVocabFailedAttempt(
        submittedExplanation,
        "Not quite — try another way.",
        hint,
        nextAttempts,
      );
      return;
    }

    if (result.correct) {
      setResolvedWordIds((prev) =>
        prev.includes(activeWordId) ? prev : [...prev, activeWordId],
      );
      setWordsLearned((count) => count + 1);
      setAcceptedReason(result.reason);
      setHintText(null);
      setPhase("accepted");
      return;
    }

    const nextAttempts = attempts + 1;
    recordVocabFailedAttempt(
      submittedExplanation,
      result.reason,
      result.hint,
      nextAttempts,
    );
  }

  async function handleComprehensionCheck() {
    if (!activeComprehensionId || explanation.trim().length === 0) return;
    setPhase("waiting");

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
      recordComprehensionFailedAttempt(
        submittedAnswer,
        "Not quite — try another way.",
        hint,
        nextAttempts,
      );
      return;
    }

    if (result.correct) {
      setResolvedComprehensionIds((prev) =>
        prev.includes(activeComprehensionId)
          ? prev
          : [...prev, activeComprehensionId],
      );
      setAcceptedReason(result.reason);
      setHintText(null);
      setPhase("accepted");
      return;
    }

    const nextAttempts = attempts + 1;
    recordComprehensionFailedAttempt(
      submittedAnswer,
      result.reason,
      result.hint,
      nextAttempts,
    );
  }

  function closeVocabChallenge() {
    setActiveWordId(null);
    resetChallengeFields();
  }

  function closeComprehensionChallenge() {
    setActiveComprehensionId(null);
    pendingAdvanceId.current = null;
    resetChallengeFields();
  }

  function continueComprehension() {
    const nextPageId = pendingAdvanceId.current;
    pendingAdvanceId.current = null;
    setActiveComprehensionId(null);
    resetChallengeFields();
    if (nextPageId) {
      pageViewRef.current?.advanceTo(nextPageId);
    }
  }

  function goToPage(nextPageId: string) {
    if (!canAdvance || !storyPagesById[nextPageId]) return;
    setPageId(nextPageId);
  }

  function handleBeforeNextPage(nextPageId: string): boolean {
    const challengeId = page.comprehensionId;
    if (
      challengeId &&
      !resolvedComprehensionIds.includes(challengeId)
    ) {
      pendingAdvanceId.current = nextPageId;
      openComprehensionChallenge(challengeId);
      return false;
    }
    return true;
  }

  return (
    <div className="flex flex-1 flex-col">
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
        onChange={setExplanation}
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
        onChange={setExplanation}
        onCheck={handleComprehensionCheck}
        onContinue={continueComprehension}
        onClose={closeComprehensionChallenge}
      />
    </div>
  );
}
