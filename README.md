# nerdy-story

An interactive storybook for ages **7–9** (2nd–3rd grade). Kids read a rainforest adventure, explain mystery words in their own language, and answer story questions — graded for meaning, not spelling.

Built for Nerdy **Prompt 03 — English Reading Game**: literacy through narrative, not a worksheet with a plot on top.

## The learning problem

Most “reading games” for this age do one of two things:

- **Quiz the story** — multiple choice, score, shame. Kids hunt for the right bubble instead of making meaning.
- **Tell the story** — pretty pages, no check that the child understood the word or the why.

Fluency research is blunt: rereading helps, producing a word’s meaning helps more than recognizing it, and comprehension is explaining a causal link — not picking option C.

**nerdy-story** is a short, pre-written story (*Mia and the Hidden Sloth*) with two embedded mechanics:

| Skill | What the child does | What we refuse |
| --- | --- | --- |
| **Vocabulary** | “Explain what you understand by *canopy*.” | Multiple choice, “use it in a sentence” |
| **Comprehension** | Open-ended question about *this* page | Auto-quiz on page enter, gradebook scores |
| **Fluency** | A real branch (“what if I’d chosen the other path?”) so reread is tempting | Gating the fork on a “correct” choice |

AI grades whether the explanation matches the idea. The story text itself is **not** generated live — reading level stays under our control.

## The loop (one sitting)

Five challenges per playthrough: **3 vocabulary + 2 comprehension**.

1. Cover → **Start Reading** into a page-turn storybook.
2. Tap a highlighted mystery word → overlay → type an explanation → live grade (reason + hint on a miss).
3. **Next Page** on a comprehension page opens a story question (never auto-opens). After resolve, the page turns.
4. At the fork, both paths are narratively valid. Vocab #3 and the second comprehension item are path-specific; the child still sees exactly 3 + 2.
5. Ending beat: book-coloring → live **words learned** (correct vocab only) → chapter-2 unlock (stub — the demo shows the unlock, not a second chapter).

Soft progression: after a retry limit, we reveal the meaning / answer and let them continue. A child is never trapped on a perfect answer. Reveals do **not** count as words learned.

## Where AI is — and isn’t

**AI grades kid language.** That is the product.

- Open-ended answers → structured result: `correct`, a short kid-friendly **reason**, and on misses a **hint** that nudges without dumping the definition.
- Calibrated for 7–9: accept simplified phrasing, synonyms, imperfect grammar, and *partial-but-correct* understanding; reject a different concept, a parroted passage, or a vague answer that would fit any word.
- Primary model `openai/gpt-oss-120b` via **Vercel AI Gateway**, failover to `google/gemini-3.1-flash-lite`. Credentials stay server-side (`POST /api/grade-vocabulary`, `POST /api/grade-comprehension`).
- If live grading still fails, a **local keyword matcher** returns the same grade shape (HTTP 200). The child never sees “the AI is down.”
- Prompt injection: child text is untrusted, isolated from the system prompt, sanitized.

**AI does not write the story.** Pre-written pages keep 2nd–3rd grade accuracy and make the demo reliable.

Grading is tested two ways: Vitest with a mocked model (plus the local fallback), and an opt-in live eval suite (~125 cases per domain: accept, reject, boundary, gaming). See [docs/grading.md](docs/grading.md) and [evals/README.md](evals/README.md).

## Try it (about two minutes)

Requires [Bun](https://bun.sh) and a [Vercel](https://vercel.com)-linked project (OIDC for AI Gateway).

```bash
vercel link          # once
vercel env pull
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

OIDC tokens expire ~12 hours — `vercel env pull` again if live auth fails locally. The local matcher still grades, so the loop is never blocked. On Vercel, OIDC is automatic.

**Walkthrough for reviewers**

1. Start *Mia and the Hidden Sloth*.
2. On page 2, tap **canopy** — explain it in kid words (“the leafy roof”). Watch words-learned tick.
3. On page 3, press **Next Page** — that’s the first comprehension overlay (clues on the branch). Miss once to see the hint; or answer well and keep going.
4. At **Two Paths**, pick either option (not a quiz).
5. Finish the ending vocab word → coloring beat → words learned → “chapter unlocked.”
6. Optional: discover the other ending to show the reread loop.

| Command | What it does |
| --- | --- |
| `bun run dev` | Next.js dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run test` | Vitest (use this, not `bun test`) |
| `bun run eval` | Live grader evals — needs `RUN_LIVE_EVALS=1` |
| `bun run lint` | ESLint |

## Stack

Next.js App Router (Bun) · TypeScript · Vercel AI Gateway · Tailwind + shadcn · Motion · Vitest.

Plain React state for the session. No accounts, no persistence — the demo is one sitting.

## Design notes

- [Learning design](docs/learning-design.md) — fluency, vocab, comprehension, feedback
- [Grading](docs/grading.md) — models, fallback, evals
- [Story navigation](docs/story-navigation.md) — page graph and overlay rules

## Out of scope (on purpose)

Playable chapter 2, settings, auth, saved progress, and live-generated story text. The smallest full loop that demos the pedagogy.
