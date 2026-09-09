import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GRADE_CLIENT_TIMEOUT_MS,
  requestComprehensionGrade,
  requestVocabularyGrade,
} from "@/lib/grade/client";
import type { GradeResult } from "@/lib/grade/shared";

const okResult: GradeResult = {
  correct: true,
  reason: "Yes — canopy is about treetops high in the forest.",
  hint: null,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function hungFetch(_url: string, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    const signal = init?.signal;
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", () => {
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("grade client", () => {
  it("returns a GradeResult on a fast 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse(okResult))),
    );

    await expect(
      requestVocabularyGrade("canopy", "the top of the trees", []),
    ).resolves.toEqual(okResult);
  });

  it("throws on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ error: "nope" }, 503))),
    );

    await expect(
      requestComprehensionGrade("track-clues", "green fur", []),
    ).rejects.toThrow("Grade request failed");
  });

  it("throws on a 200 with a body that is not a GradeResult", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ error: "garbage" }))),
    );

    await expect(
      requestVocabularyGrade("canopy", "the top of the trees", []),
    ).rejects.toThrow("Grade request failed");
  });

  it("throws on a 200 with invalid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          Promise.resolve(
            new Response("not-json", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
      ),
    );

    await expect(
      requestComprehensionGrade("track-clues", "green fur", []),
    ).rejects.toThrow("Grade request failed");
  });

  it("aborts a hung fetch after the client timeout", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(hungFetch);
    vi.stubGlobal("fetch", fetchMock);

    const pending = requestVocabularyGrade("canopy", "the top of the trees", []);
    const expectRejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });

    await vi.advanceTimersByTimeAsync(GRADE_CLIENT_TIMEOUT_MS);
    await expectRejected;

    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(true);
  });

  it("still succeeds when the response arrives before the timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            setTimeout(() => resolve(jsonResponse(okResult)), 1_000);
          }),
      ),
    );

    const pending = requestVocabularyGrade("canopy", "treetops", []);
    await vi.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual(okResult);
  });
});
