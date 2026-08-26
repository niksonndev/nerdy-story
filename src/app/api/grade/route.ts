import { NextResponse } from "next/server";

import { gradeExplanation, type GradeRequest } from "@/lib/grade";

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
  } catch {
    return NextResponse.json(
      { error: "Grading is temporarily unavailable." },
      { status: 503 },
    );
  }
}
