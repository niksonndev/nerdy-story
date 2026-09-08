# Held-out grading evals

A frozen set the prompt is **not** tuned against. The development suite under
`evals/cases/` is for calibration. This set exists so we can say: we tested the
grader on unseen child-like answers, not only the examples we developed against.

**Do not** copy these answers into [`src/lib/grade/prompts.ts`](../../src/lib/grade/prompts.ts).
**Do not** retune the prompt from a single held-out miss.

## Isolation

`bun run eval` never loads these files. Held-out runs only via:

```bash
RUN_LIVE_EVALS=1 bun run eval:heldout            # primary + fallback (default)
RUN_LIVE_EVALS=1 bun run eval:heldout:primary
RUN_LIVE_EVALS=1 bun run eval:heldout:fallback
```

Each case still goes through the isolated live grader (one requested model,
`failoverModels: []`). Local keyword fallback is **not** used here — that path
is unit-tested. Isolated runs are how we compare primary vs fallback without a
Gateway failover silently swapping models.

## What a run records

Per case, in `evals/results/<run-id>-heldout-<domain>.json`:

- expected verdict vs actual `correct`
- requested `model`
- `latencyMs`
- `liveFailed` (grade call threw — excluded from calibration, not a false accept/reject)
- `usedLocalFallback` (always `false` in this suite)

When both models run, the report lists **cross-model divergence**.

## When a case fails

1. Re-check whether the **expected label** is actually right for a 7–9 answer.
2. If the grader is wrong, fix the **system** (prompt, sanitization, hard rules) — not the held-out answer to match the model.
3. If that failure mode is still uncovered after the fix, **add a new** held-out case. Do not edit the same case until it passes.
4. Re-run the **full** held-out suite (`eval:heldout`), not only the failing id.

Target: every case matches expected verdict + hard rules on **both** models.
