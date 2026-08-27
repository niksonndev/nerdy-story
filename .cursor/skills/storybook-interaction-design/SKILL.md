---
name: storybook-interaction-design
description: >-
  Defines how nerdy-story child-facing UI behaves: Next Page progression,
  vocab-challenge gating with retry-limit meaning reveal, overlay challenge
  flow, large obvious controls, encouraging why-feedback, and chrome copy for
  ages 7–9. Use when designing or changing story flow, buttons, challenge,
  grading wait, feedback, branch choice, words-learned, or ending interaction.
---

# Storybook interaction design

How the storybook behaves. Look and feel: [kid-friendly-ui-design](../kid-friendly-ui-design/SKILL.md). Layout/breakpoints: [responsive-layout](../responsive-layout/SKILL.md). Motion: [motion-animation](../motion-animation/SKILL.md). Product scope lives in `.cursor/rules/product-mvp.mdc`.

Compose the story screen as a single storybook page (illustration + readable text + quiet chrome), not a grid of bordered panels. Story progression happens through a clear **Next Page** action. A vocabulary challenge opens as an overlay/modal over that page; Next Page stays gated until the challenge is **resolved** — either an accepted explanation, or a kid-friendly meaning reveal after the retry limit — then the overlay closes and the child returns to the same story page with Next Page available.

## Child-independent interaction

- One clear primary action per active state. On the story page that action is **Next Page**.
- Mystery words are visually highlighted in the story text; tapping/encountering one opens the vocab challenge as an overlay/modal (story page stays underneath).
- While the challenge overlay is open, hide or disable Next Page. Do not advance from inside the overlay.
- After grading/feedback, close the overlay and return to the same story page. Unlock Next Page only once the challenge is resolved.
- Resolution paths: (1) accepted explanation → words-learned increments; overlay closes; Next Page unlocks. (2) rejected with retries left → why-reason + hint from the grade response (live AI or server local keyword fallback); stay in overlay; try again. (3) grade **HTTP request** failed → burn attempt; kid-facing reason **“Not quite — try another way.”** + story hint (same gentle-miss shape as a wrong answer — never expose request/SDK failure); stay in overlay unless retry limit. (4) retry limit reached (wrong grades or HTTP grade-request failures) → reveal the word’s meaning in kid-friendly language; overlay closes; Next Page unlocks (no words-learned increment).
- Use large, easy-to-tap controls. Primary actions should generally be around 56px tall or larger; smaller controls are acceptable when appropriate and still comfortably tappable (never below 44px — see [responsive-layout](../responsive-layout/SKILL.md)). Modal shell sizing (full-screen vs card) follows responsive-layout breakpoints; this skill owns challenge flow, not layout.
- Branch choice: two equally weighted story options, not a quiz. Do not gate the fork on a “right” answer.
- Feedback is encouraging and explains *why*; no red-X shame, no score/stars/grade language.
- Chrome copy at 7–9 reading level (“Next Page”, “Check” not “Submit”; “Try another idea” not “Incorrect”).
- Live **words learned** is always visible once the loop starts; it is a treasure count, not a gradebook. Only accepted explanations increment it.

## Hard avoids (interaction)

Fail closed if any of these appear:

- Auto-advance, skip, or Next Page while a vocab challenge is unresolved (overlay still open, or retries remain without meaning reveal)
- Hard-blocking forever on a correct answer — after the retry limit, always reveal meaning and unlock Next Page
- Multiple choice, “use it in a sentence”, timers, scores, or quiz framing
- Tiny controls, competing CTAs, settings/nav chrome
- Lesson-y copy (“Submit”, “Incorrect”, “Your score”, “Lesson complete”)

## Screen interactions

For flow per MVP screen, see [screens.md](screens.md).

## Pre-ship checklist

- [ ] Vocab challenge is an overlay; after feedback it closes back to the same story page
- [ ] Next Page unlocks only when the challenge is resolved (accepted **or** meaning reveal after retries)
- [ ] Meaning reveal is kid-friendly; words-learned increments only on accepted answers
- [ ] One clear primary action per active state; controls ≥56px
- [ ] Encouraging why-feedback; no grade/score shame
- [ ] Chrome copy at 7–9 reading level
