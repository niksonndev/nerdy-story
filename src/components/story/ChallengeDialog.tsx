"use client";

import { useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  dialogCloseButtonClassName,
  useDialogA11y,
} from "@/lib/a11y/use-dialog-a11y";
import { CHILD_ANSWER_MAX_LENGTH } from "@/lib/grade/child-input";

type ChallengeDialogProps = {
  open: boolean;
  onClose: () => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export function ChallengeDialog({
  open,
  onClose,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  initialFocusRef,
  children,
}: ChallengeDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useDialogA11y({
    open,
    onClose,
    containerRef: dialogRef,
    initialFocusRef,
  });

  const spring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <AnimatePresence>
      {open ? (
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
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }
            }
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }
            }
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
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ChallengeMissFeedback({
  missReason,
  hintText,
  feedbackId,
}: {
  missReason: string | null;
  hintText: string | null;
  feedbackId: string;
}) {
  return (
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
  );
}

export function ChallengeAnswerForm({
  value,
  missReason,
  hintText,
  inputRef,
  feedbackId,
  fieldLabel,
  onChange,
  onCheck,
  children,
}: {
  value: string;
  missReason: string | null;
  hintText: string | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  feedbackId: string;
  fieldLabel: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  children: ReactNode;
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
      {children}

      <ChallengeMissFeedback
        missReason={missReason}
        hintText={hintText}
        feedbackId={feedbackId}
      />

      <label htmlFor={answerFieldId} className="sr-only">
        {fieldLabel}
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

export function ChallengeAcceptedState({
  reason,
  continueLabel,
  onContinue,
}: {
  reason: string;
  continueLabel: string;
  onContinue: () => void;
}) {
  const reduceMotion = useReducedMotion();

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
          {reason}
        </p>
      </div>
      <Button size="kid" className="mt-6 w-full" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}

export function ChallengeRevealState({
  eyebrow,
  title,
  titleClassName,
  body,
  continueLabel,
  onContinue,
}: {
  eyebrow: string;
  title: ReactNode;
  titleClassName?: string;
  body: string;
  continueLabel: string;
  onContinue: () => void;
}) {
  return (
    <div className="text-center">
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-reward-ink">
          {eyebrow}
        </p>
        <h2 className={titleClassName ?? "mt-1"}>{title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">{body}</p>
      </div>
      <Button size="kid" className="mt-6 w-full" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}
