"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";

import { Button } from "@/components/ui/button";
import {
  dialogCloseButtonClassName,
  useDialogA11y,
} from "@/lib/a11y/use-dialog-a11y";
import { ENDING_PAGE_IDS } from "@/lib/story/reader-state";
import { mysteryWords } from "@/lib/story-data";
import { type EndingBeatView } from "@/lib/story/types";
import { cn } from "@/lib/utils";

export type EndingBeatPhase = "coloring" | "celebration";

type EndingBeatProps = {
  wordsLearned: number;
  learnedWordIds: string[];
  endingsExplored: number;
  exploredEndingIds: string[];
  view: EndingBeatView;
  onReadAgain: () => void;
  onDiscoverAlternateEnding: () => void;
  onReadChapter2: () => void;
};

const COLORING_MS = 1400;

const ENDING_ACTION_BUTTON_CLASS =
  "w-full min-h-14 text-xl sm:text-2xl";

const ENDING_PRIMARY_ACTION_BUTTON_CLASS = cn(
  ENDING_ACTION_BUTTON_CLASS,
  "order-1 lg:order-2 lg:w-auto lg:flex-none",
);

const ENDING_SECONDARY_ACTION_BUTTON_CLASS = cn(
  ENDING_ACTION_BUTTON_CLASS,
  "order-2 lg:order-1",
  "text-muted-foreground hover:text-foreground",
  "max-lg:bg-white/80 max-lg:hover:bg-white/90",
  "lg:w-auto lg:min-h-14 lg:flex-none lg:bg-transparent lg:px-5 lg:text-xl lg:underline-offset-4 lg:hover:underline",
);

const ENDING_LABELS: Record<(typeof ENDING_PAGE_IDS)[number], string> = {
  "page-7a": "Ending 1",
  "page-7b": "Ending 2",
};

export function EndingBeat({
  wordsLearned,
  learnedWordIds,
  endingsExplored,
  exploredEndingIds,
  view,
  onReadAgain,
  onDiscoverAlternateEnding,
  onReadChapter2,
}: EndingBeatProps) {
  const [phase, setPhase] = useState<EndingBeatPhase>("coloring");
  const [displayCount, setDisplayCount] = useState(0);
  const reduceMotion = useReducedMotion();
  const coloringMs = reduceMotion ? 0 : COLORING_MS;

  useEffect(() => {
    if (view !== "beat" || phase !== "coloring") return;
    if (coloringMs === 0) {
      setPhase("celebration");
      return;
    }
    const timer = window.setTimeout(
      () => setPhase("celebration"),
      coloringMs,
    );
    return () => window.clearTimeout(timer);
  }, [view, phase, coloringMs]);

  useEffect(() => {
    if (view !== "beat" || phase !== "celebration") return;

    if (reduceMotion) {
      setDisplayCount(wordsLearned);
      return;
    }

    const controls = animate(0, wordsLearned, {
      duration: Math.min(1.2, 0.4 + wordsLearned * 0.25),
      ease: "easeOut",
      onUpdate: (value) => setDisplayCount(Math.round(value)),
    });

    return () => controls.stop();
  }, [view, phase, wordsLearned, reduceMotion]);

  const bothEndings = endingsExplored >= 2;

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-x-hidden",
        "max-sm:h-dvh max-sm:overflow-y-hidden",
        "sm:items-center sm:justify-center sm:py-8",
      )}
    >
      <article
        aria-label="Story complete"
        className={cn(
          "relative z-10 flex min-h-0 w-full flex-1 flex-col",
          "max-sm:min-h-dvh",
          "sm:mx-auto sm:max-w-150 sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:bg-card",
          "lg:max-w-225",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col px-5 pb-0 pt-10",
            "sm:items-center sm:justify-center sm:px-8 sm:pb-12 sm:pt-12",
            "lg:px-12 lg:pb-14 lg:pt-14",
          )}
        >
          <div className="flex min-h-0 w-full flex-1 flex-col sm:items-center">
            <AnimatePresence mode="wait">
            {view === "chapter2" ? (
              <Chapter2Stub key="chapter2" onReadAgain={onReadAgain} />
            ) : phase === "coloring" ? (
              <ColoringPhase key="coloring" />
            ) : (
              <CelebrationPhase
                key="celebration"
                wordsLearned={wordsLearned}
                displayCount={displayCount}
                learnedWordIds={learnedWordIds}
                exploredEndingIds={exploredEndingIds}
                bothEndings={bothEndings}
                onReadAgain={onReadAgain}
                onDiscoverAlternateEnding={onDiscoverAlternateEnding}
                onReadChapter2={onReadChapter2}
              />
            )}
            </AnimatePresence>
          </div>
        </div>
      </article>
    </div>
  );
}

function ColoringPhase() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center sm:max-w-none",
        "max-sm:min-h-0",
        "sm:flex-none",
      )}
    >
      <BookColoring />
      <p className="mt-8 font-heading text-xl font-semibold text-foreground/80 sm:text-3xl">
        Finishing your storybook...
      </p>
    </motion.div>
  );
}

function BookColoring() {
  return (
    <div className="relative h-44 w-52 sm:h-52 sm:w-60">
      <svg
        viewBox="0 0 160 120"
        className="h-full w-full drop-shadow-md"
        aria-hidden
      >
        <motion.path
          d="M12 16 C12 8 20 4 32 4 H128 C140 4 148 8 148 16 V104 C148 112 140 116 128 116 H32 C20 116 12 112 12 104 Z"
          fill="#e6cf94"
          stroke="#243428"
          strokeWidth="2"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
        />
        <motion.path
          d="M80 4 V116"
          stroke="#243428"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.path
          d="M20 28 H72 M20 44 H68 M20 60 H74 M88 28 H140 M88 44 H136 M88 60 H142"
          stroke="#243428"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
        <motion.path
          d="M16 20 C16 12 24 8 36 8 H76 C88 8 96 12 96 20 V100 C96 108 88 112 76 112 H36 C24 112 16 108 16 100 Z"
          fill="#0f8a7a"
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: "16px 112px" }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.path
          d="M64 20 C64 12 72 8 84 8 H124 C136 8 144 12 144 20 V100 C144 108 136 112 124 112 H84 C72 112 64 108 64 100 Z"
          fill="#d4920a"
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: "64px 112px" }}
          transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

function CelebrationPhase({
  wordsLearned,
  displayCount,
  learnedWordIds,
  exploredEndingIds,
  bothEndings,
  onReadAgain,
  onDiscoverAlternateEnding,
  onReadChapter2,
}: {
  wordsLearned: number;
  displayCount: number;
  learnedWordIds: string[];
  exploredEndingIds: string[];
  bothEndings: boolean;
  onReadAgain: () => void;
  onDiscoverAlternateEnding: () => void;
  onReadChapter2: () => void;
}) {
  const [showExplorePrompt, setShowExplorePrompt] = useState(false);

  function handleContinueToChapter2() {
    if (bothEndings) {
      onReadChapter2();
      return;
    }
    setShowExplorePrompt(true);
  }

  function handleDiscoverFromPrompt() {
    setShowExplorePrompt(false);
    onDiscoverAlternateEnding();
  }

  function handleSkipToChapter2() {
    setShowExplorePrompt(false);
    onReadChapter2();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col text-center sm:max-w-none",
          "max-sm:min-h-0 max-sm:flex-1",
          "sm:flex-none",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            "gap-[clamp(1rem,4dvh,3rem)]",
            "sm:gap-6",
          )}
        >
          <CelebrationHeader bothEndings={bothEndings} />

          <CelebrationRecap
            wordsLearned={wordsLearned}
            displayCount={displayCount}
            learnedWordIds={learnedWordIds}
            exploredEndingIds={exploredEndingIds}
          />
        </div>

        <CelebrationActions
          bothEndings={bothEndings}
          onReadAgain={onReadAgain}
          onDiscoverAlternateEnding={onDiscoverAlternateEnding}
          onReadChapter2={onReadChapter2}
          onContinueToChapter2={handleContinueToChapter2}
        />
      </motion.div>

      <ExploreFirstPrompt
        open={showExplorePrompt}
        onDiscover={handleDiscoverFromPrompt}
        onSkip={handleSkipToChapter2}
        onClose={() => setShowExplorePrompt(false)}
      />
    </>
  );
}

function CelebrationHeader({ bothEndings }: { bothEndings: boolean }) {
  return (
    <header className="shrink-0">
      <h1 className="font-heading text-3xl font-bold leading-snug text-foreground sm:text-5xl">
        <span aria-hidden className="text-magic">
          {"\u2728"}{" "}
        </span>
        Story complete!
      </h1>
      <p className="mt-2 font-heading text-xl font-semibold text-magic-ink sm:text-3xl">
        {bothEndings ? "You found both endings!" : "You found one ending!"}
      </p>
    </header>
  );
}

function RecapSectionLabel({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "reward" | "magic";
}) {
  return (
    <p
      className={cn(
        "font-heading text-lg font-semibold sm:text-xl lg:text-2xl",
        tone === "reward" ? "text-reward-ink" : "text-magic-ink",
      )}
    >
      {children}
    </p>
  );
}

function CelebrationRecap({
  wordsLearned,
  displayCount,
  learnedWordIds,
  exploredEndingIds,
}: {
  wordsLearned: number;
  displayCount: number;
  learnedWordIds: string[];
  exploredEndingIds: string[];
}) {
  const showWordsSection = wordsLearned > 0 || learnedWordIds.length > 0;

  return (
    <section aria-label="Your recap" className="shrink-0">
      <div
        className={cn(
          "mx-auto w-full space-y-6 rounded-3xl border",
          "p-[clamp(1rem,2.5dvh,2rem)]",
          "border-reward/25 bg-card/80",
          "sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0",
        )}
      >
        {showWordsSection ? (
          <div className="space-y-4">
            <p className="font-sans text-2xl font-bold leading-snug text-foreground sm:text-4xl">
              <motion.span
                key={displayCount}
                initial={{ scale: 0.85, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block"
              >
                {displayCount}
              </motion.span>{" "}
              new {wordsLearned === 1 ? "word" : "words"} mastered!
            </p>
            {learnedWordIds.length > 0 ? (
              <LearnedWordPills learnedWordIds={learnedWordIds} />
            ) : null}
          </div>
        ) : (
          <p className="font-sans text-xl leading-relaxed text-foreground/90 sm:text-3xl">
            You understood the story!
          </p>
        )}

        <div
          role="separator"
          aria-hidden
          className="mx-auto h-px w-16 bg-border/60"
        />

        <div className="space-y-4">
          <RecapSectionLabel tone="magic">Story paths</RecapSectionLabel>
          <EndingTracker exploredEndingIds={exploredEndingIds} />
        </div>
      </div>
    </section>
  );
}

function CelebrationActions({
  bothEndings,
  onReadAgain,
  onDiscoverAlternateEnding,
  onReadChapter2,
  onContinueToChapter2,
}: {
  bothEndings: boolean;
  onReadAgain: () => void;
  onDiscoverAlternateEnding: () => void;
  onReadChapter2: () => void;
  onContinueToChapter2: () => void;
}) {
  return (
    <footer
      className={cn(
        "flex w-full shrink-0 flex-col gap-3",
        "max-sm:pt-4",
        "pb-[max(2rem,env(safe-area-inset-bottom))]",
        "sm:mt-6 sm:pt-0 sm:pb-0",
        "lg:flex-row lg:items-center lg:justify-between lg:gap-4",
      )}
    >
      {bothEndings ? (
        <>
          <Button
            size="kid"
            className={ENDING_PRIMARY_ACTION_BUTTON_CLASS}
            onClick={onReadChapter2}
          >
            <span aria-hidden>{"\u2728"}</span> Explore the next chapter
          </Button>
          <Button
            size="kid"
            variant="ghost"
            className={ENDING_SECONDARY_ACTION_BUTTON_CLASS}
            onClick={onReadAgain}
          >
            Read the chapter again
          </Button>
        </>
      ) : (
        <>
          <Button
            size="kid"
            className={ENDING_PRIMARY_ACTION_BUTTON_CLASS}
            onClick={onDiscoverAlternateEnding}
          >
            Discover Another Ending {"\u26A1"}
          </Button>
          <Button
            size="kid"
            variant="ghost"
            className={ENDING_SECONDARY_ACTION_BUTTON_CLASS}
            onClick={onContinueToChapter2}
          >
            Continue to Chapter 2 {"\u2192"}
          </Button>
        </>
      )}
    </footer>
  );
}

function LearnedWordPills({ learnedWordIds }: { learnedWordIds: string[] }) {
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const activeWord = activeWordId ? mysteryWords[activeWordId] : null;

  useDialogA11y({
    open: activeWordId !== null,
    onClose: () => setActiveWordId(null),
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (learnedWordIds.length === 0) return null;

  const spring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {learnedWordIds.map((wordId) => {
          const word = mysteryWords[wordId];
          if (!word) return null;

          return (
            <li key={wordId}>
              <button
                type="button"
                onClick={() => setActiveWordId(wordId)}
                className={cn(
                  "inline-flex min-h-12 items-center rounded-2xl border border-reward/30 bg-reward/15 px-5 py-2.5",
                  "font-heading text-lg font-semibold text-foreground sm:text-2xl",
                  "transition-colors hover:bg-reward/25 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
                aria-haspopup="dialog"
                aria-expanded={activeWordId === wordId}
              >
                {word.word}
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {activeWord ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
          >
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setActiveWordId(null)}
              aria-hidden
            />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Definition: ${activeWord.word}`}
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }
              }
              animate={
                reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 8 }
              }
              transition={spring}
              className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 pt-14 shadow-2xl sm:p-8 sm:pt-14"
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setActiveWordId(null)}
                aria-label="Close"
                className={dialogCloseButtonClassName}
              >
                <X className="size-6" aria-hidden />
              </button>

              <h2 className="font-heading text-2xl font-bold text-foreground">
                {activeWord.word}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-foreground/90">
                {activeWord.meaningReveal}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function EndingTracker({ exploredEndingIds }: { exploredEndingIds: string[] }) {
  const exploredCount = ENDING_PAGE_IDS.filter((id) =>
    exploredEndingIds.includes(id),
  ).length;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label={`Ending progress: ${exploredCount} of 2 explored`}
    >
      {ENDING_PAGE_IDS.map((id) => {
        const explored = exploredEndingIds.includes(id);
        const label = ENDING_LABELS[id];

        return (
          <span
            key={id}
            className={cn(
              "inline-flex min-h-12 items-center gap-1.5 rounded-2xl border px-5 py-2.5 font-heading text-lg font-semibold sm:text-2xl",
              explored
                ? "border-magic/40 bg-magic/15 text-magic-ink"
                : "border-border bg-muted/50 text-muted-foreground",
            )}
          >
            <span aria-hidden>{explored ? "\u2713" : "\uD83D\uDD12"}</span>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function ExploreFirstPrompt({
  open,
  onDiscover,
  onSkip,
  onClose,
}: {
  open: boolean;
  onDiscover: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useDialogA11y({
    open,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const spring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
        >
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-first-title"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={spring}
            className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 pt-14 shadow-2xl sm:p-8 sm:pt-14"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={dialogCloseButtonClassName}
            >
              <X className="size-6" aria-hidden />
            </button>

            <h2
              id="explore-first-title"
              className="font-heading text-2xl font-bold text-foreground"
            >
              Unexplored Path Ahead!
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              You still have 1 hidden ending left in this chapter. Want to jump
              back to your last choice and see what happens?
            </p>

            <div className="mt-8 flex w-full flex-col gap-3">
              <Button
                size="kid"
                className={ENDING_ACTION_BUTTON_CLASS}
                onClick={onDiscover}
              >
                Discover new ending
              </Button>
              <Button
                size="kid"
                variant="ghost"
                className={cn(ENDING_ACTION_BUTTON_CLASS, "text-muted-foreground")}
                onClick={onSkip}
              >
                Skip to Chapter 2 Anyway
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Chapter2Stub({ onReadAgain }: { onReadAgain: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col text-center sm:max-w-none",
        "max-sm:min-h-0 max-sm:flex-1",
        "sm:flex-none",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          "gap-[clamp(1rem,4dvh,3rem)]",
          "sm:gap-6",
        )}
      >
        <header className="shrink-0">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="mx-auto text-5xl sm:text-6xl"
            aria-hidden
          >
            {"\uD83D\uDCDA"}
          </motion.div>
          <h1 className="mt-6 font-heading text-3xl font-bold text-magic-ink sm:text-5xl">
            Chapter 2 unlocked!
          </h1>
        </header>

        <section
          aria-label="Chapter 2 preview"
          className={cn(
            "py-[clamp(1rem,3vh,1.5rem)]",
            "sm:py-6",
          )}
        >
          <p className="mx-auto max-w-md text-lg leading-relaxed text-foreground/90 sm:text-2xl">
            Mia&apos;s next adventure is ready. More rainforest trails, more
            words to discover — coming soon!
          </p>
        </section>
      </div>

      <footer
        className={cn(
          "flex w-full shrink-0 flex-col gap-3",
          "max-sm:pt-4",
          "pb-[max(2rem,env(safe-area-inset-bottom))]",
          "sm:mt-4 sm:pt-0 sm:pb-0",
        )}
      >
        <Button
          size="kid"
          variant="outline"
          className={cn(
            ENDING_ACTION_BUTTON_CLASS,
            "border-foreground/25 sm:w-auto sm:self-center",
          )}
          onClick={onReadAgain}
        >
          Read the chapter again
        </Button>
      </footer>
    </motion.div>
  );
}
