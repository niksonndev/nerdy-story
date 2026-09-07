"use client";

import { ComprehensionChallengeOverlay } from "@/components/story/ComprehensionChallengeOverlay";
import { EndingBeat } from "@/components/story/EndingBeat";
import {
  StoryCoverEntrance,
  StoryEntrancePageLayer,
  useStoryEntrance,
} from "@/components/story/StoryCoverView";
import { StoryPageView } from "@/components/story/StoryPageView";
import { useStoryReader } from "@/components/story/use-story-reader";
import { VocabularyChallengeOverlay } from "@/components/story/VocabularyChallengeOverlay";

export function StoryReader() {
  const {
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
    overlay,
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
  } = useStoryReader();

  const {
    isEntranceTransitioning,
    beginEntranceTransition,
    completeEntranceTransition,
  } = useStoryEntrance();

  const storyPageProps = {
    page,
    pageHistory,
    resolvedComprehensionIds,
    wordsLearned: learnedWordIds.length,
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
  const challengeOpen = overlay.kind !== null;

  return (
    <div className="relative flex flex-1 flex-col">
      {showEndingBeat ? (
        <EndingBeat
          key={`${pageId}-${beatSession}`}
          learnedWordIds={learnedWordIds}
          exploredEndingIds={exploredEndingIds}
          onReadAgain={handleReadAgain}
          onDiscoverAlternateEnding={handleDiscoverAlternateEnding}
        />
      ) : (
        <>
          <div
            className="relative flex min-h-0 flex-1 flex-col"
            {...(challengeOpen ? { inert: true } : {})}
          >
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
          </div>

          {hasStarted ? (
            <>
              <VocabularyChallengeOverlay
                open={overlay.word !== null}
                word={overlay.word}
                phase={overlay.phase}
                value={overlay.childAnswer}
                missReason={overlay.missReason}
                hintText={overlay.hintText}
                acceptedReason={overlay.acceptedReason}
                onChange={setChildAnswer}
                onCheck={handleVocabularyCheck}
                onClose={closeVocabularyChallenge}
              />

              <ComprehensionChallengeOverlay
                open={overlay.comprehension !== null}
                challenge={overlay.comprehension}
                phase={overlay.phase}
                value={overlay.childAnswer}
                missReason={overlay.missReason}
                hintText={overlay.hintText}
                acceptedReason={overlay.acceptedReason}
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
