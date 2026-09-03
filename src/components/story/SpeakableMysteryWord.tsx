"use client";

import { Volume2 } from "lucide-react";

import { canPlayMysteryWord, playWordAudio } from "@/lib/speech/play-word-audio";
import { cn } from "@/lib/utils";

type SpeakableMysteryWordProps = {
  /** Key into `mysteryWords`; also names the audio clip. */
  wordId: string;
  /** The word as shown to the child. */
  word: string;
  /** Sizing/color for the word text, matching the heading it replaces. */
  className?: string;
  /** Optional id so a dialog can keep pointing its label/heading at it. */
  id?: string;
};

/**
 * The mystery word rendered as a tap-to-hear control. Plays the pre-recorded
 * clip synchronously on click so mobile browsers honor the user gesture. When
 * no clip exists for the word, it degrades to plain, non-interactive text.
 */
export function SpeakableMysteryWord({
  wordId,
  word,
  className,
  id,
}: SpeakableMysteryWordProps) {
  if (!canPlayMysteryWord(wordId)) {
    return (
      <span id={id} className={className}>
        {word}
      </span>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={() => playWordAudio(wordId)}
      aria-label={`Hear ${word}`}
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 rounded-2xl bg-magic/10 px-3 py-1",
        "transition-colors hover:bg-magic/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span>{word}</span>
      <Volume2
        aria-hidden
        className="size-[0.6em] shrink-0 text-magic opacity-80 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}
