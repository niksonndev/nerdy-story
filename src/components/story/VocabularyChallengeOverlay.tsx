"use client";

import { useEffect, useId, useRef } from "react";

import {
  ChallengeAcceptedState,
  ChallengeAnswerForm,
  ChallengeDialog,
  ChallengeOverlayFields,
  ChallengePhaseSwitch,
  ChallengeRevealState,
} from "@/components/story/ChallengeUi";
import { ChallengeWaitingState } from "@/components/story/loading/ChallengeWaitingState";
import { DictionaryScanLoader } from "@/components/story/loading/DictionaryScanLoader";
import { SpeakableMysteryWord } from "@/components/story/SpeakableMysteryWord";
import { stopWordAudio } from "@/lib/speech/play-word-audio";
import { type MysteryWord } from "@/lib/story/story-data";

type VocabularyChallengeOverlayProps = ChallengeOverlayFields & {
  word: MysteryWord | null;
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const instructionsId = useId();
  const feedbackId = useId();
  const visible = open && word !== null;

  useEffect(() => {
    if (!open) return;
    return () => stopWordAudio();
  }, [open]);

  return (
    <ChallengeDialog
      open={visible}
      onClose={onClose}
      aria-label={word ? `Word challenge: ${word.word}` : undefined}
      aria-describedby={
        visible && phase === "prompt"
          ? `${instructionsId}${missReason ? ` ${feedbackId}` : ""}`
          : undefined
      }
      initialFocusRef={phase === "prompt" ? inputRef : undefined}
    >
      {word ? (
        <ChallengePhaseSwitch
          phase={phase}
          waiting={
            <ChallengeWaitingState text="Checking the dictionary...">
              <DictionaryScanLoader />
            </ChallengeWaitingState>
          }
          accepted={
            <ChallengeAcceptedState
              reason={acceptedReason ?? "That matches what this word means."}
              continueLabel="Keep reading"
              onContinue={onClose}
            />
          }
          reveal={
            <ChallengeRevealState
              eyebrow="Here's what it means"
              title={
                <SpeakableMysteryWord
                  wordId={word.id}
                  word={word.word}
                  className="font-heading text-3xl font-bold text-foreground"
                />
              }
              body={word.meaningReveal}
              continueLabel="Got it"
              onContinue={onClose}
            />
          }
          prompt={
            <ChallengeAnswerForm
              value={value}
              missReason={missReason}
              hintText={hintText}
              inputRef={inputRef}
              feedbackId={feedbackId}
              fieldLabel={`Your idea for ${word.word}`}
              onChange={onChange}
              onCheck={onCheck}
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
            </ChallengeAnswerForm>
          }
        />
      ) : null}
    </ChallengeDialog>
  );
}
