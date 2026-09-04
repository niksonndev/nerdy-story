import type { StoryPage } from "@/lib/story/story-data";

export function mysteryWordIdsFor(page: StoryPage): string[] {
  return page.segments
    .filter((segment) => segment.type === "mystery")
    .map((segment) => segment.wordId);
}

/**
 * Forward sheet for the flip spine — only when a linear Next Page turn is
 * allowed. No peek when vocab-gated, comprehension pending, branch choice, or
 * last page (ending beat).
 */
export function peekNextPageIdFor({
  page,
  canAdvance,
  resolvedComprehensionIds,
}: {
  page: StoryPage;
  canAdvance: boolean;
  resolvedComprehensionIds: string[];
}): string | null {
  if (!canAdvance) return null;
  if (page.choice) return null;
  if (!page.nextPageId) return null;
  if (
    page.comprehensionId &&
    !resolvedComprehensionIds.includes(page.comprehensionId)
  ) {
    return null;
  }
  return page.nextPageId;
}

/**
 * Flip-book sheets: optional previous (visit history), current, optional peek.
 * Index of the current page is `pageHistory.length > 0 ? 1 : 0`.
 */
export function flipSheetIdsFor({
  pageId,
  pageHistory,
  peekNextPageId,
  pendingPeekId = null,
}: {
  pageId: string;
  pageHistory: string[];
  peekNextPageId: string | null;
  pendingPeekId?: string | null;
}): string[] {
  const prev =
    pageHistory.length > 0 ? pageHistory[pageHistory.length - 1]! : null;
  const peek = pendingPeekId ?? peekNextPageId;
  return [...(prev ? [prev] : []), pageId, ...(peek ? [peek] : [])];
}

export function flipCurrentIndex(pageHistoryLength: number): number {
  return pageHistoryLength > 0 ? 1 : 0;
}
