"use client";

import { useId, useRef } from "react";

import {
  ChallengeAcceptedState,
  ChallengeAnswerForm,
  ChallengeDialog,
  ChallengeOverlayFields,
  ChallengePhaseSwitch,
  ChallengeRevealState,
} from "@/components/story/ChallengeDialog";
import { ChallengeWaitingState } from "@/components/story/loading/ChallengeWaitingState";
import { StoryPuzzleLoader } from "@/components/story/loading/StoryPuzzleLoader";
import { type ComprehensionChallenge } from "@/lib/story/story-data";

type ComprehensionChallengeOverlayProps = ChallengeOverlayFields & {
  challenge: ComprehensionChallenge | null;
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
  const titleId = useId();
  const feedbackId = useId();
  const visible = open && challenge !== null;

  return (
    <ChallengeDialog
      open={visible}
      onClose={onClose}
      aria-label="Story question"
      aria-labelledby={visible && phase === "prompt" ? titleId : undefined}
      aria-describedby={
        visible && phase === "prompt" && missReason ? feedbackId : undefined
      }
      initialFocusRef={phase === "prompt" ? inputRef : undefined}
    >
      {challenge ? (
        <ChallengePhaseSwitch
          phase={phase}
          waiting={
            <ChallengeWaitingState text="Connecting the thoughts...">
              <StoryPuzzleLoader />
            </ChallengeWaitingState>
          }
          accepted={
            <ChallengeAcceptedState
              reason={
                acceptedReason ?? "That matches what happened in the story."
              }
              continueLabel="Keep going"
              onContinue={onContinue}
            />
          }
          reveal={
            <ChallengeRevealState
              eyebrow="Here's the idea"
              title={challenge.question}
              titleClassName="mt-1 font-heading text-2xl font-bold text-foreground"
              body={challenge.answerReveal}
              continueLabel="Got it"
              onContinue={onContinue}
            />
          }
          prompt={
            <ChallengeAnswerForm
              value={value}
              missReason={missReason}
              hintText={hintText}
              inputRef={inputRef}
              feedbackId={feedbackId}
              fieldLabel="Your answer to the story question"
              onChange={onChange}
              onCheck={onCheck}
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
            </ChallengeAnswerForm>
          }
        />
      ) : null}
    </ChallengeDialog>
  );
}
