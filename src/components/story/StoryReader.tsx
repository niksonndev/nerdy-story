"use client";

import { ComprehensionChallengeOverlay } from "@/components/story/ComprehensionChallengeOverlay";
import { EndingBeat } from "@/components/story/EndingBeat";
import { StoryPageView } from "@/components/story/StoryPageView";
import { useStoryReader } from "@/components/story/use-story-reader";
import { VocabChallengeOverlay } from "@/components/story/VocabChallengeOverlay";

export function StoryReader() {
  const {
    pageViewRef,
    page,
    pageId,
    beatSession,
    wordsLearned,
    learnedWords,
    resolvedWordIds,
    canAdvance,
    isLastPage,
    showEndingBeat,
    endingsExplored,
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
    handleBeforeNextPage,
    handleVocabCheck,
    handleComprehensionCheck,
    closeVocabChallenge,
    closeComprehensionChallenge,
    continueComprehension,
    handleReadAgain,
    handleReadChapter2,
    setExplanation,
  } = useStoryReader();

  return (
    <div className="flex flex-1 flex-col">
      {showEndingBeat ? (
        <EndingBeat
          key={`${pageId}-${beatSession}`}
          wordsLearned={wordsLearned}
          learnedWords={learnedWords}
          endingsExplored={endingsExplored}
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
        </>
      )}
    </div>
  );
}
