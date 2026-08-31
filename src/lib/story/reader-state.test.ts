import { describe, expect, it } from "vitest";

import {
  BRANCH_PAGE_ID,
  challengeUiReducer,
  initialChallengeUi,
  initialStorySession,
  storySessionReducer,
} from "@/lib/story/reader-state";

describe("challengeUiReducer", () => {
  it("restores reason, hint, and attempts after close then reopen", () => {
    let state = challengeUiReducer(initialChallengeUi, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    state = challengeUiReducer(state, {
      type: "recordFailedAttempt",
      submitted: "a house",
      reason: "Shelter is about a safe covered place, not exactly about a house.",
      hint: "Think about where Pip hides from the rain.",
      nextAttempts: 1,
    });

    state = challengeUiReducer(state, { type: "close" });

    expect(state.kind).toBeNull();
    expect(state.id).toBeNull();
    expect(state.missReason).toBeNull();
    expect(state.progressById.shelter).toEqual({
      phase: "prompt",
      explanation: "",
      attempts: 1,
      priorAttempts: [
        {
          explanation: "a house",
          reason:
            "Shelter is about a safe covered place, not exactly about a house.",
          hint: "Think about where Pip hides from the rain.",
        },
      ],
      missReason:
        "Shelter is about a safe covered place, not exactly about a house.",
      hintText: "Think about where Pip hides from the rain.",
      acceptedReason: null,
    });

    state = challengeUiReducer(state, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    expect(state.attempts).toBe(1);
    expect(state.missReason).toBe(
      "Shelter is about a safe covered place, not exactly about a house.",
    );
    expect(state.hintText).toBe("Think about where Pip hides from the rain.");
    expect(state.priorAttempts).toHaveLength(1);
  });

  it("preserves progress on word A when switching to word B and back", () => {
    let state = challengeUiReducer(initialChallengeUi, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    state = challengeUiReducer(state, {
      type: "recordFailedAttempt",
      submitted: "a house",
      reason: "Not quite about a house.",
      hint: "Hint for shelter.",
      nextAttempts: 1,
    });

    state = challengeUiReducer(state, {
      type: "open",
      kind: "vocab",
      id: "snug",
    });

    expect(state.id).toBe("snug");
    expect(state.attempts).toBe(0);
    expect(state.missReason).toBeNull();
    expect(state.progressById.shelter?.attempts).toBe(1);

    state = challengeUiReducer(state, {
      type: "recordFailedAttempt",
      submitted: "warm",
      reason: "Snug is about cozy and comfy.",
      hint: "Hint for snug.",
      nextAttempts: 1,
    });

    state = challengeUiReducer(state, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    expect(state.id).toBe("shelter");
    expect(state.attempts).toBe(1);
    expect(state.missReason).toBe("Not quite about a house.");
    expect(state.hintText).toBe("Hint for shelter.");
    expect(state.progressById.snug?.attempts).toBe(1);
  });

  it("clears progressById on reset", () => {
    let state = challengeUiReducer(initialChallengeUi, {
      type: "open",
      kind: "comprehension",
      id: "find-shelter",
    });

    state = challengeUiReducer(state, {
      type: "recordFailedAttempt",
      submitted: "Pip ran away",
      reason: "Pip looked for shelter.",
      hint: "Where did Pip go?",
      nextAttempts: 1,
    });

    state = challengeUiReducer(state, { type: "close" });
    expect(Object.keys(state.progressById)).toHaveLength(1);

    state = challengeUiReducer(state, { type: "reset" });

    expect(state).toEqual(initialChallengeUi);
    expect(state.progressById).toEqual({});
  });

  it("simulates read-again: close/open cycle then reset yields fresh state", () => {
    let state = challengeUiReducer(initialChallengeUi, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    state = challengeUiReducer(state, {
      type: "recordFailedAttempt",
      submitted: "a house",
      reason: "Not quite.",
      hint: "Try again.",
      nextAttempts: 1,
    });
    state = challengeUiReducer(state, { type: "close" });
    state = challengeUiReducer(state, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    expect(state.attempts).toBe(1);

    state = challengeUiReducer(state, { type: "reset" });

    state = challengeUiReducer(state, {
      type: "open",
      kind: "vocab",
      id: "shelter",
    });

    expect(state.attempts).toBe(0);
    expect(state.missReason).toBeNull();
    expect(state.hintText).toBeNull();
  });
});

describe("storySessionReducer", () => {
  it("jumpToBranch preserves learned words and explored endings while clearing path-specific progress", () => {
    const state = {
      ...initialStorySession,
      pageId: "page-7a",
      learnedWordIds: ["shelter", "snug", "lullaby"],
      exploredEndingIds: ["page-7a"],
      resolvedWordIds: ["shelter", "snug", "lullaby"],
      resolvedComprehensionIds: ["find-shelter", "cozy-nap"],
      beatSession: 2,
    };

    const next = storySessionReducer(state, { type: "jumpToBranch" });

    expect(next.pageId).toBe(BRANCH_PAGE_ID);
    expect(next.endingView).toBe("beat");
    expect(next.learnedWordIds).toEqual(["shelter", "snug", "lullaby"]);
    expect(next.exploredEndingIds).toEqual(["page-7a"]);
    expect(next.resolvedWordIds).toEqual(["shelter", "snug"]);
    expect(next.resolvedComprehensionIds).toEqual(["find-shelter"]);
    expect(next.beatSession).toBe(3);
  });
});
