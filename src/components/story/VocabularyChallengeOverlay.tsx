"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ChallengeWaitingState } from "@/components/story/loading/ChallengeWaitingState";
import { DictionaryScanLoader } from "@/components/story/loading/DictionaryScanLoader";
import { SpeakableMysteryWord } from "@/components/story/SpeakableMysteryWord";
import { stopWordAudio } from "@/lib/speech/play-word-audio";
import {
  dialogCloseButtonClassName,
  useDialogA11y,
} from "@/lib/a11y/use-dialog-a11y";
import { CHILD_ANSWER_MAX_LENGTH } from "@/lib/grade/child-input";
import { type MysteryWord } from "@/lib/story/story-data";
import { type ChallengePhase } from "@/lib/story/types";

type VocabularyChallengeOverlayProps = {
  open: boolean;
  word: MysteryWord | null;
  phase: ChallengePhase;
  value: string;
  missReason: string | null;
  hintText: string | null;
  acceptedReason: string | null;
  onChange: (value: string) => void;
  onCheck: () => void;
  onClose: () => void;
};

export function VocabularyChallengeOverlay({
  open,
  word,
  phase,
  value,
  missReason,
  hintText,
  acceptedReason,
  onChange,
  onCheck,
  onClose,
}: VocabularyChallengeOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const instructionsId = useId();
  const feedbackId = useId();

  useDialogA11y({
    open: open && word !== null,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: phase === "prompt" ? inputRef : undefined,
  });

  useEffect(() => {
    if (!open) return;
    return () => stopWordAudio();
  }, [open]);

  const spring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <AnimatePresence>
      {open && word ? (
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
            aria-label={`Word challenge: ${word.word}`}
            aria-describedby={
              phase === "prompt"
                ? `${instructionsId}${missReason ? ` ${feedbackId}` : ""}`
                : undefined
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
              <ChallengeWaitingState text="Checking the dictionary...">
                <DictionaryScanLoader />
              </ChallengeWaitingState>
            ) : phase === "accepted" ? (
              <AcceptedState
                word={word}
                reason={acceptedReason}
                onClose={onClose}
                reduceMotion={Boolean(reduceMotion)}
              />
            ) : phase === "reveal" ? (
              <RevealState word={word} onClose={onClose} />
            ) : (
              <PromptState
                word={word}
                value={value}
                missReason={missReason}
                hintText={hintText}
                inputRef={inputRef}
                instructionsId={instructionsId}
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
  word,
  value,
  missReason,
  hintText,
  inputRef,
  instructionsId,
  feedbackId,
  onChange,
  onCheck,
}: {
  word: MysteryWord;
  value: string;
  missReason: string | null;
  hintText: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  instructionsId: string;
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
        Mystery word
      </p>
      <h2 className="mt-1">
        <SpeakableMysteryWord
          wordId={word.id}
          word={word.word}
          className="font-heading text-4xl font-bold text-foreground"
        />
      </h2>
      <p
        id={instructionsId}
        className="mt-4 text-lg leading-relaxed text-foreground/90"
      >
        Explain what you understand by{" "}
        <span className="font-semibold text-magic-ink">{word.word}</span>.
      </p>

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
        Your idea for {word.word}
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
  word,
  reason,
  onClose,
  reduceMotion,
}: {
  word: MysteryWord;
  reason: string | null;
  onClose: () => void;
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
          {reason ?? `A ${word.word} is a safe, covered place.`}
        </p>
      </div>
      <Button size="kid" className="mt-6 w-full" onClick={onClose}>
        Keep reading
      </Button>
    </div>
  );
}

function RevealState({
  word,
  onClose,
}: {
  word: MysteryWord;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-reward-ink">
          Here&apos;s what it means
        </p>
        <h2 className="mt-1">
          <SpeakableMysteryWord
            wordId={word.id}
            word={word.word}
            className="font-heading text-3xl font-bold text-foreground"
          />
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">
          {word.meaningReveal}
        </p>
      </div>
      <Button size="kid" className="mt-6 w-full" onClick={onClose}>
        Got it
      </Button>
    </div>
  );
}
