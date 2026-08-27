# Screen interactions (MVP loop)

Behavior and chrome copy only. Visuals: [kid-friendly-ui-design](../kid-friendly-ui-design/screens.md). Layout/breakpoints: [responsive-layout](../responsive-layout/SKILL.md). Motion: [motion-animation](../motion-animation/SKILL.md).

```
StoryPage (read; mystery word highlighted)
  → VocabChallenge overlay → GradingWait → WhyFeedback
    accepted → success why (grade reason); overlay closes → same StoryPage; words-learned++; Next Page unlocked
    rejected (retries left) → stay in overlay; “Try another idea!” + about/not-exactly reason + answer-aware hint (AI or local); try again
    grade HTTP failed (retries left) → burn attempt; “Try another idea!” + fixed reason + story hint; try again
    retry limit (wrong or HTTP fail) → MeaningReveal → overlay closes → same StoryPage; Next Page unlocked
StoryPage → NextPage
  → if unresolved comprehension on this page → ComprehensionChallenge overlay (does not turn page yet)
  → else → next story page
ComprehensionChallenge → GradingWait → WhyFeedback
  accepted → success why; Keep going → close + auto-advance to next page (no words-learned bump)
  rejected (retries left) → stay; Try another idea + reason + hint
  grade HTTP failed (retries left) → burn attempt; fixed reason + story hint
  retry limit → AnswerReveal → Got it → close + auto-advance
StoryPage → BranchChoice → (path continues)
StoryPage → ClosingBeat
```

## Story page

**Job:** Read this page. Primary action is **Next Page** when progression is allowed.

**Mystery words:** Visually highlighted in the story text. Encountering one opens the vocab challenge overlay; the story page remains underneath.

**After a vocab challenge:** Overlay closes; child is back on this same page. Next Page is available once that page’s mystery words are resolved.

**Comprehension:** Not opened on page enter. First **Next Page** press opens the comprehension overlay when the page has an unresolved `comprehensionId`. After resolve, Keep going / Got it advances the story.

**Copy:** Story text is pre-written. Progression chrome is **Next Page** — not “Continue”, “Next”, or “Skip”.

**Do not:** Multiple competing CTAs. Do not auto-open comprehension on page load. Do not auto-advance from vocab overlays.

## Vocab challenge

**Job:** Explain the mystery word in an overlay/modal over the story page. Next Page stays gated until the challenge is resolved.

**Primary:** Check (≥56px). Prompt: “Explain what you understand by [word]”.

**After a wrong answer (retries left):** “Try another idea!” + soft about/not-exactly reason (grade `reason`) + answer-aware hint from the grade response — live AI or server local keyword fallback (distinct Hint line). Check stays the action; stay in the overlay.

**When the grade HTTP request fails (retries left):** Burn the attempt; show the same gentle-miss shape — fixed short reason **“Not quite — try another way.”** plus the next story `hints` tier. Do not tell the child the request or grading system failed. Check stays the action; stay in the overlay.

**After the retry limit:** Do not keep blocking (covers wrong grades and HTTP grade-request failures). Move to meaning reveal, then close the overlay and unlock Next Page on the story page.

**Copy:** Kid-level; encouraging. Avoid “Submit”, “Answer the question”, “Vocabulary quiz”.

**Do not:** Multiple choice, “use it in a sentence”, timer, score, or allowing Next Page before the challenge is resolved. Do not advance to the next story page from inside the vocab overlay.

## Comprehension challenge

**Job:** Answer a pre-written story question in an overlay over the story page. Opened by **Next Page**, not by tapping story text.

**Primary:** Check (≥56px). Prompt is the story question (learning objective).

**After a wrong answer (retries left):** Same miss chrome as vocab — “Try another idea!” + soft about/not-exactly reason + answer-aware hint (live AI). Stay in overlay.

**When the grade HTTP request fails (retries left):** Burn attempt; fixed reason **“Not quite — try another way.”** + story `hints` tier. No infra wording. (No server local matcher for comprehension yet.)

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
- Grade HTTP failed (retries left): stay in overlay; “Try another idea” + fixed short reason + story Hint; attempt burned. No infra / “unavailable” wording.
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

**Primary:** Two equal-weight choice controls (≥56px height, generous width). Short prompt above (“What do you do?” / story-appropriate).

**Copy:** Story options, not quiz stems.

**Do not:** Gating on “right” choice, more than two options, tiny text links.

## Closing beat

**Job:** Demo climax in one sequence: book-coloring → words-learned count-up → chapter-unlock *reveal* (not playable chapter 2).

**Copy:** Celebratory and short (“Words you learned”, “Chapter unlocked”). Not “Your score” or “Lesson complete”.

**Do not:** Persist progress UI, settings, or playable chapter 2 content.
