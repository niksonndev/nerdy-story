"use client";

import {
  forwardRef,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft } from "lucide-react";

import { BranchChoice } from "@/components/story/BranchChoice";
import {
  StoryFlipBook,
  type StoryFlipBookHandle,
} from "@/components/story/StoryFlipBook";
import { SceneImage } from "@/components/story/scene-image";
import { Button } from "@/components/ui/button";
import {
  flipCurrentIndex,
  flipSheetIdsFor,
  peekNextPageIdFor,
} from "@/lib/story/page-helpers";
import { storyPagesById, type StoryPage } from "@/lib/story/story-data";
import { cn } from "@/lib/utils";

type StoryPageViewProps = {
  page: StoryPage;
  pageHistory: string[];
  resolvedComprehensionIds: string[];
  wordsLearned: number;
  resolvedWordIds: string[];
  canAdvance: boolean;
  canGoBack: boolean;
  isLastPage: boolean;
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
    isLastPage,
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
  const pendingAdvanceId = useRef<string | null>(null);
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

  const runPendingFlip = useEffectEvent(() => {
    const advanceId = pendingAdvanceId.current;
    if (advanceId) {
      const started = flipRef.current?.flipNext() ?? false;
      if (!started) {
        pendingAdvanceId.current = null;
        setPendingPeekId(null);
        onChoosePath(advanceId);
        return;
      }
      pendingAdvanceId.current = null;
      return;
    }
    if (pendingRetreat.current) {
      pendingRetreat.current = false;
      const started = flipRef.current?.flipPrev() ?? false;
      if (!started) {
        onPreviousPage();
      }
    }
  });

  // After a branch pick (or any advance that needed a pending peek sheet),
  // wait for the spine to include the target, then flip.
  useEffect(() => {
    if (!pendingPeekId) return;
    if (!sheetIds.includes(pendingPeekId)) return;
    const frame = requestAnimationFrame(() => {
      runPendingFlip();
    });
    return () => cancelAnimationFrame(frame);
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
        // Flip engine not ready — advance without animation.
        onChoosePath(nextPageId);
      }
      return;
    }

    pendingAdvanceId.current = nextPageId;
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
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-x-hidden",
        // Reading pages: fill the phone viewport so the flip book can size itself
        "max-sm:h-dvh max-sm:overflow-y-hidden",
      )}
    >
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

      <div
        className={cn(
          "relative z-10 flex min-h-0 w-full flex-1 flex-col",
          // Tablet/desktop: height = leftover viewport after HUD + mt-4 + mb-8 (~6.5rem)
          "sm:mx-auto sm:mb-8 sm:mt-4 sm:h-[min(52rem,calc(100dvh-6.5rem))] sm:max-w-175 sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:bg-card",
          "lg:max-w-225",
        )}
      >
        <StoryFlipBook
          ref={flipRef}
          bookKey={page.id}
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
                isLastPage={
                  isCurrent
                    ? isLastPage
                    : !sheetPage.nextPageId && !sheetPage.choice
                }
                canAdvance={isCurrent && progressionReady}
                canGoBack={isCurrent && previousReady}
                previousDisabled={!previousReady}
                vocabGated={isCurrent && !canAdvance}
                resolvedWordIds={resolvedWordIds}
                onMysteryClick={onMysteryClick}
                onNextPage={handleNextPage}
                onPreviousPage={requestRetreat}
                onChoosePath={requestAdvance}
              />
            );
          }}
        />
      </div>
    </div>
  );
});

function StoryPageSheet({
  page,
  interactive,
  isLastPage,
  canAdvance,
  canGoBack,
  previousDisabled,
  vocabGated,
  resolvedWordIds,
  onMysteryClick,
  onNextPage,
  onPreviousPage,
  onChoosePath,
}: {
  page: StoryPage;
  interactive: boolean;
  isLastPage: boolean;
  canAdvance: boolean;
  canGoBack: boolean;
  previousDisabled: boolean;
  vocabGated: boolean;
  resolvedWordIds: string[];
  onMysteryClick: (wordId: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onChoosePath: (nextPageId: string) => void;
}) {
  const isDecision = Boolean(page.choice);
  const showDecisionBack = isDecision && canGoBack;

  return (
    <article
      className={cn(
        "h-full w-full overflow-y-auto bg-card",
        !interactive && "pointer-events-none select-none",
      )}
      {...(!interactive ? { inert: true } : {})}
    >
      {/* Whole sheet scrolls when content overflows; no stretch/pin gap under text */}
      <div className="flex flex-col">
        <SceneImage
          src={page.image}
          alt={page.imageAlt ?? page.title}
          backControl={
            showDecisionBack ? (
              <>
                <PreviousControl
                  variant="ghostIcon"
                  disabled={previousDisabled}
                  onClick={onPreviousPage}
                  className="absolute top-3 left-3 z-20 sm:hidden"
                />
                <PreviousControl
                  variant="backLink"
                  disabled={previousDisabled}
                  onClick={onPreviousPage}
                  className="absolute top-3 left-3 z-20 hidden sm:inline-flex"
                />
              </>
            ) : null
          }
        />

        <div
          className={cn(
            "flex min-w-0 flex-col px-5 pt-6",
            isDecision ? "pb-8" : "pb-0",
            "sm:px-10 sm:pb-8 sm:pt-8",
          )}
        >
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            {page.title}
          </h1>

          <p className="mt-6 max-w-[65ch] text-lg leading-[1.75] text-foreground/90 sm:text-xl sm:leading-[1.8]">
            {page.segments.map((segment, index) => {
              if (segment.type === "mystery") {
                const isResolved = resolvedWordIds.includes(segment.wordId);
                return (
                  <MysteryWord
                    key={index}
                    label={segment.content}
                    resolved={isResolved}
                    onClick={() => onMysteryClick(segment.wordId)}
                  />
                );
              }
              return <span key={index}>{segment.content}</span>;
            })}
          </p>

          <PageProgression
            page={page}
            isLastPage={isLastPage}
            canAdvance={canAdvance}
            canGoBack={canGoBack}
            previousDisabled={previousDisabled}
            vocabGated={vocabGated}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            onChoosePath={onChoosePath}
            className={cn(
              "relative z-10 mt-4 flex w-full shrink-0",
              !isDecision &&
                "max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-4",
            )}
          />
        </div>
      </div>
    </article>
  );
}

function PreviousControl({
  variant,
  disabled,
  onClick,
  className,
}: {
  variant: "ghostIcon" | "outline" | "backLink";
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  if (variant === "ghostIcon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "size-14 shrink-0 rounded-2xl bg-card/80 text-foreground shadow-sm backdrop-blur-sm",
          "hover:bg-card/90",
          className,
        )}
        onClick={onClick}
        disabled={disabled}
        aria-label="Previous Page"
      >
        <ChevronLeft className="size-6" aria-hidden />
      </Button>
    );
  }

  if (variant === "backLink") {
    return (
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "min-h-11 w-fit gap-1 rounded-2xl bg-card/80 px-3 font-heading text-base font-semibold text-foreground shadow-sm backdrop-blur-sm",
          "hover:bg-card/90 hover:text-foreground",
          className,
        )}
        onClick={onClick}
        disabled={disabled}
        aria-label="Previous Page"
      >
        <ChevronLeft className="size-5" aria-hidden />
        Back
      </Button>
    );
  }

  return (
    <Button
      size="kid"
      variant="outline"
      className={cn("min-h-14 w-auto", className)}
      onClick={onClick}
      disabled={disabled}
      aria-label="Previous Page"
    >
      Previous Page
    </Button>
  );
}

function PageProgression({
  page,
  isLastPage,
  canAdvance,
  canGoBack,
  previousDisabled,
  vocabGated,
  onNextPage,
  onPreviousPage,
  onChoosePath,
  className,
}: {
  page: StoryPage;
  isLastPage: boolean;
  canAdvance: boolean;
  canGoBack: boolean;
  previousDisabled: boolean;
  vocabGated: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onChoosePath: (nextPageId: string) => void;
  className?: string;
}) {
  const nextHintId = useId();
  if (page.choice) {
    return (
      <div className={cn("flex w-full flex-col gap-3", className)}>
        <BranchChoice
          choice={page.choice}
          disabled={!canAdvance}
          onChoose={onChoosePath}
        />
      </div>
    );
  }

  if (isLastPage) {
    if (!canGoBack) return null;
    return (
      <div className={cn("flex w-full items-center", className)}>
        <PreviousControl
          variant="ghostIcon"
          disabled={previousDisabled}
          onClick={onPreviousPage}
          className="sm:hidden"
        />
        <PreviousControl
          variant="outline"
          disabled={previousDisabled}
          onClick={onPreviousPage}
          className="hidden sm:inline-flex"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-row items-center gap-3",
        "sm:justify-between",
        className,
      )}
    >
      {canGoBack ? (
        <>
          <PreviousControl
            variant="ghostIcon"
            disabled={previousDisabled}
            onClick={onPreviousPage}
            className="sm:hidden"
          />
          <PreviousControl
            variant="outline"
            disabled={previousDisabled}
            onClick={onPreviousPage}
            className="hidden sm:inline-flex"
          />
        </>
      ) : (
        <span className="hidden sm:block" />
      )}
      {vocabGated ? (
        <span id={nextHintId} className="sr-only">
          Finish the mystery word on this page before going to the next page.
        </span>
      ) : null}
      <Button
        size="kid"
        className="min-h-14 flex-1 sm:ml-auto sm:w-auto sm:flex-none"
        onClick={onNextPage}
        disabled={!canAdvance}
        aria-label="Next Page"
        aria-describedby={vocabGated ? nextHintId : undefined}
      >
        Next Page
      </Button>
    </div>
  );
}

function MysteryWord({
  label,
  resolved,
  onClick,
}: {
  label: string;
  resolved: boolean;
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!resolved) onClick();
      }}
      aria-label={
        resolved ? `Learned word: ${label}` : `Mystery word: ${label}`
      }
      aria-disabled={resolved}
      whileTap={reduceMotion || resolved ? undefined : { scale: 0.94 }}
      className={cn(
        // Inline hit slate ≥44px tall without breaking sentence flow
        "mx-0.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-1.5 py-1 align-baseline font-semibold text-foreground",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        resolved
          ? "bg-reward/20"
          : "bg-magic/15 underline decoration-magic decoration-wavy underline-offset-4 sm:underline-offset-8 transition-colors lg:hover:bg-magic/25",
      )}
    >
      {resolved ? (
        <span aria-hidden className="mr-1 text-sm font-bold text-reward">
          {"\u2713"}
        </span>
      ) : null}
      {label}
    </motion.button>
  );
}

function WordsLearned({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "relative z-10 flex items-center gap-2 rounded-full bg-magic/10 px-4 py-1.5",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center text-lg leading-none text-magic"
      >
        {"\u2728"}
      </span>
      <span className="translate-y-0.5 font-heading text-sm font-semibold uppercase leading-none tracking-wide text-magic-ink">
        Words learned
      </span>
      <div className="relative h-6 w-6 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={reduceMotion ? false : { y: 14, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { y: -14, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 500, damping: 24 }
            }
            className="absolute inset-0 font-heading text-lg font-bold text-magic"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
