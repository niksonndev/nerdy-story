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
    learnedWordIds,
    resolvedWordIds,
    canAdvance,
    canGoBack,
    isLastPage,
    showEndingBeat,
    endingsExplored,
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
  } = useStoryReader();

  return (
    <div className="flex flex-1 flex-col">
      {showEndingBeat ? (
        <EndingBeat
          key={`${pageId}-${beatSession}`}
          wordsLearned={wordsLearned}
          learnedWordIds={learnedWordIds}
          endingsExplored={endingsExplored}
          exploredEndingIds={exploredEndingIds}
          view={endingView}
          onReadAgain={handleReadAgain}
          onDiscoverAlternateEnding={handleDiscoverAlternateEnding}
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
            canGoBack={canGoBack}
            isLastPage={isLastPage}
            onMysteryClick={openVocabChallenge}
            onChoosePath={goToPage}
            onPreviousPage={goToPreviousPage}
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
