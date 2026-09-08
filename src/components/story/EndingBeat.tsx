"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";

import { CelebrationPhase } from "@/components/story/EndingCelebration";
import { StorybookShell } from "@/components/story/storybook-shell";
import { cn } from "@/lib/utils";

type EndingBeatPhase = "coloring" | "celebration";

type EndingBeatProps = {
  learnedWordIds: string[];
  exploredEndingIds: string[];
  onReadAgain: () => void;
  onDiscoverAlternateEnding: () => void;
};

const COLORING_MS = 1400;

function countUpDuration(
  wordsLearned: number,
  reduceMotion: boolean | null,
) {
  return reduceMotion ? 0 : Math.min(1.2, 0.4 + wordsLearned * 0.25);
}

export function EndingBeat({
  learnedWordIds,
  exploredEndingIds,
  onReadAgain,
  onDiscoverAlternateEnding,
}: EndingBeatProps) {
  const [phase, setPhase] = useState<EndingBeatPhase>("coloring");
  const [displayCount, setDisplayCount] = useState(0);
  const reduceMotion = useReducedMotion();
  const coloringMs = reduceMotion ? 0 : COLORING_MS;
  const wordsLearned = learnedWordIds.length;
  const shownCount = reduceMotion ? wordsLearned : displayCount;

  useEffect(() => {
    if (phase !== "coloring") return;
    const timer = window.setTimeout(
      () => setPhase("celebration"),
      coloringMs,
    );
    return () => window.clearTimeout(timer);
  }, [phase, coloringMs]);

  useEffect(() => {
    if (phase !== "celebration" || reduceMotion) return;

    const controls = animate(0, wordsLearned, {
      duration: countUpDuration(wordsLearned, reduceMotion),
      ease: "easeOut",
      onUpdate: (value) => setDisplayCount(Math.round(value)),
    });

    return () => controls.stop();
  }, [phase, wordsLearned, reduceMotion]);

  return (
    <StorybookShell
      cardAriaLabel="Story complete"
      frameClassName="max-sm:h-dvh max-sm:overflow-y-hidden sm:items-center sm:justify-center sm:py-8"
      cardClassName="flex min-h-0 flex-1 flex-col max-sm:min-h-dvh sm:max-w-150 lg:max-w-225"
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
            {phase === "coloring" ? (
              <ColoringPhase key="coloring" />
            ) : (
              <CelebrationPhase
                key="celebration"
                displayCount={shownCount}
                learnedWordIds={learnedWordIds}
                exploredEndingIds={exploredEndingIds}
                onReadAgain={onReadAgain}
                onDiscoverAlternateEnding={onDiscoverAlternateEnding}
              />
            )}
            </AnimatePresence>
          </div>
        </div>
    </StorybookShell>
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
