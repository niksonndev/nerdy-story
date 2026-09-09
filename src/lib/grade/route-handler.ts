import { NextResponse } from "next/server";

import { logGradeUnavailable } from "@/lib/grade/log";
import { isGradeError, type GradeResult } from "@/lib/grade/shared";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false };

type GradeRequestSchema<T> = {
  safeParse: (data: unknown) => ParseResult<T>;
};

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
        return NextResponse.json(
          { error: "Invalid request body." },
          { status: 400 },
        );
      }
      logGradeUnavailable(error);
      return NextResponse.json(
        { error: "Grading is temporarily unavailable." },
        { status: 503 },
      );
    }
  };
}
