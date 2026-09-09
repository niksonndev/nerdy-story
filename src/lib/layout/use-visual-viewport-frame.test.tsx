import { useRef } from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useVisualViewportFrame } from "@/lib/layout/use-visual-viewport-frame";

function FrameHarness() {
  const ref = useRef<HTMLDivElement>(null);
  useVisualViewportFrame(ref);
  return <div ref={ref} data-testid="overlay-frame" className="fixed inset-0" />;
}

describe("useVisualViewportFrame", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sizes the overlay to the visual viewport when the keyboard shrinks it", () => {
    const viewport = {
      offsetTop: 8,
      offsetLeft: 0,
      width: 390,
      height: 340,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("visualViewport", viewport);

    const { getByTestId } = render(<FrameHarness />);
    const frame = getByTestId("overlay-frame");

    expect(frame.style.top).toBe("8px");
    expect(frame.style.height).toBe("340px");
    expect(frame.style.width).toBe("390px");
    expect(viewport.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });
});
