# nerdy-story

English reading literacy app for kids — narrative-driven and AI-powered.

**Age band:** 7–9 years old / 2nd–3rd grade reading level. All story text, vocabulary difficulty, and sentence complexity are calibrated to this band.

## Core loop

- Pre-written interactive story with an embedded vocabulary challenge mechanic
- Challenge answers are graded live by **chatgpt-4o-mini** (`openai/gpt-4o-mini`) via **Vercel AI Gateway**, with failover to another Gateway model if needed — semantic match to the word’s meaning, plus a live **hint** on wrong answers (same call). If that live call still fails, the server falls back to a **local keyword matcher** and returns a normal grade (same response shape). Client **pre-written hints** apply only when the grade HTTP request itself fails (transport / non-OK). Story definitions, soft progression, and words-learned stay the same either way.
- Words learned (session count of correctly graded challenge words), feedback after each grade, and a closing unlock beat for the demo

## Demo / MVP constraints

- **Deadline:** September 7 — deliverable is a 2–3 minute demo video
- Build the smallest version of the full loop that demos well
- Out of MVP scope: playable chapter 2, settings, auth, persistence

## How to run

Requires [Bun](https://bun.sh). Vocab grading prefers **Vercel AI Gateway** (primary `openai/gpt-4o-mini` / chatgpt-4o-mini, with model failover). If Gateway/OIDC fails after that failover, the API still returns a grade via the local keyword matcher so the vocab loop is not blocked — live AI remains the intended grader. Educational logic does not depend on a specific provider. Local auth is `VERCEL_OIDC_TOKEN` from a linked project:

```bash
vercel link   # once
vercel env pull
bun install
bun run dev
```

OIDC tokens expire ~12 hours — run `vercel env pull` again if live grading auth fails locally (the local matcher still grades). On Vercel, OIDC is automatic.

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the Next.js dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run test` | Run Vitest (use `bun run test`, not `bun test`) |
| `bun run lint` | ESLint |

## Agent constraints

Full product, tech stack, and process decisions for AI agents live in [`.cursor/rules/product-mvp.mdc`](.cursor/rules/product-mvp.mdc).
