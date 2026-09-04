import { describe, expect, it } from "vitest";

import {
  flipCurrentIndex,
  flipSheetIdsFor,
  peekNextPageIdFor,
} from "@/lib/story/page-helpers";
import { storyPagesById } from "@/lib/story/story-data";

describe("peekNextPageIdFor", () => {
  it("returns nextPageId on a linear page when advance is allowed", () => {
    expect(
      peekNextPageIdFor({
        page: storyPagesById["page-1"]!,
        canAdvance: true,
        resolvedComprehensionIds: [],
      }),
    ).toBe("page-2");
  });

  it("returns null when vocab gates advance", () => {
    expect(
      peekNextPageIdFor({
        page: storyPagesById["page-2"]!,
        canAdvance: false,
        resolvedComprehensionIds: [],
      }),
    ).toBeNull();
  });

  it("returns null while comprehension is unresolved", () => {
    expect(
      peekNextPageIdFor({
        page: storyPagesById["page-3"]!,
        canAdvance: true,
        resolvedComprehensionIds: [],
      }),
    ).toBeNull();
  });

  it("returns nextPageId after comprehension is resolved", () => {
    expect(
      peekNextPageIdFor({
        page: storyPagesById["page-3"]!,
        canAdvance: true,
        resolvedComprehensionIds: ["track-clues"],
      }),
    ).toBe("page-4");
  });

  it("returns null on a branch choice page", () => {
    expect(
      peekNextPageIdFor({
        page: storyPagesById["page-5"]!,
        canAdvance: true,
        resolvedComprehensionIds: ["track-clues"],
      }),
    ).toBeNull();
  });

  it("returns null on a last page", () => {
    expect(
      peekNextPageIdFor({
        page: storyPagesById["page-7a"]!,
        canAdvance: true,
        resolvedComprehensionIds: ["track-clues", "tracks-choice-outcome"],
      }),
    ).toBeNull();
  });
});

describe("flipSheetIdsFor", () => {
  it("is just the current page with no history or peek", () => {
    expect(
      flipSheetIdsFor({
        pageId: "page-1",
        pageHistory: [],
        peekNextPageId: null,
      }),
    ).toEqual(["page-1"]);
  });

  it("includes previous, current, and peek", () => {
    expect(
      flipSheetIdsFor({
        pageId: "page-3",
        pageHistory: ["page-1", "page-2"],
        peekNextPageId: "page-4",
      }),
    ).toEqual(["page-2", "page-3", "page-4"]);
  });

  it("uses pendingPeekId over peekNextPageId (branch pick)", () => {
    expect(
      flipSheetIdsFor({
        pageId: "page-5",
        pageHistory: ["page-1", "page-2", "page-3", "page-4"],
        peekNextPageId: null,
        pendingPeekId: "page-6a",
      }),
    ).toEqual(["page-4", "page-5", "page-6a"]);
  });
});

describe("flipCurrentIndex", () => {
  it("is 0 on the first page and 1 when history exists", () => {
    expect(flipCurrentIndex(0)).toBe(0);
    expect(flipCurrentIndex(2)).toBe(1);
  });
});
