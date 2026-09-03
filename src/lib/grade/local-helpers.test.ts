import { describe, expect, it } from "vitest";

import {
  buildLocalMissReason,
  extractChildIdea,
} from "@/lib/grade/local-helpers";

describe("extractChildIdea", () => {
  it("picks the longest non-overlapping token from the answer", () => {
    expect(
      extractChildIdea("a kind of tasty fruit", "treetops high in the forest"),
    ).toBe("fruit");
  });

  it("filters tokens that overlap with coreIdea", () => {
    expect(
      extractChildIdea("careful trees", "treetops high in the forest"),
    ).toBe("careful");
  });

  it("falls back when no salient tokens remain", () => {
    expect(extractChildIdea("", "clues on the branch")).toBe("what you said");
    expect(extractChildIdea("idk", "clues on the branch")).toBe("what you said");
  });
});

describe("buildLocalMissReason", () => {
  it("builds vocabulary miss copy in MVP shape", () => {
    expect(
      buildLocalMissReason({
        kind: "vocabulary",
        word: "canopy",
        coreIdea: "treetops high in the forest",
        childAnswer: "a kind of tasty fruit",
      }),
    ).toBe(
      "Canopy is about treetops high in the forest, not exactly about fruit.",
    );
  });

  it("builds comprehension miss copy in MVP shape", () => {
    expect(
      buildLocalMissReason({
        kind: "comprehension",
        coreIdea: "clues on the branch",
        childAnswer: "because they heard monkeys",
      }),
    ).toBe(
      "This part is about clues on the branch, not exactly about monkeys.",
    );
  });

  it("uses what-you-said fallback for empty answers", () => {
    expect(
      buildLocalMissReason({
        kind: "comprehension",
        coreIdea: "clues on the branch",
        childAnswer: "idk",
      }),
    ).toBe(
      "This part is about clues on the branch, not exactly about what you said.",
    );
  });
});
