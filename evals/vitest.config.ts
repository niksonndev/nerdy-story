import path from "node:path"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

// Load .env.local (VERCEL_OIDC_TOKEN etc.) the same way `next dev` would, so
// `bun run eval` works after `vercel env pull` without manual sourcing.
const env = loadEnv("", path.resolve(__dirname, ".."), "")

type EvalSuite = "dev" | "heldout"

function resolveEvalSuite(): EvalSuite {
  const raw = process.env.EVAL_SUITE
  if (!raw || raw === "dev") return "dev"
  if (raw === "heldout") return "heldout"
  throw new Error(
    `Invalid EVAL_SUITE="${raw}" — expected one of: dev, heldout.`,
  )
}

const evalSuite = resolveEvalSuite()

// Live-model evals: node environment, long per-case timeout, and a capped
// concurrency so parallel Gateway calls don't trip provider rate limits.
// Held-out stays out of `bun run eval` so prompt tuning cannot see it.
export default defineConfig({
  test: {
    environment: "node",
    include:
      evalSuite === "heldout"
        ? ["evals/held-out/**/*.eval.test.ts"]
        : ["evals/*.eval.test.ts"],
    // Real shell env wins; .env.local fills in the AI Gateway credentials.
    env,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    maxConcurrency: 4,
    // A single fork keeps the in-memory result recorder shared across files so
    // the reporter and divergence report see every case.
    pool: "threads",
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
})
