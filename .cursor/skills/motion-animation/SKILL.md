---
name: motion-animation
description: >-
  Defines how much and when nerdy-story UI should move: subtle page turns, CTA
  press, words-learned increment, and the sequenced closing beat. Use when
  adding or changing animation, Motion, CSS transitions, loading motion,
  count-up, or the ending unlock sequence.
---

# Motion and animation

How much and when to move. Look and feel: [kid-friendly-ui-design](../kid-friendly-ui-design/SKILL.md). Interaction: [storybook-interaction-design](../storybook-interaction-design/SKILL.md). Layout/breakpoints: [responsive-layout](../responsive-layout/SKILL.md).

Subtle presence only.

## How to implement

- **Next Page / page turn:** `react-pageflip` (StPageFlip) via `StoryFlipBook` — portrait single-sheet curl on the book card. Do **not** use Motion for page turns. Do not animate the modal, image crop logic, or text/segment content separately.
- **Everything else** (overlay enter, CTA press, words-learned bump, ending beat, grading wait): Motion (`motion/react`) unless a simpler CSS transition is clearly enough.
- **`prefers-reduced-motion`:** Honor OS reduce-motion. Collapse page-turn to an instant swap (`turnToNextPage` / `turnToPrevPage`). Gate Motion springs to near-instant opacity (or skip) via `useReducedMotion()`. Essential state changes (dialog open/close, page content, feedback text) must not require motion to understand.

## Page turn (Next Page) — current contract

Apply through `StoryFlipBook` / `StoryPageView` only. Keep it quick (~500ms flip). When reduced motion is preferred, skip the curl and advance immediately.

1. **Button-driven only:** **Next Page** / Previous / branch / comprehension Keep going call `flipNext()` / `turnToPrevPage` (or instant turn when reduced motion). No corner-drag, swipe, or click-to-flip.
2. **Spine gating:** sheets are `[prev?, current, peek?]`. No peek while vocab-gated, comprehension pending, on a branch page, or on a last page — the engine physically cannot flip forward.

Gate Next Page / Previous while a flip is in progress so controls cannot double-fire. First paint of page 1 should not run a turn animation. Cover entrance and EndingBeat stay outside the flip book.

## When motion is allowed

- Page / scene change on **Next Page** — react-pageflip curl per contract above (instant when reduced motion)
- CTA press feedback
- Words-learned increment (soft success pulse / count bump)
- Sequenced ending beat: book-coloring → count-up → chapter unlock (short-circuit coloring + count-up when reduced motion)
- Vocab challenge / feedback overlay: brief enter; focus the input — no celebration until an accepted answer
- Grading wait: a subtle loop only if essential (e.g. gentle bounce); keep short and calm
- Branch choice: press feedback, then flip into the path
- Wrong answer: gentle, not shake-shame

## Hard avoids

- Looping decoration
- Confetti storms
- Layout thrash
- Spinner storms or busy loader stacks
- Excessive animation of any kind
- Flashy or slow page turns; Motion-driven page turns; corner-drag / click-to-flip; full-story magazine flip that skips gating
- Ignoring `prefers-reduced-motion` for page turns or Motion choreography

## Pre-ship checklist

- [ ] Motion / transitions are subtle and purposeful
- [ ] Next Page uses react-pageflip on the book container (~500ms; instant when reduced motion)
- [ ] Ending beat is sequenced: coloring → count-up → unlock
- [ ] `prefers-reduced-motion` collapses page-turn + Motion springs
- [ ] No looping decoration, confetti, or layout thrash
