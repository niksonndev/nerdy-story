# Screen interactions

Behavior and chrome copy only. Visuals: [kid-friendly-ui-design](../kid-friendly-ui-design/screens.md). Layout/breakpoints: [responsive-layout](../responsive-layout/SKILL.md). Motion: [motion-animation](../motion-animation/SKILL.md).

```
StoryPage (read; mystery word highlighted)
  → VocabularyChallenge overlay → GradingWait → WhyFeedback
    accepted → success why (grade reason); overlay closes → same StoryPage; words-learned++; Next Page unlocked
    rejected (retries left) → stay in overlay; “Try another idea!” + about/not-exactly reason + answer-aware hint (AI or local); try again
    grade HTTP failed (retries left) → burn attempt; “Try another idea!” + fixed reason + story hint; try again
    retry limit (wrong or HTTP fail) → MeaningReveal → overlay closes → same StoryPage; Next Page unlocked
StoryPage → A story question (footer primary while comprehension pending)
  → ComprehensionChallenge overlay (does not turn page yet)
StoryPage → NextPage (after vocab resolved, and comprehension absent or already resolved)
  → next story page
StoryPage → PreviousPage → prior page in visit history (no vocab gate; blocked while overlay open)
ComprehensionChallenge → GradingWait → WhyFeedback
  accepted → success why; Keep going → close + auto-advance to next page (no words-learned bump)
  rejected (retries left) → stay; Try another idea + reason + hint
  grade HTTP failed (retries left) → burn attempt; fixed reason + story hint
  retry limit → AnswerReveal → Got it → close + auto-advance
StoryPage → BranchChoice → (path continues; re-choice clears path-specific progress)
StoryPage → ClosingBeat
```

## Cover

**Job:** Hook the child into the book, then name mystery words and story questions without turning the cover into a how-to.

**Copy:** Teaser stays evocative (“Find mystery words along the way”). First tip names tap → type (“Tap a glowing word and type what you think it means”). Second tip plants story questions (“Sometimes the story asks what you noticed — type what you think!”). Third tip stays the fun fork (“Make choices to help {Mia} on her adventure!”). Choice copy is not a substitute for the type verb. Do not add a how-to under the title.

**Primary:** **Start Reading**.

**Do not:** Replace the teaser with instructions. Do not drop the adventure-choice line. Do not say “unlock their secrets” or imply multiple choice.

## Story page

**Job:** Read this page. One visible next-action cue: the highlighted mystery word, **A story question**, or **Next Page** / branch. Secondary action is **Previous Page** when visit history exists.

**Mystery words:** Visually highlighted in the story text (wavy underline, magic chip). The first mystery word also glows. Encountering one opens the vocab challenge overlay; the story page remains underneath. While unresolved, hide **Next Page** / branch **controls** — do not grey them out — and occupy the primary slot with **Tap the glowing word to keep going**. Do not add a second near-word caption. If the child scrolls to the bottom of the first mystery page without tapping, nudge the glowing word into view; do not auto-open the overlay.

**After a vocab challenge:** Overlay closes; child is back on this same page. Next Page / branch is available once that page’s mystery words are resolved. Previous Page does not require vocab resolution.

**Comprehension:** Not opened on page enter. Footer primary reads **A story question** while `comprehensionId` is unresolved; that press opens the overlay (does not turn the page). After resolve, Keep going / Got it advances the story. On a later visit with the challenge already resolved, the label is **Next Page**.

**Previous placement (reading pages):** Mobile — split bottom bar pinned to the bottom of the viewport: ghost ← (~25%) + primary **Next Page** or **A story question** (~75%); when vocab is unresolved, Previous stays and the primary slot holds the why-you-wait status (not a grey Next Page). sm+ — outline **Previous Page** + the footer primary in the bottom row. Decision pages: see Branch choice (Back floats on the illustration, not in the text card).

**Copy:** Story text is pre-written. Progression chrome is **Next Page** / **A story question** / **Previous Page** — not “Continue”, “Next”, or “Skip”. **← Back** is allowed only as quiet decision-page chrome (not a primary CTA).

**Do not:** Multiple competing primary CTAs (the vocab gate status is not a CTA). Do not auto-open comprehension or the vocab overlay on page load. Do not auto-advance from vocab overlays. Do not show Previous Page on the first page or while a challenge overlay is open. Do not leave the primary slot empty while vocab is unresolved.

## Vocab challenge

**Job:** Explain the mystery word in an overlay/modal over the story page. Next Page / branch **controls** stay hidden until the challenge is resolved; the footer still explains why they cannot continue.

**Primary:** Check (≥56px). Prompt: “Explain what you understand by [word]”.

**After a wrong answer (retries left):** “Try another idea!” + soft about/not-exactly reason (grade `reason`) + answer-aware hint from the grade response — live AI or server local keyword fallback (distinct Hint line). Check stays the action; stay in the overlay.

**When the grade HTTP request fails (retries left):** Burn the attempt; show the same gentle-miss shape — fixed short reason **“Not quite — try another way.”** plus the next story `hints` tier (wondering questions, not a definition). Do not tell the child the request or grading system failed. Includes client timeout after a few seconds. Check stays the action; stay in the overlay.

**After the retry limit:** Do not keep blocking (covers wrong grades and HTTP grade-request failures). Move to meaning reveal, then close the overlay and unlock Next Page on the story page.

**Copy:** Kid-level; encouraging. Avoid “Submit”, “Answer the question”, “Vocabulary quiz”.

**Do not:** Multiple choice, “use it in a sentence”, timer, score, or allowing Next Page before the challenge is resolved. Do not advance to the next story page from inside the vocab overlay.

## Comprehension challenge

**Job:** Answer a pre-written story question in an overlay over the story page. Opened by **A story question** (footer primary), not by tapping story text.

**Primary:** Check (≥56px). Prompt is the story question (learning objective).

**After a wrong answer (retries left):** Same miss chrome as vocab — “Try another idea!” + soft about/not-exactly reason + answer-aware hint (live AI). Stay in overlay.

**When the grade HTTP request fails (retries left):** Burn attempt; fixed reason **“Not quite — try another way.”** + story `hints` tier (wondering questions). Includes client timeout. No infra wording.

**After the retry limit:** Show pre-written answer reveal (“Here’s the idea”), then **Got it** closes and **auto-advances**.

**On correct:** Short why-reason; **Keep going** closes and **auto-advances**. Do **not** increment words-learned.

**Copy:** Kid-level; encouraging. Avoid “Submit”, “Quiz”, “Comprehension check”.

**Do not:** Multiple choice, timer, score, words-learned bump, or auto-open on page enter.

## Grading wait

**Job:** Absorb the grading request (live AI; vocab may resolve quickly via server local grade if live fails). Keep the child oriented — story still in context under the overlay if possible.

**Copy:** Vocab — “Checking dictionary…” / similar. Comprehension — “Thinking about your answer…” / similar.

**Do not:** Progress percentages, tips carousels, extra actions, over-invested loading UX.

## Why feedback

**Job:** Show that the answer was heard — still inside the overlay family.

- Rejected (retries left): stay in overlay; “Try another idea” + about/not-exactly reason + answer-aware Hint (AI or local for vocab); Check stays the action.
- Grade HTTP failed (retries left): stay in overlay; “Try another idea” + fixed short reason + story Hint; attempt burned. No infra / “unavailable” wording. Same path for client timeout.
- Accepted (vocab): warm confirmation + grade why-reason; words-learned increments live; then close overlay → same story page → Next Page available.
- Accepted (comprehension): warm confirmation + grade why-reason; **Keep going** → close + advance to next page; no words-learned bump.
- Retry limit: do not shame; hand off to meaning/answer reveal.

**Copy:** Warm confirmation + why on success. On miss: soft about/not-exactly + Hint that nods to their answer. Never “Incorrect”, “Failed”, stars, grades.

**Do not:** Scoreboards, multi-step review dashboards. Vocab must not advance the story from here; comprehension advances only via Keep going / Got it after resolve.

## Meaning / answer reveal

**Job:** After the retry limit, teach the idea so the child can keep going.

**Vocab primary:** A clear dismiss control (≥56px) that closes the overlay (e.g. “Got it”). Not Next Page — that lives on the story page after close. Unlock Next Page; do not increment words-learned; do not auto-advance.

**Comprehension primary:** “Got it” closes the overlay and **auto-advances** to the next page. Do not increment words-learned.

**Copy:** Kid-friendly; short and plain. Warm tone (“Here’s what it means…” / “Here’s the idea…”). Not a lecture or quiz recap.

## Branch choice

**Job:** Pick a story fork — “what if I’d chosen differently?” Both paths equally valid. Not a comprehension test.

**Primary:** Two equal-weight choice controls (≥56px height, generous width), shown only after any mystery word on the page is resolved. Short prompt above (“What do you do?” / story-appropriate). Do **not** put Previous in the footer above the choices. Do **not** grey out the choices while vocab is unresolved — hide them and occupy that slot with the why-you-wait status.

**Back chrome (when history exists):** Subtle control floating top-left over the illustration (mobile ← chevron; sm+ **← Back**). Keeps the text card free for story + choices. Secondary only; must not compete with the branch CTAs.

**Path re-choice:** If the child returns via Previous/Back (or Discover alternate ending) and picks a path again, clear path-specific vocab/comprehension progress so that path starts clean. Keep shared progress, words learned, and explored endings.

**Copy:** Story options, not quiz stems. Quiet **← Back** for decision chrome only.

**Do not:** Gating on “right” choice, more than two options, full-width Previous stacked above the branch CTAs. Do not grey the choices while vocab is unresolved — hide them and show the why-you-wait status in that slot instead.

## Closing beat

**Job:** Chapter close: book-coloring, then **one** celebration page (Story complete + words recap + Story paths + CTA). Other-path invite if one ending is unseen; reread if both are done. No second screen, no chapter-unlock / sequel tease.

**One ending seen — primary:** **Discover Another Ending** (jumps to the branch; same path-progress clear as Discover alternate ending). Ghost secondary: **Read the chapter again**. Quiet tracker under **Story paths**: “You found one ending” / 1 of 2.

**Both endings seen — primary:** **Read the chapter again**. No third destination. Words recap stays on this same page.

**Copy:** Celebratory and short (“Story complete!”, “You found one ending!”, “Story paths”, “Words you learned”). Not “Your score”, “Lesson complete”, or “Chapter unlocked”.

**Do not:** Persist progress UI, settings, playable chapter 2 content, or a fake sequel CTA.
