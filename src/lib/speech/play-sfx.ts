/** Path to the correct-answer chime in `public/`. */
export const CORRECT_SFX_SRC = "/audio/sfx/correct.wav";

/** Path to the story-complete fanfare in `public/`. */
export const STORY_COMPLETE_SFX_SRC = "/audio/sfx/story-complete.wav";

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (audio === null) audio = new Audio();
  return audio;
}

function playSfx(src: string): void {
  const el = getAudio();
  if (el === null) return;

  el.pause();
  el.currentTime = 0;
  el.src = src;
  void Promise.resolve(el.play()).catch(() => {
    // Ignore rejected playback (e.g. browser autoplay policy) — no kid-facing error.
  });
}

/** Play the short chime when a challenge answer is graded correct. */
export function playCorrectSfx(): void {
  playSfx(CORRECT_SFX_SRC);
}

/** Play the fanfare when the child finishes the story. */
export function playStoryCompleteSfx(): void {
  playSfx(STORY_COMPLETE_SFX_SRC);
}
