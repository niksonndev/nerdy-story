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
import { SceneImage } from "@/components/story/scene-image";
import { Button } from "@/components/ui/button";
import { type StoryPage } from "@/lib/story/story-data";
import { cn } from "@/lib/utils";

type StoryPageViewProps = {
  page: StoryPage;
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

type PageTurnPhase = "idle" | "exit" | "enter";
type PageTurnDirection = "forward" | "back";

const PAGE_TURN_MS = 350;

export const StoryPageView = forwardRef<
  StoryPageViewHandle,
  StoryPageViewProps
>(function StoryPageView(
  {
    page,
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
  const [turnPhase, setTurnPhase] = useState<PageTurnPhase>("idle");
  const [turnDirection, setTurnDirection] =
    useState<PageTurnDirection>("forward");
  const pendingPageId = useRef<string | null>(null);
  const pendingRetreat = useRef(false);
  const reduceMotion = useReducedMotion();
  const turnMs = reduceMotion ? 0 : PAGE_TURN_MS;
  const advancePage = useEffectEvent(() => {
    if (pendingRetreat.current) {
      pendingRetreat.current = false;
      onPreviousPage();
      return;
    }
    const nextId = pendingPageId.current;
    pendingPageId.current = null;
    if (nextId) onChoosePath(nextId);
  });

  useEffect(() => {
    if (turnPhase !== "exit") return;
    const nextPhase: PageTurnPhase = turnMs === 0 ? "idle" : "enter";
    const timer = window.setTimeout(() => {
      advancePage();
      setTurnPhase(nextPhase);
    }, turnMs);
    return () => window.clearTimeout(timer);
  }, [turnPhase, turnMs]);

  useEffect(() => {
    if (turnPhase !== "enter") return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTurnPhase("idle"));
    });
    return () => cancelAnimationFrame(frame);
  }, [turnPhase]);

  function requestAdvance(nextPageId: string) {
    if (turnPhase !== "idle" || !canAdvance) return;
    pendingRetreat.current = false;
    pendingPageId.current = nextPageId;
    setTurnDirection("forward");
    setTurnPhase("exit");
  }

  function requestRetreat() {
    if (turnPhase !== "idle" || !canGoBack) return;
    pendingPageId.current = null;
    pendingRetreat.current = true;
    setTurnDirection("back");
    setTurnPhase("exit");
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

  const progressionReady = canAdvance && turnPhase === "idle";
  const previousReady = canGoBack && turnPhase === "idle";
  const isDecision = Boolean(page.choice);
  const showDecisionBack = isDecision && canGoBack;
  const previousDisabled = !previousReady;

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-x-hidden",
        // Reading pages: fill the phone viewport so the split bar can sit at the bottom
        !isDecision && "max-sm:h-dvh max-sm:overflow-y-hidden",
      )}
    >
      {/* Mobile: glass chip floats top-center over the scene (stable across page turns) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
        <WordsLearned
          count={wordsLearned}
          className="pointer-events-auto bg-card/55 shadow-sm ring-1 ring-foreground/10 backdrop-blur-md"
        />
      </div>

      <div className="relative z-10 hidden justify-center px-5 pt-4 sm:flex sm:pt-6">
        <WordsLearned count={wordsLearned} />
      </div>

      <article
        className={cn(
          "relative z-10 flex w-full flex-col",
          isDecision ? "flex-none" : "min-h-0 max-sm:flex-1",
          // Tablet: narrower stacked book card (~700px); desktop widens (~900px)
          "sm:mx-auto sm:mb-8 sm:mt-4 sm:max-w-175 sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:bg-card",
          "lg:max-w-225",
          "origin-center will-change-transform",
          !reduceMotion &&
            turnPhase === "exit" &&
            turnDirection === "forward" &&
            "translate-x-[-12%] scale-[0.96] opacity-0 transition-[opacity,transform] duration-350 ease-out",
          !reduceMotion &&
            turnPhase === "exit" &&
            turnDirection === "back" &&
            "translate-x-[12%] scale-[0.96] opacity-0 transition-[opacity,transform] duration-350 ease-out",
          !reduceMotion &&
            turnPhase === "enter" &&
            turnDirection === "forward" &&
            "translate-x-[12%] opacity-0 transition-none",
          !reduceMotion &&
            turnPhase === "enter" &&
            turnDirection === "back" &&
            "translate-x-[-12%] opacity-0 transition-none",
          (reduceMotion || turnPhase === "idle") &&
            "translate-x-0 scale-100 opacity-100",
          !reduceMotion &&
            turnPhase === "idle" &&
            "transition-[opacity,transform] duration-350 ease-out",
        )}
      >
        <div
          className={cn(
            "flex flex-col",
            !isDecision && "min-h-0 max-sm:flex-1",
          )}
        >
          <SceneImage
            src={page.image}
            alt={page.imageAlt ?? page.title}
            backControl={
              showDecisionBack ? (
                <>
                  <PreviousControl
                    variant="ghostIcon"
                    disabled={previousDisabled}
                    onClick={requestRetreat}
                    className="absolute top-3 left-3 z-20 sm:hidden"
                  />
                  <PreviousControl
                    variant="backLink"
                    disabled={previousDisabled}
                    onClick={requestRetreat}
                    className="absolute top-3 left-3 z-20 hidden sm:inline-flex"
                  />
                </>
              ) : null
            }
          />

          <div
            className={cn(
              "flex min-w-0 flex-col px-5 pt-6",
              !isDecision && "min-h-0 max-sm:flex-1 max-sm:pb-0",
              isDecision && "pb-8",
              "sm:flex-none sm:px-10 sm:pb-8 sm:pt-8",
            )}
          >
            <div
              className={cn(
                !isDecision &&
                  "flex flex-col max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto",
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
            </div>

            <PageProgression
              page={page}
              isLastPage={isLastPage}
              canAdvance={progressionReady}
              canGoBack={canGoBack}
              previousDisabled={previousDisabled}
              vocabGated={!canAdvance}
              onNextPage={handleNextPage}
              onPreviousPage={requestRetreat}
              onChoosePath={requestAdvance}
              className={cn(
                "relative z-10 mt-6 flex w-full",
                !isDecision &&
                  "max-sm:mt-auto max-sm:shrink-0 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-4",
                "sm:mt-auto sm:pt-8",
              )}
            />
          </div>
        </div>
      </article>
    </div>
  );
});

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
