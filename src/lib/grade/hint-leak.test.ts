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

  it("does not treat a forest-looking wondering question as a canopy dump", () => {
    expect(
      hintLeakMessage(
        "What part of the rainforest do you see when you look up at the trees?",
        [
          mysteryWords.canopy.targetDefinition,
          mysteryWords.canopy.meaningReveal,
        ],
        { allowedText: "a kind of tasty fruit you eat" },
      ),
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

  it("does not treat 'most active' as a nocturnal dump against the definition", () => {
    expect(
      hintLeakMessage(
        "When do you think this animal is most active?",
        [mysteryWords.nocturnal.targetDefinition],
        { nocturnal: true, allowedText: "an animal that loves to swim in water" },
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

  it("allows a tracks wondering hint that says way/her without naming faint/split", () => {
    const challenge = comprehensionChallenges["tracks-choice-outcome"];
    const question = challenge.question;
    expect(
      hintLeakMessage(
        "What part of the trail made it hard to know the right way at first?",
        [challenge.answerReveal],
        {
          allowedText: `following the tracks was risky because it was risky at first ${question}`,
        },
      ),
    ).toBeNull();
    expect(
      hintLeakMessage(
        "If you look at the path Mia was following, what made it hard for her to know which way to go?",
        [challenge.answerReveal],
        {
          allowedText: `This bark was scraped recently — a sloth passed through here, not long ago. ${question}`,
        },
      ),
    ).toBeNull();
  });

  it("still flags a tracks hint that names faint and split", () => {
    const challenge = comprehensionChallenges["tracks-choice-outcome"];
    expect(
      hintLeakMessage(
        "The prints grew faint and the trail split — look at that.",
        [challenge.answerReveal],
        { allowedText: challenge.question },
      ),
    ).toMatch(/overlapping tokens/i);
  });

  it("flags a tracks hint that names trail and split together", () => {
    const challenge = comprehensionChallenges["tracks-choice-outcome"];
    expect(
      hintLeakMessage(
        "Can you look back at the passage to see what happened when the trail split?",
        [challenge.answerReveal],
        {
          tracksSplit: true,
          allowedText: challenge.question,
        },
      ),
    ).toMatch(/trail-split/i);
  });

  it("flags a ranger-timing hint that names rest and moving together", () => {
    const challenge = comprehensionChallenges["guide-choice-outcome"];
    expect(
      hintLeakMessage(
        "What time of day did the ranger say the sloths rest and then start moving?",
        [challenge.answerReveal],
        {
          slothTiming: true,
          allowedText: `sloths are always sleeping all the time ${challenge.question}`,
        },
      ),
    ).toMatch(/rest\/moving/i);
  });

  it("allows a ranger-timing hint that only asks when they start moving", () => {
    const challenge = comprehensionChallenges["guide-choice-outcome"];
    expect(
      hintLeakMessage(
        "When did she say they start moving around?",
        [challenge.answerReveal],
        {
          slothTiming: true,
          allowedText: `sloths are always sleeping all the time ${challenge.question}`,
        },
      ),
    ).toBeNull();
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
          ], {
            slothTiming: challenge.id === "guide-choice-outcome",
          }),
        ).toBeNull();
      }
    }
  });
});
