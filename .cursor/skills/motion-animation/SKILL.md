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

- **Next Page / page turn:** CSS `transition` + `transform` / opacity on the **page container only** (`article` in `StoryPageView`). Do **not** use Motion for this; no new animation library. Do not animate the modal, image crop logic, or text/segment content separately.
- **Everything else** (overlay enter, CTA press, words-learned bump, ending beat, grading wait): Motion (`motion/react`) unless a simpler CSS transition is clearly enough.

## Page turn (Next Page) — current contract

Apply to the story page container only. Keep it subtle and quick (~300–400ms; shipped at 350ms).

1. **Exit (current page):** slide out to the left (~12%), slight fade out, slight scale-down (~0.96) — reads as the page being lifted/turned away.
2. **Advance** after the exit duration, then
3. **Enter (next page):** start offset to the right (~12%) + faded, then ease to rest (fade in + slide to center). No scale on enter.

Gate the Next Page control while a turn is in progress so it cannot double-fire. First paint of page 1 should not run the enter-from-right motion.

## When motion is allowed

- Page / scene change on **Next Page** — CSS page-turn per contract above
- CTA press feedback
- Words-learned increment (soft success pulse / count bump)
- Sequenced ending beat: book-coloring → count-up → chapter unlock
- Vocab challenge / feedback overlay: brief enter; focus the input — no celebration until an accepted answer
- Grading wait: a subtle loop only if essential (e.g. gentle bounce); keep short and calm
- Branch choice: press feedback, then scene change into the path
- Wrong answer: gentle, not shake-shame

## Hard avoids

- Looping decoration
- Confetti storms
- Layout thrash
- Spinner storms or busy loader stacks
- Excessive animation of any kind
- Flashy or slow page turns; Motion-driven page turns when CSS already covers it

## Pre-ship checklist

- [ ] Motion / transitions are subtle and purposeful
- [ ] Next Page uses the CSS page-turn on the page container only (~300–400ms)
- [ ] Ending beat is sequenced: coloring → count-up → unlock
- [ ] No looping decoration, confetti, or layout thrash
