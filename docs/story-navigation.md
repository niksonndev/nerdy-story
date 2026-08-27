# Story navigation

The story reader advances by **page id**, not array order. Each page in [`src/lib/story-data.ts`](../src/lib/story-data.ts) either:

- has `nextPageId` — linear **Next Page**
- has `choice` — two equal-weight options (`BranchChoice`)
- has neither — ending (“The End of this adventure!”)

Progression stays gated until every mystery word on the current page is resolved (accepted explanation or meaning reveal). Vocab challenges open as an overlay over the same page; they never advance the story themselves.

State lives in [`StoryReader`](../src/components/story/StoryReader.tsx) (`pageId` → `storyPagesById`). Page turns (Next Page and branch picks) use the shared CSS exit → advance → enter animation in [`StoryPageView`](../src/components/story/StoryPageView.tsx).

## Page flow

```mermaid
flowchart TD
  read[StoryPage read]
  challenge[VocabChallenge overlay]
  nextBtn[Next Page]
  branch[BranchChoice]
  endChrome[The End chrome]
  read -->|mystery tap| challenge
  challenge -->|resolved| read
  read -->|has nextPageId and canAdvance| nextBtn
  read -->|has choice and canAdvance| branch
  nextBtn -->|page turn| read
  branch -->|page turn to option.nextPageId| read
  read -->|no nextPageId no choice| endChrome
```

## Challenge client flow (`StoryReader`)

Server path (not shown in the client diagram): live AI grade with Gateway failover → on live failure, **local keyword** `GradeResult` (still HTTP 200).

```mermaid
flowchart TD
  check[Check]
  wait[Waiting]
  accepted[Accepted]
  gradeHint[Show reason plus grade hint]
  transportFallback[Not quite plus story hint]
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
- **Wrong (HTTP 200):** `reason` + `hint` from the grade response (AI or local); attempt burned; at `MAX_ATTEMPTS` → meaning reveal.
- **HTTP / transport failure:** burn attempt; reason **“Not quite — try another way.”** + next story `hints` tier (same shape as a gentle miss — no infra messaging); at `MAX_ATTEMPTS` → meaning reveal.

## Pip and the Rainy Woods (current graph)

```mermaid
flowchart LR
  page1[page-1] -->|nextPageId| page2[page-2]
  page2 -->|nextPageId| page3[page-3]
  page3 -->|Stay curled up| page4a[page-4a]
  page3 -->|Peek outside| page4b[page-4b]
```
