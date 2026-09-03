# Story navigation

The story reader advances by **page id**, not array order. Each page in [`src/lib/story-data.ts`](../src/lib/story-data.ts) either:

- has `nextPageId` — linear **Next Page**
- has `choice` — two equal-weight options (`BranchChoice`)
- has neither — ending (swaps to the **EndingBeat** page when vocab on the page is resolved)

Optional interactions on a page:

- **Vocabulary:** mystery word segments; Next Page / branch stay gated until every mystery word on the page is resolved
- **Comprehension:** `comprehensionId`; Next Page stays enabled, but the first press opens the challenge overlay instead of turning the page

State lives in [`StoryReader`](../src/components/story/StoryReader.tsx) (`pageId` → `storyPagesById`). Page turns (Next Page and branch picks) use the shared CSS exit → advance → enter animation in [`StoryPageView`](../src/components/story/StoryPageView.tsx).

## Cover screen

On first load, [`StoryReader`](../src/components/story/StoryReader.tsx) shows [`StoryCoverView`](../src/components/story/StoryCoverView.tsx) before page 1:

- **Cover art** and story title from `STORY_META` in [`story-data.ts`](../src/lib/story-data.ts)
- **Mystery words** teaser — “Find mystery words along the way”
- **Quick tips** — two micro-steps (tap highlighted words, make choices for Mia)
- **Start Reading** — triggers a one-shot dolly-in zoom (cover scales toward the viewer, crossfades into page 1); orchestrated by [`StoryCoverEntrance`](../src/components/story/StoryCoverEntrance.tsx)

Session flag `hasStarted` flips to `true` only after the entrance animation completes. **Read the chapter again** from the ending beat resets chapter progress but keeps `hasStarted: true`, so replay skips the cover and entrance animation.

## Page flow

```mermaid
flowchart TD
  read[StoryPage read]
  vocab[VocabularyChallenge overlay]
  comp[ComprehensionChallenge overlay]
  nextBtn[Next Page]
  branch[BranchChoice]
  endChrome[EndingBeat page]
  read -->|mystery tap| vocab
  vocab -->|resolved| read
  read -->|Next Page and unresolved comprehension| comp
  comp -->|Keep going or Got it| read
  read -->|has nextPageId and canAdvance and comprehension resolved or absent| nextBtn
  read -->|has choice and canAdvance| branch
  nextBtn -->|page turn| read
  branch -->|page turn to option.nextPageId| read
  read -->|no nextPageId no choice vocab resolved| endChrome
```

## Ending beat (`EndingBeat`)

When the child resolves the last vocab word on `page-7a` or `page-7b` and closes the vocab overlay, [`StoryReader`](../src/components/story/StoryReader.tsx) **replaces** the story page with [`EndingBeat`](../src/components/story/EndingBeat.tsx) — a full storybook page (same atmosphere / book-card shell), not a modal over the last page:

1. **Book coloring** — SVG fill animation (~1.4s)
2. **Celebration** (one screen) — “Story complete!” + count-up + learned-word list + “You explored N of 2 endings”, then “Next chapter unlocked!” + replay nudge + two CTAs:
   - **Read chapter 2** (primary) → chapter-2 unlock stub (not playable content)
   - **Read the chapter again** (secondary) → resets chapter 1; keeps `exploredEndingIds` in session

Words-learned on the ending screen counts only vocab answers graded **correct** (not meaning reveals). Comprehension corrects never appear in the word list.

## Vocab challenge client flow (`StoryReader`)

Server path (not shown in the client diagram): live AI grade via `POST /api/grade-vocabulary` (`openai/gpt-oss-120b`, Gateway failover to `google/gemini-3.1-flash-lite`) → on live failure, **local keyword** `GradeResult` (still HTTP 200).

```mermaid
flowchart TD
  check[Check]
  wait[Waiting]
  accepted[Accepted]
  gradeHint[Show about-not-exactly reason plus answer-aware hint]
  transportFallback[Show fixed reason plus story hint]
  reveal[Meaning reveal]
  prompt[Prompt again]
  check --> wait
  wait -->|HTTP 200 correct| accepted
  wait -->|HTTP 200 wrong retries left| gradeHint
  wait -->|HTTP 200 wrong at limit| reveal
  wait -->|HTTP fail retries left| transportFallback
  wait -->|HTTP fail at limit| reveal
  gradeHint --> prompt
  transportFallback --> prompt
```

- **Correct (HTTP 200):** words-learned increments; overlay closes after “Keep reading”. Grade may be from live AI or the local keyword matcher.
- **Wrong (HTTP 200):** kid-facing miss UI shows chrome + soft about/not-exactly `reason` + answer-aware `hint`; attempt burned; at `MAX_ATTEMPTS` → meaning reveal.
- **HTTP / transport failure:** burn attempt; fixed short reason **“Not quite — try another way.”** + next story `hints` tier; at `MAX_ATTEMPTS` → meaning reveal.

## Comprehension challenge client flow (`StoryReader`)

Trigger: **Next Page** on a page with unresolved `comprehensionId` (never auto-open on page enter).

Server path: live AI grade via `POST /api/grade-comprehension` (`openai/gpt-oss-120b`, Gateway failover to `google/gemini-3.1-flash-lite`) → on live failure, **local keyword** `GradeResult` (still HTTP 200).

```mermaid
flowchart TD
  nextClick[Next Page]
  open[Open overlay]
  check[Check]
  wait[Waiting]
  accepted[Accepted Keep going]
  gradeHint[Show about-not-exactly reason plus answer-aware hint]
  transportFallback[Show fixed reason plus story hint]
  reveal[Answer reveal Got it]
  prompt[Prompt again]
  advance[Close plus page turn]
  nextClick --> open --> check --> wait
  wait -->|HTTP 200 correct| accepted --> advance
  wait -->|HTTP 200 wrong retries left| gradeHint
  wait -->|HTTP 200 wrong at limit| reveal --> advance
  wait -->|HTTP fail retries left| transportFallback
  wait -->|HTTP fail at limit| reveal
  gradeHint --> prompt
  transportFallback --> prompt
```

- **Correct (HTTP 200):** short why (`reason`); **no** words-learned bump; “Keep going” closes overlay and advances to `nextPageId`.
- **Wrong (HTTP 200):** same soft miss chrome as vocab; attempt burned; at `MAX_ATTEMPTS` → answer reveal.
- **HTTP / transport failure:** burn attempt; fixed reason + story `hints` tier; at limit → answer reveal.
- Closing with X before resolve does not advance; Next Page can reopen the challenge.

## Mia and the Hidden Sloth (7-page graph)

```mermaid
flowchart LR
  page1[page-1 Into the Rainforest] -->|nextPageId| page2[page-2 canopy vocab]
  page2 -->|nextPageId| page3[page-3 track-clues comp]
  page3 -->|nextPageId| page4[page-4 Two Paths]
  page4 -->|nextPageId| page5[page-5 cautious vocab plus branch]
  page5 -->|Follow the tracks| page6a[page-6a tracks-choice-outcome comp]
  page5 -->|Ask the ranger station| page6b[page-6b guide-choice-outcome comp]
  page6a -->|nextPageId| page7a[page-7a camouflage vocab ending]
  page6b -->|nextPageId| page7b[page-7b nocturnal vocab ending]
```
