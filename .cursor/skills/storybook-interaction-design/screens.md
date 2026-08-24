# Screen interactions (MVP loop)

Behavior and chrome copy only. Visuals: [kid-friendly-ui-design](../kid-friendly-ui-design/screens.md). Motion: [motion-animation](../motion-animation/SKILL.md).

```
StoryPage (read; mystery word highlighted)
  → VocabChallenge overlay → GradingWait → WhyFeedback
    accepted → overlay closes → same StoryPage; words-learned++; Next Page unlocked
    rejected (retries left) → stay in overlay; hint; try again
    rejected (retry limit) → MeaningReveal → overlay closes → same StoryPage; Next Page unlocked
StoryPage → NextPage → (next story page)
StoryPage → BranchChoice → (path continues)
StoryPage → ClosingBeat
```

## Story page

**Job:** Read this page. Primary action is **Next Page** when progression is allowed.

**Mystery words:** Visually highlighted in the story text. Encountering one opens the vocab challenge overlay; the story page remains underneath.

**After a challenge:** Overlay closes; child is back on this same page. Next Page is available once that page’s challenge is resolved.

**Copy:** Story text is pre-written. Progression chrome is **Next Page** — not “Continue”, “Next”, or “Skip”.

**Do not:** Multiple competing CTAs. Do not auto-advance. Do not jump to the next page from inside the challenge overlay.

## Vocab challenge

**Job:** Explain the mystery word in an overlay/modal over the story page. Next Page stays gated until the challenge is resolved.

**Primary:** Check (≥56px). Prompt: “Explain what you understand by [word]”.

**After a wrong answer (retries left):** Pre-written hint tiers (not AI-generated). Check stays the action; stay in the overlay.

**After the retry limit:** Do not keep blocking. Move to meaning reveal, then close the overlay and unlock Next Page on the story page.

**Copy:** Kid-level; encouraging. Avoid “Submit”, “Answer the question”, “Vocabulary quiz”.

**Do not:** Multiple choice, “use it in a sentence”, timer, score, or allowing Next Page before the challenge is resolved.

## Grading wait

**Job:** Absorb the live grading call. Keep the child oriented — story still in context under the overlay if possible.

**Copy:** Short (“Checking dictionary…” / similar).

**Do not:** Progress percentages, tips carousels, extra actions, over-invested loading UX.

## Why feedback

**Job:** Show *why* the answer was right or wrong — still inside the overlay family.

- Rejected (retries left): stay in overlay; “Try another idea” + hint path; Check stays the action.
- Accepted: words-learned increments live; then close overlay → same story page → Next Page available.
- Rejected (retry limit): do not shame; hand off to meaning reveal.

**Copy:** Warm confirmation + why on success. Never “Incorrect”, “Failed”, stars, grades.

**Do not:** Scoreboards, multi-step review dashboards, advancing to the next story page from here.

## Meaning reveal

**Job:** After the retry limit, teach the word so the child can keep reading. Then unlock progression.

**Primary:** A clear dismiss/continue control (≥56px) that closes the overlay (e.g. “Got it” / story-appropriate). Not Next Page — that lives on the story page after close.

**Copy:** Kid-friendly definition of the mystery word; short and plain. Warm tone (“Here’s what it means…”). Not a lecture or quiz recap.

**Do not:** Increment words-learned. Do not require another graded attempt. Do not auto-advance to the next story page.

## Branch choice

**Job:** Pick a story fork — “what if I’d chosen differently?” Both paths equally valid. Not a comprehension test.

**Primary:** Two equal-weight choice controls (≥56px height, generous width). Short prompt above (“What do you do?” / story-appropriate).

**Copy:** Story options, not quiz stems.

**Do not:** Gating on “right” choice, more than two options, tiny text links.

## Closing beat

**Job:** Demo climax in one sequence: book-coloring → words-learned count-up → chapter-unlock *reveal* (not playable chapter 2).

**Copy:** Celebratory and short (“Words you learned”, “Chapter unlocked”). Not “Your score” or “Lesson complete”.

**Do not:** Persist progress UI, settings, or playable chapter 2 content.
