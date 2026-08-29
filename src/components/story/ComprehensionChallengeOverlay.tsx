'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { ChallengeWaitingState } from '@/components/story/loading/ChallengeWaitingState';
import { StoryPuzzleLoader } from '@/components/story/loading/StoryPuzzleLoader';
import { type ChallengePhase } from "@/lib/story/types";
import { type ComprehensionChallenge } from '@/lib/story-data';

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && phase === 'prompt') {
      inputRef.current?.focus();
    }
  }, [open, phase]);

  return (
    <AnimatePresence>
      {open && challenge ? (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role='dialog'
            aria-modal='true'
            aria-label='Story question'
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className='relative z-10 w-full max-w-md rounded-3xl bg-card p-6 pt-14 shadow-2xl sm:p-8 sm:pt-14'
          >
            <button
              type='button'
              onClick={onClose}
              aria-label='Close'
              className='absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-muted text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground'
            >
              <X className='size-6' aria-hidden />
            </button>

            {phase === 'waiting' ? (
              <ChallengeWaitingState text='Connecting the thoughts...'>
                <StoryPuzzleLoader />
              </ChallengeWaitingState>
            ) : phase === 'accepted' ? (
              <AcceptedState reason={acceptedReason} onContinue={onContinue} />
            ) : phase === 'reveal' ? (
              <RevealState challenge={challenge} onContinue={onContinue} />
            ) : (
              <PromptState
                challenge={challenge}
                value={value}
                missReason={missReason}
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
  challenge,
  value,
  missReason,
  hintText,
  inputRef,
  onChange,
  onCheck,
}: {
  challenge: ComprehensionChallenge;
  value: string;
  missReason: string | null;
  hintText: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onCheck: () => void;
}) {
  return (
    <div>
      <p className='font-heading text-sm font-semibold uppercase tracking-wide text-magic'>
        Story question
      </p>
      <h2 className='mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl'>
        {challenge.question}
      </h2>

      {missReason ? (
        <div className='mt-4 rounded-2xl bg-accent/60 p-4 text-foreground/90'>
          <p className='font-heading font-semibold text-reward'>
            Try another idea!
          </p>
          <p className='mt-1 leading-relaxed'>{missReason}</p>
          {hintText ? (
            <p className='mt-2 leading-relaxed'>
              <span className='font-semibold'>Hint:</span> {hintText}
            </p>
          ) : null}
        </div>
      ) : null}

      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder='Type your idea here...'
        className='mt-4 w-full resize-none rounded-2xl border-2 border-border bg-background p-4 text-lg text-foreground outline-none placeholder:text-muted-foreground focus:border-magic'
      />

      <Button
        size='kid'
        className='mt-4 w-full'
        onClick={onCheck}
        disabled={value.trim().length === 0}
      >
        Check
      </Button>
    </div>
  );
}

function AcceptedState({
  reason,
  onContinue,
}: {
  reason: string | null;
  onContinue: () => void;
}) {
  return (
    <div className='text-center'>
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className='mx-auto text-5xl'
        aria-hidden
      >
        {'\uD83C\uDF1F'}
      </motion.div>
      <h2 className='mt-3 font-heading text-2xl font-bold text-magic'>
        You got it!
      </h2>
      <p className='mt-3 text-lg leading-relaxed text-foreground/90'>
        {reason ?? 'That matches what happened in the story.'}
      </p>
      <Button size='kid' className='mt-6 w-full' onClick={onContinue}>
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
    <div className='text-center'>
      <p className='font-heading text-sm font-semibold uppercase tracking-wide text-reward'>
        Here&apos;s the idea
      </p>
      <h2 className='mt-1 font-heading text-2xl font-bold text-foreground'>
        {challenge.question}
      </h2>
      <p className='mt-4 text-lg leading-relaxed text-foreground/90'>
        {challenge.answerReveal}
      </p>
      <Button size='kid' className='mt-6 w-full' onClick={onContinue}>
        Got it
      </Button>
    </div>
  );
}
