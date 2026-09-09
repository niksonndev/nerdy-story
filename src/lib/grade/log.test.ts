import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { logGradeLiveFailure, logGradeUnavailable } from "@/lib/grade/log";

describe("grade failure logs", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    consoleError.mockClear();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  function loggedPayload() {
    expect(consoleError).toHaveBeenCalledTimes(1);
    const raw = consoleError.mock.calls[0]?.[0];
    expect(typeof raw).toBe("string");
    return JSON.parse(String(raw)) as Record<string, unknown>;
  }

  it("logs live fallback without child text, reason, or hint", () => {
    const error = Object.assign(new Error("no object"), {
      name: "AI_NoObjectGeneratedError",
    });

    logGradeLiveFailure(
      { feature: "vocabulary-grade", entityId: "canopy" },
      error,
      false,
    );

    const payload = loggedPayload();
    expect(payload).toEqual({
      msg: "grade.live_failed",
      feature: "vocabulary-grade",
      entityId: "canopy",
      errorName: "AI_NoObjectGeneratedError",
      errorMessage: "no object",
      fallback: "local",
      localCorrect: false,
    });
    expect(JSON.stringify(payload)).not.toMatch(/banana|fruit|reason|hint/i);
  });

  it("truncates long error messages and serializes non-Error values", () => {
    logGradeLiveFailure(
      { feature: "comprehension-grade", entityId: "track-clues" },
      new Error("x".repeat(400)),
      true,
    );

    const long = loggedPayload();
    expect(long.errorMessage).toBe("x".repeat(300));
    expect(long.localCorrect).toBe(true);

    consoleError.mockClear();
    logGradeUnavailable("gateway down");

    const unavailable = loggedPayload();
    expect(unavailable).toEqual({
      msg: "grade.unavailable",
      errorName: "Unknown",
      errorMessage: "gateway down",
    });
  });
});
