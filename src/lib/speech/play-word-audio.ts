import { mysteryWords } from "@/lib/story/story-data";

/** Path to a mystery word's pre-recorded pronunciation clip in `public/`. */
export function mysteryWordAudioSrc(wordId: string): string {
  return `/audio/mystery-words/${wordId}.mp3`;
}

/** Whether we ship a recorded clip for this mystery word. */
export function canPlayMysteryWord(wordId: string): boolean {
  return wordId in mysteryWords;
}

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (audio === null) audio = new Audio();
  return audio;
}

/** Pause and rewind any in-flight word playback. */
export function stopWordAudio(): void {
  if (audio === null) return;
  audio.pause();
  audio.currentTime = 0;
}

/**
 * Restart playback of a mystery word's clip. Call synchronously from a click
 * handler so mobile browsers treat it as a user gesture. Cancels any current
 * playback first, so retapping restarts rather than stacking clips.
 */
export function playWordAudio(wordId: string): void {
  if (!canPlayMysteryWord(wordId)) return;
  const el = getAudio();
  if (el === null) return;

  el.pause();
  el.currentTime = 0;
  el.src = mysteryWordAudioSrc(wordId);
  void el.play().catch(() => {
    // Ignore rejected playback (e.g. browser autoplay policy) — no kid-facing error.
  });
}
