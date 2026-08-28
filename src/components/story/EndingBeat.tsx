"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EndingBeatPhase = "coloring" | "celebration";
export type EndingBeatView = "beat" | "chapter2";

type EndingBeatProps = {
  wordsLearned: number;
  learnedWords: string[];
  endingsExplored: number;
  view: EndingBeatView;
  onReadAgain: () => void;
  onReadChapter2: () => void;
};

const COLORING_MS = 1400;

export function EndingBeat({
  wordsLearned,
  learnedWords,
  endingsExplored,
  view,
  onReadAgain,
  onReadChapter2,
}: EndingBeatProps) {
  const [phase, setPhase] = useState<EndingBeatPhase>("coloring");
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (view !== "beat" || phase !== "coloring") return;
    const timer = window.setTimeout(() => setPhase("celebration"), COLORING_MS);
    return () => window.clearTimeout(timer);
  }, [view, phase]);

  useEffect(() => {
    if (view !== "beat" || phase !== "celebration") return;

    const controls = animate(0, wordsLearned, {
      duration: Math.min(1.2, 0.4 + wordsLearned * 0.25),
      ease: "easeOut",
      onUpdate: (value) => setDisplayCount(Math.round(value)),
    });

    return () => controls.stop();
  }, [view, phase, wordsLearned]);

  const bothEndings = endingsExplored >= 2;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <SceneAtmosphere />

      <article
        aria-label="Story complete"
        className={cn(
          "relative z-10 flex w-full flex-1 flex-col",
          "sm:mx-auto sm:mb-8 sm:mt-4 sm:max-w-175 sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:bg-card",
          "lg:max-w-225",
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-10",
            "sm:px-8 sm:pb-12 sm:pt-12",
            "lg:px-12 lg:pb-14 lg:pt-14",
          )}
        >
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
                learnedWords={learnedWords}
                endingsExplored={endingsExplored}
                bothEndings={bothEndings}
                onReadAgain={onReadAgain}
                onReadChapter2={onReadChapter2}
              />
            )}
          </AnimatePresence>
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
      className="flex w-full max-w-md flex-col items-center text-center"
    >
      <BookColoring />
      <p className="mt-8 font-heading text-xl font-semibold text-foreground/80 sm:text-2xl">
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
  learnedWords,
  endingsExplored,
  bothEndings,
  onReadAgain,
  onReadChapter2,
}: {
  wordsLearned: number;
  displayCount: number;
  learnedWords: string[];
  endingsExplored: number;
  bothEndings: boolean;
  onReadAgain: () => void;
  onReadChapter2: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="w-full max-w-lg text-center"
    >
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-magic">
        <span aria-hidden>{"\u2728"}</span> Story complete!
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold leading-snug text-foreground sm:text-4xl">
        {wordsLearned > 0 ? (
          <>
            You understood the story and learned{" "}
            <motion.span
              key={displayCount}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block text-reward"
            >
              {displayCount}
            </motion.span>{" "}
            new {wordsLearned === 1 ? "word" : "words"}!
          </>
        ) : (
          "You understood the story!"
        )}
      </h1>
      {learnedWords.length > 0 ? (
        <p className="mt-6 font-heading text-xl font-semibold text-reward">
          {learnedWords.join(" \u00b7 ")}
        </p>
      ) : null}
      <p className="mt-6 text-lg text-foreground/80">
        You explored {endingsExplored} of 2 endings
      </p>

      <div className="mt-8">
        <UnlockBadge />
      </div>

      <div className="mt-6 space-y-2">
        {bothEndings ? (
          <>
            <p className="font-heading text-2xl font-bold text-foreground">
              You found both endings!
            </p>
            <p className="text-lg text-foreground/85 sm:text-xl">
              Want to read it again?
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-2xl font-bold text-foreground">
              You found one ending!
            </p>
            <p className="text-lg text-foreground/85 sm:text-xl">
              What happens if you choose the other path?
            </p>
          </>
        )}
      </div>

      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          size="kid"
          className="w-full min-h-14 sm:w-auto sm:min-w-48"
          onClick={onReadChapter2}
        >
          Read chapter 2
        </Button>
        <Button
          size="kid"
          variant="secondary"
          className="w-full min-h-14 sm:w-auto sm:min-w-48"
          onClick={onReadAgain}
        >
          Read the chapter again
        </Button>
      </div>
    </motion.div>
  );
}

function UnlockBadge() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      className="mx-auto inline-flex items-center gap-2 rounded-full bg-magic/10 px-5 py-2 text-magic"
    >
      <motion.span
        aria-hidden
        initial={{ rotate: -8, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.1 }}
        className="text-xl"
      >
        {"\uD83D\uDD13"}
      </motion.span>
      <span className="font-heading text-lg font-bold">
        Next chapter unlocked!
      </span>
    </motion.div>
  );
}

function Chapter2Stub({ onReadAgain }: { onReadAgain: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        className="mx-auto text-5xl"
        aria-hidden
      >
        {"\uD83D\uDCDA"}
      </motion.div>
      <h1 className="mt-6 font-heading text-3xl font-bold text-magic sm:text-4xl">
        Chapter 2 unlocked!
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90 sm:text-xl">
        Pip&apos;s next adventure is ready. More rainy woods, more words to
        discover — coming soon!
      </p>
      <Button
        size="kid"
        variant="secondary"
        className="mt-10 w-full min-h-14 sm:w-auto"
        onClick={onReadAgain}
      >
        Read the chapter again
      </Button>
    </motion.div>
  );
}

function SceneAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-magic/5 via-transparent to-reward/10" />
      <svg
        className="absolute -bottom-2 left-0 h-40 w-full text-magic/20"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 120 L40 60 L80 120 Z" />
        <path d="M60 120 L110 40 L160 120 Z" />
        <path d="M150 120 L200 55 L250 120 Z" />
        <path d="M240 120 L300 35 L360 120 Z" />
        <path d="M330 120 L370 65 L400 120 Z" />
      </svg>
    </div>
  );
}
