"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { type MysteryWord } from "@/lib/story-data";

export type ChallengePhase = "prompt" | "waiting" | "accepted" | "reveal";

type VocabChallengeOverlayProps = {
  open: boolean;
  word: MysteryWord | null;
  phase: ChallengePhase;
  value: string;
  lastReason: string | null;
  hintText: string | null;
  acceptedReason: string | null;
  onChange: (value: string) => void;
  onCheck: () => void;
  onClose: () => void;
};

export function VocabChallengeOverlay({
  open,
  word,
  phase,
  value,
  lastReason,
  hintText,
  acceptedReason,
  onChange,
  onCheck,
  onClose,
}: VocabChallengeOverlayProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && phase === "prompt") {
      inputRef.current?.focus();
    }
  }, [open, phase]);

  return (
    <AnimatePresence>
      {open && word ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Word challenge: ${word.word}`}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl sm:p-8"
          >
            {phase === "waiting" ? (
              <WaitingState />
            ) : phase === "accepted" ? (
              <AcceptedState
                word={word}
                reason={acceptedReason}
                onClose={onClose}
              />
            ) : phase === "reveal" ? (
              <RevealState word={word} onClose={onClose} />
            ) : (
              <PromptState
                word={word}
                value={value}
                lastReason={lastReason}
                hintText={hintText}
                inputRef={inputRef}
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
  lastReason,
  hintText,
  inputRef,
  onChange,
  onCheck,
}: {
  word: MysteryWord;
  value: string;
  lastReason: string | null;
  hintText: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onCheck: () => void;
}) {
  return (
    <div>
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-magic">
        Mystery word
      </p>
      <h2 className="mt-1 font-heading text-4xl font-bold text-foreground">
        {word.word}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90">
        Explain what you understand by{" "}
        <span className="font-semibold text-magic">{word.word}</span>.
      </p>

      {lastReason ? (
        <div className="mt-4 rounded-2xl bg-accent/60 p-4 text-foreground/90">
          <p className="font-heading font-semibold text-reward">
            Try another idea!
          </p>
          <p className="mt-1 leading-relaxed">{lastReason}</p>
          {hintText ? (
            <p className="mt-2 leading-relaxed">
              <span className="font-semibold">Hint:</span> {hintText}
            </p>
          ) : null}
        </div>
      ) : null}

      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="Type your idea here..."
        className="mt-4 w-full resize-none rounded-2xl border-2 border-border bg-background p-4 text-lg text-foreground outline-none placeholder:text-muted-foreground focus:border-magic"
      />

      <Button
        size="kid"
        className="mt-4 w-full"
        onClick={onCheck}
        disabled={value.trim().length === 0}
      >
        Check
      </Button>
    </div>
  );
}

function WaitingState() {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl"
        aria-hidden
      >
        {"\uD83D\uDCD6"}
      </motion.div>
      <p className="mt-4 font-heading text-xl font-semibold text-foreground">
        Checking dictionary...
      </p>
    </div>
  );
}

function AcceptedState({
  word,
  reason,
  onClose,
}: {
  word: MysteryWord;
  reason: string | null;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="mx-auto text-5xl"
        aria-hidden
      >
        {"\uD83C\uDF1F"}
      </motion.div>
      <h2 className="mt-3 font-heading text-2xl font-bold text-magic">
        You got it!
      </h2>
      <p className="mt-3 text-lg leading-relaxed text-foreground/90">
        {reason ?? `A ${word.word} is a safe, covered place.`}
      </p>
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
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-reward">
        Here&apos;s what it means
      </p>
      <h2 className="mt-1 font-heading text-3xl font-bold text-foreground">
        {word.word}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90">
        {word.meaningReveal}
      </p>
      <Button size="kid" className="mt-6 w-full" onClick={onClose}>
        Got it
      </Button>
    </div>
  );
}
