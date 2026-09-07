"use client";

import {
  forwardRef,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";

import {
  StoryFlipBook,
  type StoryFlipBookHandle,
} from "@/components/story/StoryFlipBook";
import { StoryPageSheet } from "@/components/story/StoryPageSheet";
import { StorybookShell } from "@/components/story/storybook-shell";
import { WordsLearned } from "@/components/story/WordsLearned";
import {
  flipBookKeyFor,
  flipCurrentIndex,
  flipSheetIdsFor,
  mysteryWordIdsFor,
  peekNextPageIdFor,
} from "@/lib/story/page-helpers";
import { storyPagesById, type StoryPage } from "@/lib/story/story-data";

type StoryPageViewProps = {
  page: StoryPage;
  pageHistory: string[];
  resolvedComprehensionIds: string[];
  wordsLearned: number;
  resolvedWordIds: string[];
  canAdvance: boolean;
  canGoBack: boolean;
  onMysteryClick: (wordId: string) => void;
  onChoosePath: (nextPageId: string) => void;
  onPreviousPage: () => void;
  /** Return false to block the page turn (e.g. open comprehension first). */
  onBeforeNextPage?: (nextPageId: string) => boolean;
};

export type StoryPageViewHandle = {
  advanceTo: (nextPageId: string) => void;
};

export const StoryPageView = forwardRef<
  StoryPageViewHandle,
  StoryPageViewProps
>(function StoryPageView(
  {
    page,
    pageHistory,
    resolvedComprehensionIds,
    wordsLearned,
    resolvedWordIds,
    canAdvance,
    canGoBack,
    onMysteryClick,
    onChoosePath,
    onPreviousPage,
    onBeforeNextPage,
  },
  ref,
) {
  const flipRef = useRef<StoryFlipBookHandle>(null);
  const [pendingPeekId, setPendingPeekId] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const pendingFlipPageId = useRef<string | null>(null);
  const pendingRetreat = useRef(false);
  const reduceMotion = useReducedMotion();

  const peekNextPageId = peekNextPageIdFor({
    page,
    canAdvance,
    resolvedComprehensionIds,
  });

  // Session caught up to the pending peek — clear without an effect.
  const activePendingPeek =
    pendingPeekId !== null && page.id === pendingPeekId ? null : pendingPeekId;
  if (pendingPeekId !== activePendingPeek) {
    setPendingPeekId(activePendingPeek);
  }

  const sheetIds = flipSheetIdsFor({
    pageId: page.id,
    pageHistory,
    peekNextPageId,
    pendingPeekId: activePendingPeek,
  });
  const currentIndex = flipCurrentIndex(pageHistory.length);
  const bookKey = flipBookKeyFor({
    pageId: page.id,
    pageWordIds: mysteryWordIdsFor(page),
    resolvedWordIds,
  });

  const runPendingFlip = useEffectEvent(() => {
    const advanceId = pendingFlipPageId.current;
    if (advanceId) {
      const started = flipRef.current?.flipNext() ?? false;
      if (started) {
        pendingFlipPageId.current = null;
        return "started";
      }
      return "retry";
    }
    if (pendingRetreat.current) {
      pendingRetreat.current = false;
      const started = flipRef.current?.flipPrev() ?? false;
      if (!started) {
        onPreviousPage();
      }
      return "started";
    }
    return "idle";
  });

  const commitPendingAdvance = useEffectEvent((advanceId: string) => {
    onChoosePath(advanceId);
  });

  // After a branch pick (or any advance that needed a pending peek sheet),
  // wait until page-flip has actually loaded that sheet — React spine length
  // updates a frame before the engine, and flipping too early peels the
  // decision page onto the next image.
  useEffect(() => {
    if (!pendingPeekId) return;
    if (!sheetIds.includes(pendingPeekId)) return;

    const maxAttempts = 30;
    let attempts = 0;
    let frame = 0;
    let cancelled = false;

    function tryFlip() {
      if (cancelled) return;
      const result = runPendingFlip();
      if (result === "started" || result === "idle") return;
      attempts += 1;
      if (attempts >= maxAttempts) {
        const advanceId = pendingFlipPageId.current;
        pendingFlipPageId.current = null;
        setPendingPeekId(null);
        if (advanceId) commitPendingAdvance(advanceId);
        return;
      }
      frame = requestAnimationFrame(tryFlip);
    }

    frame = requestAnimationFrame(tryFlip);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pendingPeekId, sheetIds]);

  function requestAdvance(nextPageId: string) {
    if (isFlipping || !canAdvance) return;
    if (!storyPagesById[nextPageId]) return;

    if (reduceMotion) {
      setPendingPeekId(null);
      onChoosePath(nextPageId);
      return;
    }

    const alreadyPeek =
      peekNextPageId === nextPageId || pendingPeekId === nextPageId;
    if (alreadyPeek && sheetIds.includes(nextPageId)) {
      const started = flipRef.current?.flipNext() ?? false;
      if (!started) {
        pendingFlipPageId.current = nextPageId;
        setPendingPeekId(nextPageId);
      }
      return;
    }

    pendingFlipPageId.current = nextPageId;
    setPendingPeekId(nextPageId);
  }

  function requestRetreat() {
    if (isFlipping || !canGoBack) return;

    if (reduceMotion) {
      onPreviousPage();
      return;
    }

    if (currentIndex > 0) {
      const started = flipRef.current?.flipPrev() ?? false;
      if (!started) {
        onPreviousPage();
      }
      return;
    }
    onPreviousPage();
  }

  useImperativeHandle(ref, () => ({
    advanceTo(nextPageId: string) {
      requestAdvance(nextPageId);
    },
  }));

  function handleNextPage() {
    if (!page.nextPageId) return;
    if (onBeforeNextPage?.(page.nextPageId) === false) return;
    requestAdvance(page.nextPageId);
  }

  function handleFlipTo(pageId: string, direction: "forward" | "back") {
    setPendingPeekId(null);
    if (direction === "forward") {
      onChoosePath(pageId);
    } else {
      onPreviousPage();
    }
  }

  const progressionReady = canAdvance && !isFlipping;
  const previousReady = canGoBack && !isFlipping;

  return (
    <StorybookShell
      cardAs="div"
      frameClassName="max-sm:h-dvh max-sm:overflow-y-hidden"
      cardClassName="flex min-h-0 flex-1 flex-col sm:mb-8 sm:mt-4 sm:h-[min(52rem,calc(100dvh-6.5rem))] sm:max-w-175 lg:max-w-225"
      chrome={
        <>
          {/* Mobile: glass chip floats top-center over the scene (stable across page turns) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
            <WordsLearned
              count={wordsLearned}
              className="pointer-events-auto bg-card/55 shadow-sm ring-1 ring-foreground/10 backdrop-blur-md"
            />
          </div>

          <div className="relative z-10 hidden shrink-0 justify-center px-5 pt-4 sm:flex sm:pt-6">
            <WordsLearned count={wordsLearned} />
          </div>
        </>
      }
    >
      <StoryFlipBook
        ref={flipRef}
        bookKey={bookKey}
        sheetIds={sheetIds}
        currentIndex={currentIndex}
        onFlipTo={handleFlipTo}
        onFlippingChange={setIsFlipping}
        className="min-h-0 flex-1"
        renderSheet={(pageId, isCurrent) => {
          const sheetPage = storyPagesById[pageId];
          if (!sheetPage) return null;
          return (
            <StoryPageSheet
              page={sheetPage}
              interactive={isCurrent}
              canAdvance={isCurrent && progressionReady}
              canGoBack={isCurrent && previousReady}
              resolvedWordIds={resolvedWordIds}
              onMysteryClick={onMysteryClick}
              onNextPage={handleNextPage}
              onPreviousPage={requestRetreat}
              onChoosePath={requestAdvance}
            />
          );
        }}
      />
    </StorybookShell>
  );
});
