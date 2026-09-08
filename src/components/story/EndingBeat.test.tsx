import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EndingBeat } from "@/components/story/EndingBeat";
import { ENDING_PAGE_IDS } from "@/lib/story/story-data";

const reduceMotion = vi.hoisted(() => ({ current: true as boolean | null }));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => reduceMotion.current,
  };
});

vi.mock("@/lib/speech/play-word-audio", () => ({
  canPlayMysteryWord: () => false,
  playWordAudio: vi.fn(),
  stopWordAudio: vi.fn(),
  mysteryWordAudioSrc: (wordId: string) => `/audio/mystery-words/${wordId}.mp3`,
}));

function renderBeat(
  overrides: {
    learnedWordIds?: string[];
    exploredEndingIds?: string[];
  } = {},
) {
  const onReadAgain = vi.fn();
  const onDiscoverAlternateEnding = vi.fn();

  render(
    <EndingBeat
      learnedWordIds={overrides.learnedWordIds ?? ["canopy"]}
      exploredEndingIds={overrides.exploredEndingIds ?? [ENDING_PAGE_IDS[0]!]}
      onReadAgain={onReadAgain}
      onDiscoverAlternateEnding={onDiscoverAlternateEnding}
    />,
  );

  return { onReadAgain, onDiscoverAlternateEnding };
}

describe("EndingBeat", () => {
  beforeEach(() => {
    reduceMotion.current = true;
  });

  it("invites the other path when one ending is still unseen", async () => {
    reduceMotion.current = true;
    const { onDiscoverAlternateEnding } = renderBeat();

    const discover = await screen.findByRole("button", {
      name: /discover another ending/i,
    });
    expect(
      screen.getByRole("button", { name: "Read the chapter again" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Story complete!")).toBeInTheDocument();
    expect(screen.getByText(/new word mastered/i)).toBeInTheDocument();
    expect(screen.getByText("You found one ending!")).toBeInTheDocument();
    expect(screen.getByText("Story paths")).toBeInTheDocument();
    expect(screen.queryByText(/chapter 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();

    await userEvent.click(discover);
    expect(onDiscoverAlternateEnding).toHaveBeenCalledTimes(1);
  });

  it("offers reread only once both endings are explored", async () => {
    reduceMotion.current = true;
    renderBeat({ exploredEndingIds: [...ENDING_PAGE_IDS] });

    await screen.findByRole("button", { name: "Read the chapter again" });
    expect(screen.getByText("Story complete!")).toBeInTheDocument();
    expect(screen.getByText(/new word mastered/i)).toBeInTheDocument();
    expect(screen.getByText("You found both endings!")).toBeInTheDocument();
    expect(screen.getByText("Story paths")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /discover another ending/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/chapter 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /explore the next chapter/i }),
    ).not.toBeInTheDocument();
  });

  it("starts on coloring without a sequel tease", () => {
    reduceMotion.current = false;
    renderBeat();

    expect(
      screen.getByText("Finishing your storybook..."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/chapter 2/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /discover another ending/i }),
    ).not.toBeInTheDocument();
  });

  it("does not leave the other-path CTA behind a timer when motion is reduced", async () => {
    reduceMotion.current = true;
    renderBeat();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /discover another ending/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Story complete!")).toBeInTheDocument();
    expect(screen.getByText(/new word mastered/i)).toBeInTheDocument();
    expect(screen.getByText("You found one ending!")).toBeInTheDocument();
    expect(screen.getByText("Story paths")).toBeInTheDocument();
    expect(
      screen.queryByText("Finishing your storybook..."),
    ).not.toBeInTheDocument();
  });
});
