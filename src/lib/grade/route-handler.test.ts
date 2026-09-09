import { describe, expect, it, vi } from "vitest";

import { createGradePostHandler } from "@/lib/grade/route-handler";
import { GradeError } from "@/lib/grade/shared";

const okSchema = {
  safeParse: (data: unknown) => {
    if (
      data &&
      typeof data === "object" &&
      "id" in data &&
      typeof (data as { id: unknown }).id === "string"
    ) {
      return { success: true as const, data: data as { id: string } };
    }
    return { success: false as const };
  },
};

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("createGradePostHandler", () => {
  it("returns a grade result for a valid body", async () => {
    const grade = vi.fn().mockResolvedValue({
      correct: true,
      reason: "Yes — that matches.",
      hint: null,
    });
    const POST = createGradePostHandler({ schema: okSchema, grade });

    const response = await POST(jsonRequest({ id: "canopy" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      correct: true,
      reason: "Yes — that matches.",
      hint: null,
    });
    expect(grade).toHaveBeenCalledWith({ id: "canopy" });
  });

  it("returns 400 for invalid JSON and invalid bodies", async () => {
    const grade = vi.fn();
    const POST = createGradePostHandler({ schema: okSchema, grade });

    const badJson = await POST(
      new Request("http://localhost/api/grade", {
        method: "POST",
        body: "{",
      }),
    );
    expect(badJson.status).toBe(400);
    expect(await badJson.json()).toEqual({ error: "Invalid request body." });

    const badBody = await POST(jsonRequest({ nope: true }));
    expect(badBody.status).toBe(400);
    expect(grade).not.toHaveBeenCalled();
  });

  it("maps GradeError and unknown throws to error payloads", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const unknownId = createGradePostHandler({
        schema: okSchema,
        grade: async () => {
          throw new GradeError("Unknown challenge.");
        },
      });
      const unknownResponse = await unknownId(jsonRequest({ id: "x" }));
      expect(unknownResponse.status).toBe(400);
      expect(await unknownResponse.json()).toEqual({
        error: "Invalid request body.",
      });
      expect(consoleError).not.toHaveBeenCalled();

      const unavailable = createGradePostHandler({
        schema: okSchema,
        grade: async () => {
          throw new Error("boom");
        },
      });
      const unavailableResponse = await unavailable(jsonRequest({ id: "x" }));
      expect(unavailableResponse.status).toBe(503);
      expect(await unavailableResponse.json()).toEqual({
        error: "Grading is temporarily unavailable.",
      });
      expect(JSON.parse(String(consoleError.mock.calls[0]?.[0]))).toEqual({
        msg: "grade.unavailable",
        errorName: "Error",
        errorMessage: "boom",
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
