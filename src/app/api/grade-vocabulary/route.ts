import { createGradePostHandler } from "@/lib/grade/route-handler";
import {
  gradeVocabulary,
  vocabularyGradeRequestSchema,
} from "@/lib/grade/vocabulary";

export const POST = createGradePostHandler({
  schema: vocabularyGradeRequestSchema,
  grade: gradeVocabulary,
});
