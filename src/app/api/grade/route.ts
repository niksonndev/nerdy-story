import { NextResponse } from "next/server";

import { mockGradeExplanation, type GradeRequest } from "@/lib/grade";

// Mock grading endpoint. Swaps for a real live-AI meaning check later;
// the response shape ({ correct, reason }) stays the same.
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

  // Small delay so the playful grading-wait state is visible.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = mockGradeExplanation({
    wordId: body.wordId,
    explanation: body.explanation,
  });

  return NextResponse.json(result);
}
