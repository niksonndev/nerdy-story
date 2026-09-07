import {
  comprehensionGradeRequestSchema,
  gradeComprehension,
} from "@/lib/grade/comprehension";
import { createGradePostHandler } from "@/lib/grade/route-handler";

export const POST = createGradePostHandler({
  schema: comprehensionGradeRequestSchema,
  grade: gradeComprehension,
});
