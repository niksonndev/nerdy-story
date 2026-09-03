import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StoryCoverEntrance } from "@/components/story/StoryCoverEntrance";

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
      <img src={src} alt={alt} />
    );
  },
}));

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
