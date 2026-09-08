import { describe, expect, it } from "vitest";

import { hintLeakMessage } from "@/lib/grade/hint-leak";
import { comprehensionChallenges, mysteryWords } from "@/lib/story/story-data";

describe("hintLeakMessage", () => {
  it("flags a nocturnal hint that names night and day", () => {
    expect(
      hintLeakMessage(
        "When does a nocturnal animal do most of its activity—day or night?",
        [mysteryWords.nocturnal.targetDefinition],
        { nocturnal: true },
      ),
    ).toMatch(/night\/day/i);
  });

  it("flags a camouflage hint that names blend", () => {
    expect(
      hintLeakMessage(
        "Think of colors or patterns that blend into the leaves.",
        [mysteryWords.camouflage.targetDefinition],
        { camouflage: true },
      ),
    ).toMatch(/blend/i);
  });

  it("flags two-token overlap with the definition", () => {
    expect(
      hintLeakMessage("It's the roof-like layer of trees.", [
        mysteryWords.canopy.targetDefinition,
      ]),
    ).toMatch(/overlapping tokens/i);
  });

  it("allows a wondering camouflage hint", () => {
    expect(
      hintLeakMessage(mysteryWords.camouflage.hints[0]!, [
        mysteryWords.camouflage.targetDefinition,
        mysteryWords.camouflage.meaningReveal,
      ], { camouflage: true }),
    ).toBeNull();
  });

  it("does not treat nodding to the child's words as a leak", () => {
    expect(
      hintLeakMessage(
        "What covers the very tops of those tall trees?",
        [
          mysteryWords.canopy.targetDefinition,
          mysteryWords.canopy.meaningReveal,
        ],
        { allowedText: "the trees are tall" },
      ),
    ).toBeNull();
  });

  it("still flags a definition dump when the child said something else", () => {
    expect(
      hintLeakMessage("It's the roof-like layer of trees.", [
        mysteryWords.canopy.targetDefinition,
      ], { allowedText: "a kind of tasty fruit" }),
    ).toMatch(/overlapping tokens/i);
  });
});

describe("story hints do not define the answer", () => {
  it("keeps every mystery-word hint as a wondering question without leaking", () => {
    for (const word of Object.values(mysteryWords)) {
      for (const hint of word.hints) {
        expect(hint, word.id).toMatch(/\?/);
        expect(
          hintLeakMessage(hint, [word.targetDefinition, word.meaningReveal], {
            camouflage: word.id === "camouflage",
            nocturnal: word.id === "nocturnal",
          }),
        ).toBeNull();
      }
    }
  });

  it("keeps every comprehension hint as a wondering question without leaking", () => {
    for (const challenge of Object.values(comprehensionChallenges)) {
      for (const hint of challenge.hints) {
        expect(hint, challenge.id).toMatch(/\?/);
        expect(
          hintLeakMessage(hint, [
            challenge.expectedUnderstanding,
            challenge.answerReveal,
          ]),
        ).toBeNull();
      }
    }
  });
});
