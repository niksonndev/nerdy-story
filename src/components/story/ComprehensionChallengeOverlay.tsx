"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ChallengeWaitingState } from "@/components/story/loading/ChallengeWaitingState";
import { StoryPuzzleLoader } from "@/components/story/loading/StoryPuzzleLoader";
import {
  dialogCloseButtonClassName,
  useDialogA11y,
} from "@/lib/a11y/use-dialog-a11y";
import { CHILD_ANSWER_MAX_LENGTH } from "@/lib/grade/child-input";
import { type ChallengePhase } from "@/lib/story/types";
import { type ComprehensionChallenge } from "@/lib/story-data";

type ComprehensionChallengeOverlayProps = {
  open: boolean;
  challenge: ComprehensionChallenge | null;
  phase: ChallengePhase;
  value: string;
  missReason: string | null;
  hintText: string | null;
  acceptedReason: string | null;
  onChange: (value: string) => void;
  onCheck: () => void;
  onContinue: () => void;
  onClose: () => void;
};

export function ComprehensionChallengeOverlay({
  open,
  challenge,
  phase,
  value,
  missReason,
  hintText,
  acceptedReason,
  onChange,
  onCheck,
  onContinue,
  onClose,
}: ComprehensionChallengeOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const feedbackId = useId();

  useDialogA11y({
    open: open && challenge !== null,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: phase === "prompt" ? inputRef : undefined,
  });

  const spring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <AnimatePresence>
      {open && challenge ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            aria-label="Story question"
            aria-labelledby={phase === "prompt" ? titleId : undefined}
            aria-describedby={
              phase === "prompt" && missReason ? feedbackId : undefined
            }
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            transition={spring}
            className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 pt-14 shadow-2xl sm:p-8 sm:pt-14"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={dialogCloseButtonClassName}
            >
              <X className="size-6" aria-hidden />
            </button>

            {phase === "waiting" ? (
              <ChallengeWaitingState text="Connecting the thoughts...">
                <StoryPuzzleLoader />
              </ChallengeWaitingState>
            ) : phase === "accepted" ? (
              <AcceptedState
                reason={acceptedReason}
                onContinue={onContinue}
                reduceMotion={Boolean(reduceMotion)}
              />
            ) : phase === "reveal" ? (
              <RevealState challenge={challenge} onContinue={onContinue} />
            ) : (
              <PromptState
                challenge={challenge}
                value={value}
                missReason={missReason}
                hintText={hintText}
                inputRef={inputRef}
                titleId={titleId}
                feedbackId={feedbackId}
                onChange={onChange}
                onCheck={onCheck}
              />
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PromptState({
  challenge,
  value,
  missReason,
  hintText,
  inputRef,
  titleId,
  feedbackId,
  onChange,
  onCheck,
}: {
  challenge: ComprehensionChallenge;
  value: string;
  missReason: string | null;
  hintText: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  titleId: string;
  feedbackId: string;
  onChange: (value: string) => void;
  onCheck: () => void;
}) {
  const answerFieldId = useId();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim().length === 0) return;
        onCheck();
      }}
    >
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-magic-ink">
        Story question
      </p>
      <h2
        id={titleId}
        className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl"
      >
        {challenge.question}
      </h2>

      <div
        id={feedbackId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-4"
      >
        {missReason ? (
          <div className="rounded-2xl border-2 border-dashed border-reward/50 bg-accent/60 p-4 text-foreground/90">
            <p className="font-heading font-semibold text-foreground">
              <span aria-hidden className="mr-1.5 text-reward">
                {"\u21BB"}
              </span>
              Try another idea!
            </p>
            <p className="mt-1 leading-relaxed">{missReason}</p>
            {hintText ? (
              <p className="mt-2 leading-relaxed">
                <span className="font-semibold">Hint:</span> {hintText}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <label htmlFor={answerFieldId} className="sr-only">
        Your answer to the story question
      </label>
      <textarea
        id={answerFieldId}
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && value.trim()) {
            event.preventDefault();
            onCheck();
          }
        }}
        rows={3}
        maxLength={CHILD_ANSWER_MAX_LENGTH}
        placeholder="Type your idea here..."
        className="mt-4 w-full resize-none rounded-2xl border-2 border-border bg-background p-4 font-sans text-lg text-foreground outline-none placeholder:text-muted-foreground focus:border-magic focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <Button
        type="submit"
        size="kid"
        className="mt-4 w-full"
        disabled={value.trim().length === 0}
      >
        Check
      </Button>
    </form>
  );
}

function AcceptedState({
  reason,
  onContinue,
  reduceMotion,
}: {
  reason: string | null;
  onContinue: () => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="text-center">
      <motion.div
        initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { type: "spring", stiffness: 400, damping: 18 }
        }
        className="mx-auto text-5xl"
        aria-hidden
      >
        {"\uD83C\uDF1F"}
      </motion.div>
      <div role="status" aria-live="polite" aria-atomic="true">
        <h2 className="mt-3 font-heading text-2xl font-bold text-magic-ink">
          You got it!
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-foreground/90">
          {reason ?? "That matches what happened in the story."}
        </p>
      </div>
      <Button size="kid" className="mt-6 w-full" onClick={onContinue}>
        Keep going
      </Button>
    </div>
  );
}

function RevealState({
  challenge,
  onContinue,
}: {
  challenge: ComprehensionChallenge;
  onContinue: () => void;
}) {
  return (
    <div className="text-center">
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-reward-ink">
          Here&apos;s the idea
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-foreground">
          {challenge.question}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">
          {challenge.answerReveal}
        </p>
      </div>
      <Button size="kid" className="mt-6 w-full" onClick={onContinue}>
        Got it
      </Button>
    </div>
  );
}
