import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { StoryCoverEntrance, StoryCoverView } from "@/components/story/StoryCoverView";
import { SCENE_IMAGE_SIZES } from "@/components/story/scene-image";
import {
  STORY_META,
  STORY_START_ID,
  storyPagesById,
  storySceneImages,
} from "@/lib/story/story-data";

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    sizes,
    priority,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    fill?: boolean;
    priority?: boolean;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
      <img
        src={src}
        alt={alt ?? ""}
        data-sizes={sizes}
        data-priority={priority ? "true" : undefined}
        {...props}
      />
    );
  },
}));

describe("StoryCoverView", () => {
  it("prefetches every scene banner at reader size while the cover is up", () => {
    const { container } = render(
      <StoryCoverView onStartReading={() => {}} />,
    );

    expect(
      screen.getByRole("img", { name: STORY_META.coverImageAlt }),
    ).toHaveAttribute("src", STORY_META.coverImage);

    const page1 = storyPagesById[STORY_START_ID]?.image;
    expect(page1).toBeDefined();

    const page1Prefetch = container.querySelector(`img[src="${page1}"]`);
    expect(page1Prefetch).toHaveAttribute("data-priority", "true");
    expect(page1Prefetch).toHaveAttribute("data-sizes", SCENE_IMAGE_SIZES);
    expect(page1Prefetch?.closest("[aria-hidden]")).toHaveClass("left-full");

    for (const src of storySceneImages) {
      const warmed = container.querySelector(`img[src="${src}"]`);
      expect(warmed).toHaveAttribute("data-sizes", SCENE_IMAGE_SIZES);
      expect(warmed?.closest("[aria-hidden]")).toHaveClass("left-full");
    }
  });

  it("names tap-then-type on the first tip and keeps the adventure-choice line", () => {
    render(<StoryCoverView onStartReading={() => {}} />);

    expect(
      screen.getByText("Find mystery words along the way"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tap a glowing word and type what you think it means",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Make choices to help ${STORY_META.protagonistName} on her adventure!`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/unlock their secrets/i)).not.toBeInTheDocument();
  });

  it("does not keep a full-bleed magic fill on the overlay during the dolly", () => {
    const { container } = render(
      <StoryCoverView onStartReading={() => {}} isTransitioning />,
    );

    const overlay = container.querySelector("[data-cover-art-overlay]");
    expect(overlay).toHaveClass("fixed", "inset-0");
    expect(overlay).not.toHaveClass("bg-magic/10");
  });
});

describe("StoryCoverEntrance", () => {
  it("fades the whole cover layer during the dolly so the card fill cannot linger", () => {
    const { container } = render(
      <StoryCoverEntrance
        isTransitioning
        onStartReading={() => {}}
        onEntranceComplete={() => {}}
      />,
    );

    const layer = container.querySelector("[data-cover-entrance]");
    expect(layer).toHaveStyle({ opacity: "0" });
  });
});
