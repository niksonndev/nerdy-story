"use client";

import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { type StoryPage } from "@/lib/story-data";

type StoryPageViewProps = {
  page: StoryPage;
  wordsLearned: number;
  resolvedWordIds: string[];
  canAdvance: boolean;
  isLastPage: boolean;
  onMysteryClick: (wordId: string) => void;
  onNextPage: () => void;
};

export function StoryPageView({
  page,
  wordsLearned,
  resolvedWordIds,
  canAdvance,
  isLastPage,
  onMysteryClick,
  onNextPage,
}: StoryPageViewProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center px-5 pb-10 pt-6 sm:pt-10">
      <SceneAtmosphere />

      <WordsLearned count={wordsLearned} />

      <motion.article
        key={page.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mt-6 flex w-full max-w-2xl flex-1 flex-col"
      >
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {page.title}
        </h1>

        <p className="mt-6 text-lg leading-[1.75] text-foreground/90 sm:text-xl sm:leading-[1.8]">
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

        <div className="mt-auto flex justify-center pt-12">
          {isLastPage ? (
            <p className="font-heading text-lg font-semibold text-magic">
              The End of this adventure!
            </p>
          ) : (
            <Button
              size="kid"
              onClick={onNextPage}
              disabled={!canAdvance}
              aria-label="Next Page"
            >
              Next Page
            </Button>
          )}
        </div>
      </motion.article>
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
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={
        resolved
          ? "mx-0.5 inline rounded-md bg-reward/20 px-1 font-semibold text-reward decoration-reward/60 underline decoration-wavy underline-offset-4"
          : "mx-0.5 inline rounded-md bg-magic/15 px-1 font-semibold text-magic underline decoration-magic decoration-wavy underline-offset-4 transition-colors hover:bg-magic/25"
      }
    >
      {label}
    </motion.button>
  );
}

function WordsLearned({ count }: { count: number }) {
  return (
    <div className="relative z-10 flex items-center gap-2 rounded-full bg-magic/10 px-4 py-1.5 text-magic">
      <span aria-hidden className="text-lg">
        {"\u2728"}
      </span>
      <span className="font-heading text-sm font-semibold uppercase tracking-wide">
        Words learned
      </span>
      <div className="relative h-6 w-6 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: 14, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="absolute inset-0 font-heading text-lg font-bold text-reward"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
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
