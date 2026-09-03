import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fallbackHintFor } from "@/lib/grade/client";
import { MAX_ATTEMPTS, mysteryWords } from "@/lib/story-data";
import { gradeMiss, gradeOk } from "@/test/grade-fixtures";

const requestVocabularyGrade = vi.hoisted(() => vi.fn());
const requestComprehensionGrade = vi.hoisted(() => vi.fn());

vi.mock("@/lib/grade/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/grade/client")>();
  return {
    ...actual,
    requestVocabularyGrade: (...args: unknown[]) => requestVocabularyGrade(...args),
    requestComprehensionGrade: (...args: unknown[]) =>
      requestComprehensionGrade(...args),
  };
});

import { useStoryReader } from "@/components/story/use-story-reader";

async function startOnPage2() {
  const hook = renderHook(() => useStoryReader());
  act(() => {
    hook.result.current.handleStartReading();
    hook.result.current.goToPage("page-2");
  });
  expect(hook.result.current.pageId).toBe("page-2");
  expect(hook.result.current.canAdvance).toBe(false);
  return hook;
}

async function resolveCanopyAndGoToPage3(
  hook: ReturnType<typeof renderHook<ReturnType<typeof useStoryReader>, unknown>>,
) {
  act(() => {
    hook.result.current.openVocabularyChallenge("canopy");
    hook.result.current.setChildAnswer("treetops high up");
  });
  requestVocabularyGrade.mockResolvedValueOnce(
    gradeOk("Yes — canopy is about the leafy roof of the forest."),
  );
  await act(async () => {
    await hook.result.current.handleVocabularyCheck();
  });
  act(() => {
    hook.result.current.closeVocabularyChallenge();
    hook.result.current.goToPage("page-3");
  });
  expect(hook.result.current.pageId).toBe("page-3");
}

describe("useStoryReader", () => {
  beforeEach(() => {
    requestVocabularyGrade.mockReset();
    requestComprehensionGrade.mockReset();
  });

  describe("vocabulary challenge", () => {
    it("accepts a correct grade, increments words learned, and unlocks Next Page after close", async () => {
      const { result } = await startOnPage2();

      act(() => {
        result.current.openVocabularyChallenge("canopy");
        result.current.setChildAnswer("the leafy roof of the trees");
      });

      requestVocabularyGrade.mockResolvedValueOnce(
        gradeOk("Yes — canopy is about the leafy roof of the forest."),
      );

      await act(async () => {
        await result.current.handleVocabularyCheck();
      });

      expect(result.current.phase).toBe("accepted");
      expect(result.current.acceptedReason).toBe(
        "Yes — canopy is about the leafy roof of the forest.",
      );
      expect(result.current.wordsLearned).toBe(1);
      expect(result.current.learnedWordIds).toContain("canopy");
      expect(result.current.resolvedWordIds).toContain("canopy");
      expect(result.current.canAdvance).toBe(true);

      act(() => {
        result.current.closeVocabularyChallenge();
      });

      expect(result.current.activeWordId).toBeNull();
      expect(result.current.canAdvance).toBe(true);
    });

    it("keeps Next Page gated on a miss and shows reason + hint", async () => {
      const { result } = await startOnPage2();

      act(() => {
        result.current.openVocabularyChallenge("canopy");
        result.current.setChildAnswer("a banana");
      });

      requestVocabularyGrade.mockResolvedValueOnce(
        gradeMiss(
          "Canopy is about treetops high in the forest, not exactly about fruit.",
          "Think about the very top of the forest.",
        ),
      );

      await act(async () => {
        await result.current.handleVocabularyCheck();
      });

      expect(result.current.phase).toBe("prompt");
      expect(result.current.missReason).toBe(
        "Canopy is about treetops high in the forest, not exactly about fruit.",
      );
      expect(result.current.hintText).toBe(
        "Think about the very top of the forest.",
      );
      expect(result.current.canAdvance).toBe(false);
      expect(result.current.wordsLearned).toBe(0);
      expect(result.current.resolvedWordIds).not.toContain("canopy");
    });

    it("reveals meaning after MAX_ATTEMPTS misses without counting words learned", async () => {
      const { result } = await startOnPage2();

      act(() => {
        result.current.openVocabularyChallenge("canopy");
      });

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        act(() => {
          result.current.setChildAnswer(`wrong idea ${i}`);
        });
        requestVocabularyGrade.mockResolvedValueOnce(
          gradeMiss(`Miss reason ${i}`, `Hint ${i}`),
        );
        await act(async () => {
          await result.current.handleVocabularyCheck();
        });
      }

      expect(result.current.phase).toBe("reveal");
      expect(result.current.resolvedWordIds).toContain("canopy");
      expect(result.current.wordsLearned).toBe(0);
      expect(result.current.learnedWordIds).not.toContain("canopy");
      expect(result.current.canAdvance).toBe(true);

      act(() => {
        result.current.closeVocabularyChallenge();
      });

      expect(result.current.activeWordId).toBeNull();
      expect(result.current.canAdvance).toBe(true);
    });

    it("on HTTP fail uses fixed reason and story hint, burning an attempt", async () => {
      const { result } = await startOnPage2();
      const canopyHints = mysteryWords.canopy.hints;

      act(() => {
        result.current.openVocabularyChallenge("canopy");
        result.current.setChildAnswer("something");
      });

      requestVocabularyGrade.mockRejectedValueOnce(new Error("network"));

      await act(async () => {
        await result.current.handleVocabularyCheck();
      });

      expect(result.current.phase).toBe("prompt");
      expect(result.current.missReason).toBe("Not quite — try another way.");
      expect(result.current.hintText).toBe(fallbackHintFor(canopyHints, 0));
      expect(result.current.canAdvance).toBe(false);
      expect(result.current.wordsLearned).toBe(0);
    });
  });

  describe("comprehension challenge", () => {
    it("opens the overlay from Next Page without advancing the page", async () => {
      const hook = await startOnPage2();
      await resolveCanopyAndGoToPage3(hook);
      const { result } = hook;

      let allowed = true;
      act(() => {
        allowed = result.current.handleBeforeNextPage("page-4");
      });

      expect(allowed).toBe(false);
      expect(result.current.pageId).toBe("page-3");
      expect(result.current.activeComprehensionId).toBe("track-clues");
      expect(result.current.phase).toBe("prompt");
    });

    it("accepts a correct grade without incrementing words learned", async () => {
      const hook = await startOnPage2();
      await resolveCanopyAndGoToPage3(hook);
      const { result } = hook;
      const wordsBefore = result.current.wordsLearned;

      act(() => {
        result.current.handleBeforeNextPage("page-4");
        result.current.setChildAnswer("scratched bark and greenish fur");
      });

      requestComprehensionGrade.mockResolvedValueOnce(
        gradeOk("Yes — those clues showed a sloth had been there."),
      );

      await act(async () => {
        await result.current.handleComprehensionCheck();
      });

      expect(result.current.phase).toBe("accepted");
      expect(result.current.wordsLearned).toBe(wordsBefore);

      act(() => {
        result.current.continueComprehension();
      });

      let allowed = false;
      act(() => {
        allowed = result.current.handleBeforeNextPage("page-4");
      });
      expect(allowed).toBe(true);
      expect(result.current.activeComprehensionId).toBeNull();
    });

    it("shows soft miss reason and hint while unresolved", async () => {
      const hook = await startOnPage2();
      await resolveCanopyAndGoToPage3(hook);
      const { result } = hook;

      act(() => {
        result.current.handleBeforeNextPage("page-4");
        result.current.setChildAnswer("they heard birds");
      });

      requestComprehensionGrade.mockResolvedValueOnce(
        gradeMiss(
          "This part is about clues on the branch, not birds.",
          "Look again at what Grandpa Elias noticed on the branch.",
        ),
      );

      await act(async () => {
        await result.current.handleComprehensionCheck();
      });

      expect(result.current.phase).toBe("prompt");
      expect(result.current.missReason).toBe(
        "This part is about clues on the branch, not birds.",
      );
      expect(result.current.hintText).toBe(
        "Look again at what Grandpa Elias noticed on the branch.",
      );
      expect(result.current.activeComprehensionId).toBe("track-clues");
    });

    it("reveals the answer after MAX_ATTEMPTS without counting words learned", async () => {
      const hook = await startOnPage2();
      await resolveCanopyAndGoToPage3(hook);
      const { result } = hook;
      const wordsBefore = result.current.wordsLearned;

      act(() => {
        result.current.handleBeforeNextPage("page-4");
      });

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        act(() => {
          result.current.setChildAnswer(`wrong ${i}`);
        });
        requestComprehensionGrade.mockResolvedValueOnce(
          gradeMiss(`Miss ${i}`, `Hint ${i}`),
        );
        await act(async () => {
          await result.current.handleComprehensionCheck();
        });
      }

      expect(result.current.phase).toBe("reveal");
      expect(result.current.wordsLearned).toBe(wordsBefore);

      act(() => {
        result.current.continueComprehension();
      });

      let allowed = false;
      act(() => {
        allowed = result.current.handleBeforeNextPage("page-4");
      });
      expect(allowed).toBe(true);
    });

    it("Keep going calls advanceTo with the pending next page", async () => {
      const hook = await startOnPage2();
      await resolveCanopyAndGoToPage3(hook);
      const { result } = hook;
      const advanceTo = vi.fn();

      act(() => {
        (
          result.current.pageViewRef as {
            current: { advanceTo: (id: string) => void } | null;
          }
        ).current = { advanceTo };
        result.current.handleBeforeNextPage("page-4");
        result.current.setChildAnswer("scratched bark and green fur");
      });

      requestComprehensionGrade.mockResolvedValueOnce(
        gradeOk("Yes — those were sloth clues."),
      );

      await act(async () => {
        await result.current.handleComprehensionCheck();
      });

      act(() => {
        result.current.continueComprehension();
      });

      expect(advanceTo).toHaveBeenCalledWith("page-4");
      expect(result.current.activeComprehensionId).toBeNull();
    });
  });
});
