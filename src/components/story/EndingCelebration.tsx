"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ChallengeDialog } from "@/components/story/ChallengeUi";
import { SpeakableMysteryWord } from "@/components/story/SpeakableMysteryWord";
import { stopWordAudio } from "@/lib/speech/play-word-audio";
import { ENDING_PAGE_IDS, mysteryWords } from "@/lib/story/story-data";
import { cn } from "@/lib/utils";

export function CelebrationPhase({
  displayCount,
  learnedWordIds,
  exploredEndingIds,
  onReadAgain,
  onDiscoverAlternateEnding,
  onReadChapter2,
}: {
  displayCount: number;
  learnedWordIds: string[];
  exploredEndingIds: string[];
  onReadAgain: () => void;
  onDiscoverAlternateEnding: () => void;
  onReadChapter2: () => void;
}) {
  const [showExplorePrompt, setShowExplorePrompt] = useState(false);
  const bothEndings = exploredEndingIds.length >= 2;

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
  displayCount,
  learnedWordIds,
  exploredEndingIds,
}: {
  displayCount: number;
  learnedWordIds: string[];
  exploredEndingIds: string[];
}) {
  const wordsLearned = learnedWordIds.length;
  const showWordsSection = wordsLearned > 0;

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
            <LearnedWordPills learnedWordIds={learnedWordIds} />
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
            className={cn(
              "w-full min-h-14 text-xl sm:text-2xl",
              "order-1 lg:order-2 lg:w-auto lg:flex-none",
            )}
            onClick={onReadChapter2}
          >
            <span aria-hidden>{"\u2728"}</span> Explore the next chapter
          </Button>
          <Button
            size="kid"
            variant="ghost"
            className={cn(
              "w-full min-h-14 text-xl sm:text-2xl",
              "order-2 lg:order-1",
              "text-muted-foreground hover:text-foreground",
              "max-lg:bg-white/80 max-lg:hover:bg-white/90",
              "lg:w-auto lg:min-h-14 lg:flex-none lg:bg-transparent lg:px-5 lg:text-xl lg:underline-offset-4 lg:hover:underline",
            )}
            onClick={onReadAgain}
          >
            Read the chapter again
          </Button>
        </>
      ) : (
        <>
          <Button
            size="kid"
            className={cn(
              "w-full min-h-14 text-xl sm:text-2xl",
              "order-1 lg:order-2 lg:w-auto lg:flex-none",
            )}
            onClick={onDiscoverAlternateEnding}
          >
            Discover Another Ending {"\u26A1"}
          </Button>
          <Button
            size="kid"
            variant="ghost"
            className={cn(
              "w-full min-h-14 text-xl sm:text-2xl",
              "order-2 lg:order-1",
              "text-muted-foreground hover:text-foreground",
              "max-lg:bg-white/80 max-lg:hover:bg-white/90",
              "lg:w-auto lg:min-h-14 lg:flex-none lg:bg-transparent lg:px-5 lg:text-xl lg:underline-offset-4 lg:hover:underline",
            )}
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
  const activeWord = activeWordId ? mysteryWords[activeWordId] : null;

  useEffect(() => {
    if (activeWordId === null) return;
    return () => stopWordAudio();
  }, [activeWordId]);

  if (learnedWordIds.length === 0) return null;

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

      <ChallengeDialog
        open={activeWord !== null}
        onClose={() => setActiveWordId(null)}
        aria-label={activeWord ? `Definition: ${activeWord.word}` : undefined}
      >
        {activeWord ? (
          <>
            <h2>
              <SpeakableMysteryWord
                wordId={activeWord.id}
                word={activeWord.word}
                className="font-heading text-2xl font-bold text-foreground"
              />
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              {activeWord.meaningReveal}
            </p>
          </>
        ) : null}
      </ChallengeDialog>
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
      aria-label={`Ending progress: ${exploredCount} of ${ENDING_PAGE_IDS.length} explored`}
    >
      {ENDING_PAGE_IDS.map((id, index) => {
        const explored = exploredEndingIds.includes(id);
        const label = `Ending ${index + 1}`;

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
  return (
    <ChallengeDialog
      open={open}
      onClose={onClose}
      placement="bottom"
      aria-labelledby="explore-first-title"
    >
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
          className="w-full min-h-14 text-xl sm:text-2xl"
          onClick={onDiscover}
        >
          Discover new ending
        </Button>
        <Button
          size="kid"
          variant="ghost"
          className="w-full min-h-14 text-xl sm:text-2xl text-muted-foreground"
          onClick={onSkip}
        >
          Skip to Chapter 2 Anyway
        </Button>
      </div>
    </ChallengeDialog>
  );
}
