import { generateText, Output } from "ai";

import { hintForAttempt } from "@/lib/grade/local-helpers";
import {
  logGradeLiveFailure,
  type GradeLiveFailureContext,
} from "@/lib/grade/log";
import {
  buildChildAnswerMessage,
  gradeResultSchema,
} from "@/lib/grade/prompts";
import {
  GRADE_FALLBACK_MODELS,
  GRADE_MAX_OUTPUT_TOKENS,
  GRADE_PRIMARY_MODEL,
  GRADE_TEMPERATURE,
  GradeError,
  type GradeAttempt,
  type GradeLiveOptions,
  type GradeResult,
} from "@/lib/grade/shared";

export type RunLiveGradeOptions = {
  system: string;
  trustedContext: string;
  childAnswer: string;
  outputName: string;
  outputDescription: string;
  tags: readonly string[];
  liveOptions?: GradeLiveOptions;
};

/**
 * Shared AI Gateway generateText call for vocabulary and comprehension.
 * Callers supply prompts, trusted context, output name, and Gateway tags.
 */
export async function runLiveGrade(
  options: RunLiveGradeOptions,
): Promise<GradeResult> {
  const { output } = await generateText({
    model: options.liveOptions?.model ?? GRADE_PRIMARY_MODEL,
    temperature: GRADE_TEMPERATURE,
    maxOutputTokens: GRADE_MAX_OUTPUT_TOKENS,
    output: Output.object({
      schema: gradeResultSchema,
      name: options.outputName,
      description: options.outputDescription,
    }),
    system: options.system,
    messages: [
      {
        role: "user",
        content: options.trustedContext,
      },
      { role: "user", content: buildChildAnswerMessage(options.childAnswer) },
    ],
    providerOptions: {
      gateway: {
        models: [
          ...(options.liveOptions?.failoverModels ?? GRADE_FALLBACK_MODELS),
        ],
        tags: [...options.tags],
      },
    },
  });

  return {
    correct: output.correct,
    reason: output.reason,
    hint: output.correct ? null : output.hint,
  };
}

/**
 * Try live grading, then local keyword fallback. Fatal lookup errors still throw.
 */
export async function gradeWithLocalFallback(
  live: () => Promise<GradeResult>,
  local: () => GradeResult,
  failureContext: GradeLiveFailureContext,
): Promise<GradeResult> {
  try {
    return await live();
  } catch (error) {
    if (error instanceof GradeError) throw error;
    const result = local();
    logGradeLiveFailure(failureContext, error, result.correct);
    return result;
  }
}

type LiveGraderConfig<TRequest, TEntity> = {
  lookup: (request: TRequest) => TEntity | undefined;
  unknownError: string;
  system: string;
  trustedContext: (entity: TEntity, request: TRequest) => string;
  outputName: string;
  outputDescription: string;
  tags: readonly string[];
  leakingHint: (
    entity: TEntity,
    request: TRequest,
    hint: string,
  ) => string | null;
  storyHints: (entity: TEntity) => readonly string[];
};

function withoutLeakingHint(
  result: GradeResult,
  leak: string | null,
  storyHint: string | null,
): GradeResult {
  if (result.correct || !result.hint || !leak || !storyHint) return result;
  return { ...result, hint: storyHint };
}

/**
 * Lookup + live generateText grader. Production wraps this with
 * `createProductionGrader` so Gateway failure still returns a local grade.
 */
export function createLiveGrader<
  TRequest extends { childAnswer: string; priorAttempts?: GradeAttempt[] },
  TEntity,
>(config: LiveGraderConfig<TRequest, TEntity>) {
  return async function gradeLive(
    request: TRequest,
    options?: GradeLiveOptions,
  ): Promise<GradeResult> {
    const entity = config.lookup(request);
    if (!entity) throw new GradeError(config.unknownError);
    const result = await runLiveGrade({
      system: config.system,
      trustedContext: config.trustedContext(entity, request),
      childAnswer: request.childAnswer,
      outputName: config.outputName,
      outputDescription: config.outputDescription,
      tags: config.tags,
      liveOptions: options,
    });
    if (result.correct || !result.hint) return result;
    return withoutLeakingHint(
      result,
      config.leakingHint(entity, request, result.hint),
      hintForAttempt(
        [...config.storyHints(entity)],
        request.priorAttempts?.length ?? 0,
      ),
    );
  };
}

export function createProductionGrader<TRequest>(
  live: (request: TRequest) => Promise<GradeResult>,
  local: (request: TRequest) => GradeResult,
  context: (request: TRequest) => GradeLiveFailureContext,
) {
  return (request: TRequest) =>
    gradeWithLocalFallback(
      () => live(request),
      () => local(request),
      context(request),
    );
}
