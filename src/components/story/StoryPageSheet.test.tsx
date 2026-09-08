import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  StoryPageSheet,
  VOCAB_GATE_COPY,
} from "@/components/story/StoryPageSheet";
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
  challengeOpen = false,
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
  challengeOpen?: boolean;
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
        challengeOpen={challengeOpen}
        onMysteryClick={onMysteryClick}
        onNextPage={onNextPage}
        onPreviousPage={() => {}}
        onChoosePath={onChoosePath}
      />,
    ),
  };
}

describe("StoryPageSheet next-action cues", () => {
  it("keeps Next Page hidden and explains the vocab gate", () => {
    const { onNextPage, onMysteryClick } = renderSheet({
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
    expect(screen.getByRole("status")).toHaveTextContent(VOCAB_GATE_COPY);
    expect(screen.queryByText("Tap the glowing word")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mystery word: canopy" }),
    ).toHaveClass("mystery-word-glow");

    fireEvent.click(screen.getByRole("status"));
    expect(onNextPage).not.toHaveBeenCalled();
    expect(onMysteryClick).not.toHaveBeenCalled();
  });

  it("shows Next Page after the mystery word is resolved and drops gate copy", () => {
    renderSheet({
      pageId: "page-2",
      resolvedWordIds: ["canopy"],
    });

    const next = screen.getByRole("button", { name: "Next Page" });
    expect(next).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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

  it("omits branch choices while cautious is unresolved and explains the gate", () => {
    renderSheet({
      pageId: "page-5",
      canAdvance: false,
      vocabUnresolved: true,
    });

    expect(
      screen.getByRole("button", { name: "Mystery word: cautious" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mystery word: cautious" }),
    ).not.toHaveClass("mystery-word-glow");
    expect(screen.getByRole("status")).toHaveTextContent(VOCAB_GATE_COPY);
    expect(
      screen.queryByRole("button", { name: "Follow the tracks themselves" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Ask the ranger station for help",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next Page" }),
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
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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

  it("does not show first-mystery cues on peek sheets", () => {
    renderSheet({
      pageId: "page-2",
      interactive: false,
      canAdvance: false,
      vocabUnresolved: true,
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Mystery word: canopy",
        hidden: true,
      }),
    ).not.toHaveClass("mystery-word-glow");
  });

  it("nudges the first mystery word into view on stall without opening the challenge", async () => {
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const { onMysteryClick, container } = renderSheet({
      pageId: "page-2",
      canAdvance: false,
      vocabUnresolved: true,
    });

    const article = container.querySelector("article");
    expect(article).toBeTruthy();
    const word = screen.getByRole("button", { name: "Mystery word: canopy" });

    Object.defineProperty(article, "scrollHeight", {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(article, "clientHeight", {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(article, "scrollTop", {
      configurable: true,
      value: 520,
    });
    vi.spyOn(article!, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 400,
      left: 0,
      right: 100,
      width: 100,
      height: 400,
      x: 0,
      y: 0,
      toJSON() {
        return this;
      },
    });
    vi.spyOn(word, "getBoundingClientRect").mockReturnValue({
      top: -80,
      bottom: -20,
      left: 0,
      right: 80,
      width: 80,
      height: 60,
      x: 0,
      y: -80,
      toJSON() {
        return this;
      },
    });

    fireEvent.scroll(article!);

    await waitFor(() => {
      expect(word).toHaveClass("mystery-word-glow-nudge");
    });
    expect(onMysteryClick).not.toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalled();
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
});
