import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { StoryPageSheet } from "@/components/story/StoryPageSheet";
import { storyPagesById } from "@/lib/story/story-data";

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    fill?: boolean;
    priority?: boolean;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
      <img src={src} alt={alt ?? ""} {...props} />
    );
  },
}));

function renderSheet({
  pageId,
  interactive = true,
  canAdvance = true,
  canGoBack = true,
  resolvedWordIds = [],
  vocabUnresolved = false,
  comprehensionPending = false,
  onMysteryClick = vi.fn(),
  onNextPage = vi.fn(),
  onChoosePath = vi.fn(),
}: {
  pageId: string;
  interactive?: boolean;
  canAdvance?: boolean;
  canGoBack?: boolean;
  resolvedWordIds?: string[];
  vocabUnresolved?: boolean;
  comprehensionPending?: boolean;
  onMysteryClick?: (wordId: string) => void;
  onNextPage?: () => void;
  onChoosePath?: (nextPageId: string) => void;
}) {
  const page = storyPagesById[pageId];
  if (!page) throw new Error(`Unknown page ${pageId}`);
  return {
    onMysteryClick,
    onNextPage,
    onChoosePath,
    ...render(
      <StoryPageSheet
        page={page}
        interactive={interactive}
        canAdvance={canAdvance}
        canGoBack={canGoBack}
        resolvedWordIds={resolvedWordIds}
        vocabUnresolved={vocabUnresolved}
        comprehensionPending={comprehensionPending}
        onMysteryClick={onMysteryClick}
        onNextPage={onNextPage}
        onPreviousPage={() => {}}
        onChoosePath={onChoosePath}
      />,
    ),
  };
}

describe("StoryPageSheet next-action cues", () => {
  it("hides Next Page while a mystery word is unresolved", () => {
    renderSheet({
      pageId: "page-2",
      canAdvance: false,
      vocabUnresolved: true,
    });

    expect(
      screen.getByRole("button", { name: "Mystery word: canopy" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next Page" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "A story question" }),
    ).not.toBeInTheDocument();
  });

  it("shows Next Page after the mystery word is resolved", () => {
    renderSheet({
      pageId: "page-2",
      resolvedWordIds: ["canopy"],
    });

    const next = screen.getByRole("button", { name: "Next Page" });
    expect(next).toBeEnabled();
  });

  it("labels the footer primary as a story question while comprehension is pending", async () => {
    const user = userEvent.setup();
    const { onNextPage } = renderSheet({
      pageId: "page-3",
      comprehensionPending: true,
    });

    expect(
      screen.queryByRole("button", { name: "Next Page" }),
    ).not.toBeInTheDocument();
    const question = screen.getByRole("button", { name: "A story question" });
    expect(question).toBeEnabled();
    await user.click(question);
    expect(onNextPage).toHaveBeenCalledOnce();
  });

  it("restores Next Page after comprehension is resolved", () => {
    renderSheet({
      pageId: "page-3",
      comprehensionPending: false,
    });

    expect(screen.getByRole("button", { name: "Next Page" })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "A story question" }),
    ).not.toBeInTheDocument();
  });

  it("omits branch choices while cautious is unresolved", () => {
    renderSheet({
      pageId: "page-5",
      canAdvance: false,
      vocabUnresolved: true,
    });

    expect(
      screen.getByRole("button", { name: "Mystery word: cautious" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Follow the tracks themselves" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Ask the ranger station for help",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows branch choices after cautious is resolved", () => {
    renderSheet({
      pageId: "page-5",
      resolvedWordIds: ["cautious"],
    });

    expect(
      screen.getByRole("button", { name: "Follow the tracks themselves" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Ask the ranger station for help" }),
    ).toBeEnabled();
  });

  it("opens the vocab challenge from the highlighted word", async () => {
    const user = userEvent.setup();
    const { onMysteryClick } = renderSheet({
      pageId: "page-2",
      canAdvance: false,
      vocabUnresolved: true,
    });

    await user.click(
      screen.getByRole("button", { name: "Mystery word: canopy" }),
    );
    expect(onMysteryClick).toHaveBeenCalledWith("canopy");
  });
});
