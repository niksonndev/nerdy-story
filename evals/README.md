# Grading evals

Live-model evals for the vocabulary and comprehension graders. Unlike the unit
tests under `src/lib/grade/` (which mock the model and cover the local keyword
fallback), these call the real grader through the Vercel AI Gateway.

They are **opt-in** and excluded from `bun test`.

## What they check

For every case, against each selected model:

1. **Verdict** — does `correct` match the expected accept/reject?
2. **Feedback rules (deterministic)** — no shame language, sane reason length,
   hint cleared on correct / present on wrong, hint and reason do not leak the
   definition or reveal text verbatim.

**Manual review (boundary + gaming)** — after a run, read the report's manual
review section (or the JSON in `evals/results/`) for qualitative calibration on
edge cases. `boundaryRationale` and `expectedReasonConcept` on each case guide
what to look for:

- Does the verdict match the human adjudication in `boundaryRationale`?
- Is the reason kid-friendly and directionally right without dumping the answer?
- Does the hint nudge without revealing?

## Running

Credentials come from `.env.local` (loaded automatically). Pull them once:

```bash
vercel env pull
```

Then run:

```bash
RUN_LIVE_EVALS=1 bun run eval            # primary model only (default)
RUN_LIVE_EVALS=1 bun run eval:primary    # openai/gpt-oss-120b
RUN_LIVE_EVALS=1 bun run eval:fallback   # google/gemini-3.1-flash-lite
RUN_LIVE_EVALS=1 bun run eval:all-models # both, with a divergence report
```

Without `RUN_LIVE_EVALS=1` the suite is skipped (so it never makes live calls by
accident). Filter to a few cases while iterating:

```bash
RUN_LIVE_EVALS=1 bunx vitest run --config evals/vitest.config.ts -t "canopy"
```

### `EVAL_MODELS`

Selects which grader model(s) run. Sourced from `GRADE_PRIMARY_MODEL` /
`GRADE_FALLBACK_MODELS` in `src/lib/grade/shared.ts` — never hardcoded here.

### Cost and runtime

Each case makes one grader call. A full run is ~125 cases per domain.

| `EVAL_MODELS` | grader calls | approx time (concurrency 4) |
| ------------- | ------------ | --------------------------- |
| `primary`     | ~125         | 8-12 min                    |
| `fallback`    | ~125         | 8-12 min                    |
| `all`         | ~250         | 15-25 min                   |

Use `primary` for day-to-day prompt tuning; run `all` before shipping prompt
changes to catch calibration that helps one model but hurts the other.

## Reading the results

Console output prints, per model: overall pass rate, per-category pass rate, a
category x word/challenge matrix (to spot word-specific luck), per reason-tag
pass rate, every failure with its reason, and a **manual review** block for
boundary/gaming cases (answer, verdict, reason, hint, rationale). When more than
one model runs, a cross-model divergence list shows cases where the models
disagree.

When a live grade call fails (rate limit, provider error, etc.), the outcome is
**excluded**: `"actualCorrect": null` and `"reason": "(threw)"`. These are not
model verdicts — use `excluded` / `gradedPassed` in the JSON report for
calibration metrics without counting infrastructure failures as false accepts
or rejects.

The same data is written to `evals/results/<run-id>-<domain>.json` (gitignored)
so you can diff runs while tuning prompts in `src/lib/grade/prompts.ts`. Outcomes
for boundary/gaming cases include `"manualReview": true`.

## Adding a case

Cases live in `evals/cases/{vocabulary,comprehension}/` split by intent:
`accept.ts`, `reject.ts`, `boundary.ts`, `gaming.ts`.

1. Copy a nearby case and give it a unique `id` (must start with `vocab-` or
   `comp-` so the reporter groups it correctly).
2. Pick a `category` and set `wordId` or `challengeId` and `expectedCorrect`.
3. For rejects, set `expectedReasonTag`; for `reject-wrong` and `boundary`
   rejects also set `expectedReasonConcept` (the domain/idea the child landed
   in). Every `boundary` case needs a `boundaryRationale`.

`evals/cases/index.ts` validates coverage at import time (minimum cases per
category, cross-word/challenge spread, reason-tag counts) and fails fast if the
dataset drifts below the rigor thresholds — so you will hear about a thin
category immediately, even without `RUN_LIVE_EVALS`.

If a case is flaky, fix the grader prompt rather than weakening the assertion.
