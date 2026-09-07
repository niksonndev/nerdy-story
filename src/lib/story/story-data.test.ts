import { describe, expect, it } from "vitest";

import {
  BRANCH_PAGE_ID,
  ENDING_PAGE_IDS,
  PATH_PAGE_IDS,
  PATH_SPECIFIC_CHALLENGE_IDS,
  PATH_SPECIFIC_COMPREHENSION_IDS,
  PATH_SPECIFIC_WORD_IDS,
  isPathPageId,
} from "@/lib/story/story-data";

describe("story graph derived from pages", () => {
  it("finds the branch, paths, endings, and path-only challenges", () => {
    expect(BRANCH_PAGE_ID).toBe("page-5");
    expect(PATH_PAGE_IDS).toEqual(["page-6a", "page-6b"]);
    expect(ENDING_PAGE_IDS).toEqual(["page-7a", "page-7b"]);
    expect(isPathPageId("page-6a")).toBe(true);
    expect(isPathPageId("page-5")).toBe(false);
    expect([...PATH_SPECIFIC_WORD_IDS].sort()).toEqual([
      "camouflage",
      "nocturnal",
    ]);
    expect([...PATH_SPECIFIC_COMPREHENSION_IDS].sort()).toEqual([
      "guide-choice-outcome",
      "tracks-choice-outcome",
    ]);
    expect(PATH_SPECIFIC_CHALLENGE_IDS.size).toBe(4);
  });
});
