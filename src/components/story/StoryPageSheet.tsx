"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft } from "lucide-react";

import { BranchChoice } from "@/components/story/BranchChoice";
import { SceneImage } from "@/components/story/scene-image";
import { Button } from "@/components/ui/button";
import { firstMysteryPageId, mysteryWordIdsFor } from "@/lib/story/page-helpers";
import {
  isNearSheetBottom,
  isOutsideScrollport,
} from "@/lib/story/sheet-scroll";
import { type StoryPage } from "@/lib/story/story-data";
import { cn } from "@/lib/utils";

export const VOCAB_GATE_COPY = "Tap the glowing word to keep going";

const FIRST_MYSTERY_PAGE_ID = firstMysteryPageId();

export function StoryPageSheet({
  page,
  interactive,
  canAdvance,
  canGoBack,
  resolvedWordIds,
  vocabUnresolved,
  comprehensionPending,
  challengeOpen = false,
  onMysteryClick,
  onNextPage,
  onPreviousPage,
  onChoosePath,
}: {
  page: StoryPage;
  interactive: boolean;
  canAdvance: boolean;
  canGoBack: boolean;
  resolvedWordIds: string[];
  vocabUnresolved: boolean;
  comprehensionPending: boolean;
  challengeOpen?: boolean;
  onMysteryClick: (wordId: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onChoosePath: (nextPageId: string) => void;
}) {
  const isDecision = Boolean(page.choice);
  const showDecisionBack = isDecision && canGoBack;
  const firstMystery =
    interactive && vocabUnresolved && page.id === FIRST_MYSTERY_PAGE_ID;
  const articleRef = useRef<HTMLElement>(null);
  const mysteryRef = useRef<HTMLButtonElement>(null);
  const stalledRef = useRef(false);
  const didNudgeScroll = useRef(false);
  const [stalled, setStalled] = useState(false);
  const reduceMotion = useReducedMotion();

  if (!firstMystery && stalled) {
    setStalled(false);
  }

  useEffect(() => {
    if (!firstMystery) {
      stalledRef.current = false;
      didNudgeScroll.current = false;
      return;
    }

    const article = articleRef.current;
    if (!article) return;

    function check() {
      if (stalledRef.current || !article) return;
      if (!isNearSheetBottom(article)) return;
      stalledRef.current = true;
      setStalled(true);
    }

    check();
    article.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      article.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [firstMystery]);

  useEffect(() => {
    if (!stalled || !firstMystery || didNudgeScroll.current) return;
    const article = articleRef.current;
    const word = mysteryRef.current;
    if (!article || !word) return;
    if (!isOutsideScrollport(article, word)) return;
    didNudgeScroll.current = true;
    word.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [stalled, firstMystery, reduceMotion]);

  return (
    <article
      ref={articleRef}
      className={cn(
        "h-full w-full overflow-y-auto bg-card",
        !interactive && "pointer-events-none select-none",
      )}
      {...(!interactive ? { inert: true } : {})}
    >
      {/* sm+: fill the sheet so nav pins to the card bottom; overflow still scrolls as one unit */}
      <div className="flex flex-col sm:min-h-full">
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
            "sm:flex-1 sm:px-10 sm:pb-8 sm:pt-8",
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
                    ref={firstMystery ? mysteryRef : undefined}
                    label={segment.content}
                    resolved={isResolved}
                    cue={interactive && !isResolved}
                    discoverable={firstMystery && !isResolved}
                    stalled={stalled}
                    onClick={() => onMysteryClick(segment.wordId)}
                  />
                );
              }
              return <span key={index}>{segment.content}</span>;
            })}
          </p>

          <PageProgression
            page={page}
            interactive={interactive}
            canAdvance={canAdvance}
            canGoBack={canGoBack}
            vocabUnresolved={vocabUnresolved}
            comprehensionPending={comprehensionPending}
            challengeOpen={challengeOpen}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            onChoosePath={onChoosePath}
            className={cn(
              "relative z-10 mt-4 flex w-full shrink-0",
              !isDecision &&
                "max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-4",
              "sm:mt-auto sm:pt-4",
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

function VocabGateStatus() {
  return (
    <p
      role="status"
      className="flex min-h-14 flex-1 items-center justify-center px-3 text-center font-heading text-base font-semibold text-magic-ink sm:ml-auto sm:w-auto sm:flex-none sm:text-lg"
    >
      {VOCAB_GATE_COPY}
    </p>
  );
}

function UnlockedPrimary({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const play = active && !reduceMotion;

  return (
    <motion.div
      className={className}
      initial={play ? { scale: 0.94 } : false}
      animate={play ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={play ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}

function PageProgression({
  page,
  interactive,
  canAdvance,
  canGoBack,
  vocabUnresolved,
  comprehensionPending,
  challengeOpen,
  onNextPage,
  onPreviousPage,
  onChoosePath,
  className,
}: {
  page: StoryPage;
  interactive: boolean;
  canAdvance: boolean;
  canGoBack: boolean;
  vocabUnresolved: boolean;
  comprehensionPending: boolean;
  challengeOpen: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onChoosePath: (nextPageId: string) => void;
  className?: string;
}) {
  const isLastPage = !page.nextPageId && !page.choice;
  const pageHasMystery = mysteryWordIdsFor(page).length > 0;
  const showContinueAttention =
    interactive &&
    pageHasMystery &&
    !vocabUnresolved &&
    !challengeOpen &&
    !isLastPage;
  const readingRowClass = cn(
    "flex w-full flex-row items-center gap-3",
    "sm:justify-between",
    className,
  );

  if (page.choice) {
    if (vocabUnresolved) {
      return (
        <div className={cn("flex w-full flex-col gap-3", className)}>
          {interactive ? <VocabGateStatus /> : null}
        </div>
      );
    }
    return (
      <div className={cn("flex w-full flex-col gap-3", className)}>
        <UnlockedPrimary active={showContinueAttention} className="w-full">
          <BranchChoice
            choice={page.choice}
            disabled={!canAdvance}
            onChoose={onChoosePath}
          />
        </UnlockedPrimary>
      </div>
    );
  }

  if (vocabUnresolved) {
    return (
      <div className={readingRowClass}>
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
        {interactive ? <VocabGateStatus /> : null}
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

  const nextLabel = comprehensionPending ? "A story question" : "Next Page";

  return (
    <div className={readingRowClass}>
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
      <UnlockedPrimary
        active={showContinueAttention && !comprehensionPending}
        className="min-h-14 flex-1 sm:ml-auto sm:w-auto sm:flex-none"
      >
        <Button
          size="kid"
          className="min-h-14 w-full"
          onClick={onNextPage}
          disabled={!canAdvance}
          aria-label={nextLabel}
        >
          {nextLabel}
        </Button>
      </UnlockedPrimary>
    </div>
  );
}

const MYSTERY_CUE = { scale: [1, 1.06, 1] };
const MYSTERY_STALL = { scale: [1, 1.1, 1] };
const MYSTERY_STILL = { scale: 1 };

function MysteryWord({
  label,
  resolved,
  cue,
  discoverable,
  stalled,
  onClick,
  ref,
}: {
  label: string;
  resolved: boolean;
  cue: boolean;
  discoverable: boolean;
  stalled: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const reduceMotion = useReducedMotion();
  const showAttention = cue && !reduceMotion;
  const attention = stalled ? MYSTERY_STALL : MYSTERY_CUE;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => {
        if (!resolved) onClick();
      }}
      aria-label={
        resolved ? `Learned word: ${label}` : `Mystery word: ${label}`
      }
      aria-disabled={resolved}
      animate={showAttention ? attention : MYSTERY_STILL}
      transition={
        showAttention
          ? { duration: 0.5, ease: "easeOut" }
          : { duration: 0 }
      }
      whileTap={reduceMotion || resolved ? undefined : { scale: 0.94 }}
      className={cn(
        // Inline hit slate ≥44px tall without breaking sentence flow
        "mx-0.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-1.5 py-1 align-baseline font-semibold text-foreground",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        resolved
          ? "bg-reward/20"
          : "bg-magic/20 ring-1 ring-magic/40 underline decoration-magic decoration-wavy underline-offset-4 sm:underline-offset-8 transition-colors lg:hover:bg-magic/30",
        discoverable && "mystery-word-glow",
        discoverable && stalled && "mystery-word-glow-nudge",
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
