"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft } from "lucide-react";

import { BranchChoice } from "@/components/story/BranchChoice";
import { SceneImage } from "@/components/story/scene-image";
import { Button } from "@/components/ui/button";
import { type StoryPage } from "@/lib/story/story-data";
import { cn } from "@/lib/utils";

export function StoryPageSheet({
  page,
  interactive,
  isLastPage,
  canAdvance,
  canGoBack,
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
                  disabled={!canGoBack}
                  onClick={onPreviousPage}
                  className="absolute top-3 left-3 z-20 sm:hidden"
                />
                <PreviousControl
                  variant="backLink"
                  disabled={!canGoBack}
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
          disabled={!canGoBack}
          onClick={onPreviousPage}
          className="sm:hidden"
        />
        <PreviousControl
          variant="outline"
          disabled={!canGoBack}
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
            disabled={!canGoBack}
            onClick={onPreviousPage}
            className="sm:hidden"
          />
          <PreviousControl
            variant="outline"
            disabled={!canGoBack}
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
