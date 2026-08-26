import { NextResponse } from "next/server";

import {
  gradeExplanation,
  isGradeError,
  type GradeErrorKind,
  type GradeRequest,
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
  let body: Partial<GradeRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (typeof body.wordId !== "string" || typeof body.explanation !== "string") {
    return NextResponse.json(
      { error: "Missing wordId or explanation." },
      { status: 400 },
    );
  }

  if (body.explanation.trim().length === 0) {
    return NextResponse.json(
      { error: "Explanation cannot be empty." },
      { status: 400 },
    );
  }

  try {
    const result = await gradeExplanation({
      wordId: body.wordId,
      explanation: body.explanation,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (isGradeError(error)) {
      return errorResponse(error.kind);
    }
    return errorResponse("retryable");
  }
}
