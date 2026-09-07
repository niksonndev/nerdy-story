import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { storyPagesById } from "@/lib/story/story-data";

vi.mock("@/components/story/StoryFlipBook", () => ({
  StoryFlipBook: ({ bookKey }: { bookKey: string }) => (
    <div data-testid="flip-book" data-book-key={bookKey} />
  ),
}));

import { StoryPageView } from "@/components/story/StoryPageView";

const decisionPage = storyPagesById["page-5"]!;

function renderDecision(resolvedWordIds: string[]) {
  return render(
    <StoryPageView
      page={decisionPage}
      pageHistory={["page-1", "page-2", "page-3", "page-4"]}
      resolvedComprehensionIds={["track-clues"]}
      wordsLearned={resolvedWordIds.length}
      resolvedWordIds={resolvedWordIds}
      canAdvance={resolvedWordIds.includes("cautious")}
      canGoBack
      isLastPage={false}
      onMysteryClick={() => {}}
      onChoosePath={() => {}}
      onPreviousPage={() => {}}
    />,
  );
}

describe("StoryPageView flip book key", () => {
  it("remounts the flip book when cautious is resolved on the decision page", () => {
    const view = renderDecision(["canopy"]);
    expect(screen.getByTestId("flip-book")).toHaveAttribute(
      "data-book-key",
      "page-5:0",
    );

    view.rerender(
      <StoryPageView
        page={decisionPage}
        pageHistory={["page-1", "page-2", "page-3", "page-4"]}
        resolvedComprehensionIds={["track-clues"]}
        wordsLearned={2}
        resolvedWordIds={["canopy", "cautious"]}
        canAdvance
        canGoBack
        isLastPage={false}
        onMysteryClick={() => {}}
        onChoosePath={() => {}}
        onPreviousPage={() => {}}
      />,
    );

    expect(screen.getByTestId("flip-book")).toHaveAttribute(
      "data-book-key",
      "page-5:1",
    );
  });
});
