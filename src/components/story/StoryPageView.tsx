"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { type StoryPage } from "@/lib/story-data";
import { cn } from "@/lib/utils";

type StoryPageViewProps = {
  page: StoryPage;
  wordsLearned: number;
  resolvedWordIds: string[];
  canAdvance: boolean;
  isLastPage: boolean;
  onMysteryClick: (wordId: string) => void;
  onNextPage: () => void;
};

type PageTurnPhase = "idle" | "exit" | "enter";

const PAGE_TURN_MS = 350;

export function StoryPageView({
  page,
  wordsLearned,
  resolvedWordIds,
  canAdvance,
  isLastPage,
  onMysteryClick,
  onNextPage,
}: StoryPageViewProps) {
  const [turnPhase, setTurnPhase] = useState<PageTurnPhase>("idle");
  const advancePage = useEffectEvent(() => {
    onNextPage();
  });

  useEffect(() => {
    if (turnPhase !== "exit") return;
    const timer = window.setTimeout(() => {
      advancePage();
      setTurnPhase("enter");
    }, PAGE_TURN_MS);
    return () => window.clearTimeout(timer);
  }, [turnPhase]);

  useEffect(() => {
    if (turnPhase !== "enter") return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTurnPhase("idle"));
    });
    return () => cancelAnimationFrame(frame);
  }, [turnPhase]);

  function handleNextPage() {
    if (turnPhase !== "idle" || !canAdvance || isLastPage) return;
    setTurnPhase("exit");
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <SceneAtmosphere />

      <div className="relative z-10 hidden justify-center px-5 pt-4 sm:flex sm:pt-6">
        <WordsLearned count={wordsLearned} />
      </div>

      <article
        className={cn(
          "relative z-10 flex w-full flex-none flex-col",
          // Tablet: centered story card (~600–700px)
          "sm:mx-auto sm:mb-8 sm:mt-4 sm:max-w-175 sm:overflow-hidden sm:rounded-3xl sm:bg-card",
          // Desktop: wider book card (~800–900px)
          "lg:max-w-225",
          "origin-center will-change-transform",
          turnPhase === "exit" &&
            "translate-x-[-12%] scale-[0.96] opacity-0 transition-[opacity,transform] duration-350 ease-out",
          turnPhase === "enter" &&
            "translate-x-[12%] opacity-0 transition-none",
          turnPhase === "idle" &&
            "translate-x-0 scale-100 opacity-100 transition-[opacity,transform] duration-350 ease-out",
        )}
      >
        <div
          className={cn(
            "flex flex-col",
            // Tablet: image | text side-by-side; items-start keeps image sized by aspect-ratio
            "sm:flex-row sm:items-start",
            // Desktop: stacked banner → text
            "lg:flex-col",
          )}
        >
          <SceneImage src={page.image} alt={page.title} />

          <div
            className={cn(
              "flex min-w-0 flex-col px-5 pb-8 pt-6",
              "sm:flex-1 sm:px-6 sm:pb-6 sm:pt-6",
              "lg:flex-none lg:px-10 lg:pb-8 lg:pt-8",
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

            <div className="relative z-10 mt-8 self-center sm:hidden">
              <WordsLearned count={wordsLearned} />
            </div>

            <PageProgression
              isLastPage={isLastPage}
              canAdvance={canAdvance && turnPhase === "idle"}
              onNextPage={handleNextPage}
              className="relative z-10 mt-6 flex w-full sm:mt-auto sm:justify-end sm:pt-8"
            />
          </div>
        </div>
      </article>
    </div>
  );
}

function PageProgression({
  isLastPage,
  canAdvance,
  onNextPage,
  className,
}: {
  isLastPage: boolean;
  canAdvance: boolean;
  onNextPage: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {isLastPage ? (
        <p className="font-heading text-lg font-semibold text-magic">
          The End of this adventure!
        </p>
      ) : (
        <Button
          size="kid"
          className="w-full min-h-14 sm:w-auto"
          onClick={onNextPage}
          disabled={!canAdvance}
          aria-label="Next Page"
        >
          Next Page
        </Button>
      )}
    </div>
  );
}

/** Scene block — aspect-ratio per responsive-layout; crops via object-cover. */
function SceneImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div
      className={cn(
        "w-full shrink-0 self-start bg-magic/10",
        // Mobile only: 4/5, capped so title stays above the fold (max-sm avoids
        // fighting sm:max-h-none specificity with the arbitrary max-h value)
        "aspect-4/5 max-sm:max-h-[32vh]",
        // Tablet: 1/1 left column — height from aspect-ratio, not stretched to text
        "sm:aspect-square sm:h-auto sm:w-1/2 sm:self-start",
        // Desktop: 3/1 banner strip at top of book card
        "lg:aspect-3/1 lg:w-full",
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : null}
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
          : "mx-0.5 inline rounded-md bg-magic/15 px-1 font-semibold text-magic underline decoration-magic decoration-wavy underline-offset-4 transition-colors lg:hover:bg-magic/25"
      }
    >
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
  return (
    <div
      className={cn(
        "relative z-10 flex items-center gap-2 rounded-full bg-magic/10 px-4 py-1.5 text-magic",
        className,
      )}
    >
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
