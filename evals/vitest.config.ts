import path from "node:path"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

// Load .env.local (VERCEL_OIDC_TOKEN etc.) the same way `next dev` would, so
// `bun run eval` works after `vercel env pull` without manual sourcing.
const env = loadEnv("", path.resolve(__dirname, ".."), "")

// Live-model evals: node environment, long per-case timeout, and a capped
// concurrency so parallel Gateway calls don't trip provider rate limits.
export default defineConfig({
  test: {
    environment: "node",
    include: ["evals/**/*.eval.test.ts"],
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
