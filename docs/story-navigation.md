# Story navigation

The story reader advances by **page id**, not array order. Each page in [`src/lib/story-data.ts`](../src/lib/story-data.ts) either:

- has `nextPageId` — linear **Next Page**
- has `choice` — two equal-weight options (`BranchChoice`)
- has neither — ending (“The End of this adventure!”)

Optional interactions on a page:

- **Vocabulary:** mystery word segments; Next Page / branch stay gated until every mystery word on the page is resolved
- **Comprehension:** `comprehensionId`; Next Page stays enabled, but the first press opens the challenge overlay instead of turning the page

State lives in [`StoryReader`](../src/components/story/StoryReader.tsx) (`pageId` → `storyPagesById`). Page turns (Next Page and branch picks) use the shared CSS exit → advance → enter animation in [`StoryPageView`](../src/components/story/StoryPageView.tsx).

## Page flow

```mermaid
flowchart TD
  read[StoryPage read]
  vocab[VocabChallenge overlay]
  comp[ComprehensionChallenge overlay]
  nextBtn[Next Page]
  branch[BranchChoice]
  endChrome[The End chrome]
  read -->|mystery tap| vocab
  vocab -->|resolved| read
  read -->|Next Page and unresolved comprehension| comp
  comp -->|Keep going or Got it| read
  read -->|has nextPageId and canAdvance and comprehension resolved or absent| nextBtn
  read -->|has choice and canAdvance| branch
  nextBtn -->|page turn| read
  branch -->|page turn to option.nextPageId| read
  read -->|no nextPageId no choice| endChrome
```

## Vocab challenge client flow (`StoryReader`)

Server path (not shown in the client diagram): live AI grade via `POST /api/grade-vocabulary` (Gateway failover) → on live failure, **local keyword** `GradeResult` (still HTTP 200).

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

Server path: live AI grade via `POST /api/grade-comprehension` (Gateway failover) → on live failure, **local keyword** `GradeResult` (still HTTP 200).

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

## Pip and the Rainy Woods (7-page graph)

```mermaid
flowchart LR
  page1[page-1 Setup] -->|nextPageId| page2[page-2 Vocab1]
  page2 -->|nextPageId| page3[page-3 Comp1]
  page3 -->|nextPageId| page4[page-4 Quiet]
  page4 -->|nextPageId| page5[page-5 Vocab2 plus branch]
  page5 -->|Stay curled up| page6a[page-6a Comp2A]
  page5 -->|Peek outside| page6b[page-6b Comp2B]
  page6a -->|nextPageId| page7a[page-7a Vocab3A ending]
  page6b -->|nextPageId| page7b[page-7b Vocab3B ending]
```
