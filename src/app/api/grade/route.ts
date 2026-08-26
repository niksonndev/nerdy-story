import { NextResponse } from "next/server";

import {
  gradeExplanation,
  gradeRequestSchema,
  isGradeError,
  type GradeErrorKind,
} from "@/lib/grade";

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

export async function POST(request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = gradeRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const result = await gradeExplanation(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (isGradeError(error)) {
      return errorResponse(error.kind);
    }
    return errorResponse("retryable");
  }
}
