import { describe, expect, it } from "vitest";

import {
  buildLocalHitReason,
  buildLocalMissReason,
  extractChildIdea,
  extractChildPhrase,
  hasPassagePaste,
} from "@/lib/grade/local-helpers";
import { comprehensionChallenges } from "@/lib/story/story-data";

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

describe("extractChildPhrase", () => {
  it("skips leading filler and keeps the child's phrasing", () => {
    expect(extractChildPhrase("the top of the trees")).toBe("top of the trees");
  });

  it("caps a long answer at a word boundary", () => {
    const phrase = extractChildPhrase(
      "the layer all the tall tree branches make at the very top of the forest",
    );
    expect(phrase.length).toBeLessThanOrEqual(40);
    expect(phrase).toMatch(/layer/i);
    expect(phrase).not.toMatch(/forest$/);
  });

  it("falls back when nothing salient remains", () => {
    expect(extractChildPhrase("")).toBe("what you said");
    expect(extractChildPhrase("yes")).toBe("what you said");
  });
});

describe("buildLocalHitReason", () => {
  it("echoes the child then names the vocab idea", () => {
    expect(
      buildLocalHitReason({
        kind: "vocabulary",
        word: "canopy",
        coreIdea: "treetops high in the forest",
        childAnswer: "the top of the trees",
      }),
    ).toBe(
      "Yes — you said top of the trees. Canopy is about treetops high in the forest.",
    );
  });

  it("echoes the child then names the comprehension idea", () => {
    expect(
      buildLocalHitReason({
        kind: "comprehension",
        coreIdea: "clues on the branch",
        childAnswer: "because of the scraped bark and green fur",
      }),
    ).toBe(
      "Yes — you said because of the scraped bark and green. This part is about clues on the branch.",
    );
  });
});

describe("hasPassagePaste", () => {
  const passage = comprehensionChallenges["track-clues"].passage;

  it("flags a long consecutive n-gram from this page", () => {
    expect(
      hasPassagePaste(
        "pointed at some scratched bark and a few strands of greenish fur caught in the wood",
        passage,
      ),
    ).toBe(true);
  });

  it("allows a short clue in the child's own words", () => {
    expect(hasPassagePaste("scratched bark and green fur", passage)).toBe(
      false,
    );
  });
});
