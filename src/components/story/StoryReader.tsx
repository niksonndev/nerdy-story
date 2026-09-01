"use client";

import { ComprehensionChallengeOverlay } from "@/components/story/ComprehensionChallengeOverlay";
import { EndingBeat } from "@/components/story/EndingBeat";
import {
  StoryCoverEntrance,
  StoryEntrancePageLayer,
  useStoryEntrance,
} from "@/components/story/StoryCoverEntrance";
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
    hasStarted,
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
    handleStartReading,
    setExplanation,
  } = useStoryReader();

  const {
    isEntranceTransitioning,
    beginEntranceTransition,
    completeEntranceTransition,
  } = useStoryEntrance();

  const storyPageProps = {
    page,
    wordsLearned,
    resolvedWordIds,
    canAdvance,
    canGoBack,
    isLastPage,
    onMysteryClick: openVocabChallenge,
    onChoosePath: goToPage,
    onPreviousPage: goToPreviousPage,
    onBeforeNextPage: handleBeforeNextPage,
  };

  const showReaderPage = hasStarted || isEntranceTransitioning;

  return (
    <div className="relative flex flex-1 flex-col">
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
          {showReaderPage ? (
            <StoryEntrancePageLayer>
              <StoryPageView ref={pageViewRef} {...storyPageProps} />
            </StoryEntrancePageLayer>
          ) : null}

          {!hasStarted ? (
            <StoryCoverEntrance
              isTransitioning={isEntranceTransitioning}
              onStartReading={beginEntranceTransition}
              onEntranceComplete={() =>
                completeEntranceTransition(handleStartReading)
              }
            />
          ) : null}

          {hasStarted ? (
            <>
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
          ) : null}
        </>
      )}
    </div>
  );
}
