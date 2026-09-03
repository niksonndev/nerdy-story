import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  SCENE_IMAGE_SIZES,
  SceneImage,
  SceneImagePreload,
} from "@/components/story/scene-image";

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    sizes,
    priority,
    onLoad,
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
        onLoad={onLoad}
        {...props}
      />
    );
  },
}));

describe("SceneImagePreload", () => {
  it("warms the scene image at banner size, not in a 0×0 box", () => {
    const { container } = render(
      <SceneImagePreload src="/images/story/page-1.jpeg" />,
    );

    const img = container.querySelector('img[src="/images/story/page-1.jpeg"]');
    expect(img).toHaveAttribute("data-priority", "true");
    expect(img).toHaveAttribute("data-sizes", SCENE_IMAGE_SIZES);

    const host = img?.closest("[aria-hidden]");
    expect(host).toHaveClass("left-full", "w-screen");
    expect(host).not.toHaveClass("h-0", "w-0");
  });
});

describe("SceneImage", () => {
  it("does not paint the magic placeholder until the photo has loaded", () => {
    const { container } = render(
      <SceneImage src="/images/story/page-1.jpeg" alt="Dock" />,
    );

    const frame = container.firstElementChild;
    expect(frame).not.toHaveClass("bg-magic/10");

    fireEvent.load(screen.getByRole("img", { name: "Dock" }));
    expect(frame).toHaveClass("bg-magic/10");
  });
});
