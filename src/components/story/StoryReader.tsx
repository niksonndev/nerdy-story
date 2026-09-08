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
    closeChallenge,
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

  const overlayFields = {
    phase: overlay.phase,
    value: overlay.childAnswer,
    missReason: overlay.missReason,
    hintText: overlay.hintText,
    acceptedReason: overlay.acceptedReason,
    onChange: setChildAnswer,
  };

  const showReaderPage = hasStarted || isEntranceTransitioning;
  const challengeOpen =
    overlay.word !== null || overlay.comprehension !== null;

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
                <StoryPageView
                  ref={pageViewRef}
                  page={page}
                  pageHistory={pageHistory}
                  resolvedComprehensionIds={resolvedComprehensionIds}
                  wordsLearned={learnedWordIds.length}
                  resolvedWordIds={resolvedWordIds}
                  canAdvance={canAdvance}
                  canGoBack={canGoBack}
                  onMysteryClick={openVocabularyChallenge}
                  onChoosePath={goToPage}
                  onPreviousPage={goToPreviousPage}
                  onBeforeNextPage={handleBeforeNextPage}
                  challengeOpen={challengeOpen}
                />
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
                {...overlayFields}
                onCheck={handleVocabularyCheck}
                onClose={() => closeChallenge()}
              />

              <ComprehensionChallengeOverlay
                open={overlay.comprehension !== null}
                challenge={overlay.comprehension}
                {...overlayFields}
                onCheck={handleComprehensionCheck}
                onContinue={() => closeChallenge({ advance: true })}
                onClose={() => closeChallenge()}
              />
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
