import { NextResponse } from "next/server";

import {
  isGradeError,
  type GradeErrorKind,
  type GradeResult,
} from "@/lib/grade/shared";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false };

type GradeRequestSchema<T> = {
  safeParse: (data: unknown) => ParseResult<T>;
};

function errorResponse(kind: GradeErrorKind) {
  const retryable = kind === "retryable";
  const status = kind === "structured" ? 422 : 503;
  return NextResponse.json(
    {
      error: "Grading is temporarily unavailable.",
      retryable,
      code: kind,
    },
    { status },
  );
}

/**
 * Shared POST wrapper for grade API routes. Keep two URLs; pass schema + grader.
 */
export function createGradePostHandler<T>(options: {
  schema: GradeRequestSchema<T>;
  grade: (data: T) => Promise<GradeResult>;
}) {
  return async function POST(request: Request) {
    let raw: unknown;

    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const parsed = options.schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    try {
      const result = await options.grade(parsed.data);
      return NextResponse.json(result);
    } catch (error) {
      if (isGradeError(error)) {
        return errorResponse(error.kind);
      }
      return errorResponse("retryable");
    }
  };
}
