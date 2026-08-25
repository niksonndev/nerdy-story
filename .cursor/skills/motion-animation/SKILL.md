---
name: motion-animation
description: >-
  Defines how much and when nerdy-story UI should move: subtle page turns, CTA
  press, words-learned increment, and the sequenced closing beat. Use when
  adding or changing animation, Motion, transitions, loading motion, count-up,
  or the ending unlock sequence.
---

# Motion and animation

How much and when to move. Look and feel: [kid-friendly-ui-design](../kid-friendly-ui-design/SKILL.md). Interaction: [storybook-interaction-design](../storybook-interaction-design/SKILL.md). Layout/breakpoints: [responsive-layout](../responsive-layout/SKILL.md).

Subtle presence only. Implement with Motion (`motion/react`);

## When motion is allowed

- Page / scene change on **Next Page** — subtle storybook-like transition between the current and next page
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

## Pre-ship checklist

- [ ] Motion is subtle and purposeful
- [ ] Ending beat is sequenced: coloring → count-up → unlock
- [ ] No looping decoration, confetti, or layout thrash
