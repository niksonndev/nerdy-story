# Story navigation

The story reader advances by **page id**, not array order. Each page in [`src/lib/story-data.ts`](../src/lib/story-data.ts) either:

- has `nextPageId` — linear **Next Page**
- has `choice` — two equal-weight options (`BranchChoice`)
- has neither — ending (“The End of this adventure!”)

Progression stays gated until every mystery word on the current page is resolved (accepted explanation or meaning reveal). Vocab challenges open as an overlay over the same page; they never advance the story themselves.

State lives in [`StoryReader`](../src/components/story/StoryReader.tsx) (`pageId` → `storyPagesById`). Page turns (Next Page and branch picks) use the shared CSS exit → advance → enter animation in [`StoryPageView`](../src/components/story/StoryPageView.tsx).

## Flow

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

## Pip and the Rainy Woods (current graph)

```mermaid
flowchart LR
  page1[page-1] -->|nextPageId| page2[page-2]
  page2 -->|nextPageId| page3[page-3]
  page3 -->|Stay curled up| page4a[page-4a]
  page3 -->|Peek outside| page4b[page-4b]
```
