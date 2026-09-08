import { describe, expect, it } from "vitest";

import {
  isNearSheetBottom,
  isOutsideScrollport,
} from "@/lib/story/sheet-scroll";

function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 100,
    width: 100,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON() {
      return this;
    },
  };
}

describe("isNearSheetBottom", () => {
  it("is false when the sheet does not overflow", () => {
    expect(
      isNearSheetBottom({ scrollTop: 0, clientHeight: 400, scrollHeight: 400 }),
    ).toBe(false);
  });

  it("is false while there is still room to scroll", () => {
    expect(
      isNearSheetBottom({
        scrollTop: 40,
        clientHeight: 400,
        scrollHeight: 800,
      }),
    ).toBe(false);
  });

  it("is true within the bottom slack", () => {
    expect(
      isNearSheetBottom({
        scrollTop: 380,
        clientHeight: 400,
        scrollHeight: 800,
      }),
    ).toBe(true);
  });
});

describe("isOutsideScrollport", () => {
  it("is true when the word sits above the visible sheet", () => {
    expect(
      isOutsideScrollport(
        { getBoundingClientRect: () => rect(0, 400) },
        { getBoundingClientRect: () => rect(-80, -20) },
      ),
    ).toBe(true);
  });

  it("is false when the word overlaps the visible sheet", () => {
    expect(
      isOutsideScrollport(
        { getBoundingClientRect: () => rect(0, 400) },
        { getBoundingClientRect: () => rect(120, 160) },
      ),
    ).toBe(false);
  });
});
