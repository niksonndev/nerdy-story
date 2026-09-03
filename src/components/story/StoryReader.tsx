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
import { VocabularyChallengeOverlay } from "@/components/story/VocabularyChallengeOverlay";

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
    childAnswer,
    missReason,
    hintText,
    acceptedReason,
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
    handleReadChapter2,
    handleStartReading,
    setChildAnswer,
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
    onMysteryClick: openVocabularyChallenge,
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
              <VocabularyChallengeOverlay
                open={activeWordId !== null}
                word={activeWord}
                phase={phase}
                value={childAnswer}
                missReason={missReason}
                hintText={hintText}
                acceptedReason={acceptedReason}
                onChange={setChildAnswer}
                onCheck={handleVocabularyCheck}
                onClose={closeVocabularyChallenge}
              />

              <ComprehensionChallengeOverlay
                open={activeComprehensionId !== null}
                challenge={activeChallenge}
                phase={phase}
                value={childAnswer}
                missReason={missReason}
                hintText={hintText}
                acceptedReason={acceptedReason}
                onChange={setChildAnswer}
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
