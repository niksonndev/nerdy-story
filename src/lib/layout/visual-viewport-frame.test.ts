import { describe, expect, it } from "vitest";

import {
  applyVisualViewportFrame,
  clearVisualViewportFrame,
} from "@/lib/layout/visual-viewport-frame";

describe("visual viewport overlay frame", () => {
  it("pins a fixed overlay to a shortened visual viewport (keyboard open)", () => {
    const node = document.createElement("div");
    applyVisualViewportFrame(node, {
      offsetTop: 12,
      offsetLeft: 0,
      width: 390,
      height: 360,
    });

    expect(node.style.top).toBe("12px");
    expect(node.style.left).toBe("0px");
    expect(node.style.right).toBe("auto");
    expect(node.style.bottom).toBe("auto");
    expect(node.style.width).toBe("390px");
    expect(node.style.height).toBe("360px");
  });

  it("clears the pin so inset-0 can take over again", () => {
    const node = document.createElement("div");
    applyVisualViewportFrame(node, {
      offsetTop: 12,
      offsetLeft: 0,
      width: 390,
      height: 360,
    });
    clearVisualViewportFrame(node);

    expect(node.style.top).toBe("");
    expect(node.style.width).toBe("");
    expect(node.style.height).toBe("");
  });
});
