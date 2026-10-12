# Rồng DC Academy

Duolingo-style learning game for Dragon Capital investors: five-minute lessons, XP, streaks, hearts, weekly
leagues, and the Rồng DC mascot. Built on the structure of
[duolingo-clone](https://github.com/Davronov-Alimardon/duolingo-clone), with the look of the Investor365 Learn prototype.

| Journey | Teaches | Source |
|---|---|---|
| **1 · Hiểu mình** (B) | Money map, risk profile, goals and planner, compounding, DCA and discipline, the market, asset allocation | AMDD articles + FAQ |
| **2 · Hiểu quỹ** (C) | Fund basics, money market, bond, equity, index & ETF, active vs passive, balanced | Articles W5 + FAQ |
| **3 · Quỹ DC & DragonX** (A) | DC fund family, orders, fees and holding periods, performance, ETF, account, limits, security, ownership | Q&A library (both FAQ documents merged, 208 entries) + fund facts |

Plus **Hỏi Rồng**, an AI assistant that answers from the Q&A library in Rồng's voice.

- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Lesson program (142 lessons):** [docs/CURRICULUM.md](docs/CURRICULUM.md), generated from `content/outline/`
- **Feature list (incl. AI practice):** [docs/FEATURES.md](docs/FEATURES.md)
- **Mindmap:** [docs/MINDMAP.md](docs/MINDMAP.md)
- **Quiz formula:** [docs/QUIZ_FORMULA.md](docs/QUIZ_FORMULA.md) · **Golden path:** [docs/GOLDEN_PATH.md](docs/GOLDEN_PATH.md) · **What's next:** [docs/PLAN.md](docs/PLAN.md)
- **Rồng's tone and mood:** edit [content/ai/rong-voice.md](content/ai/rong-voice.md)

## Run it

```bash
npm install
npm run dev          # http://localhost:3000, embedded PGlite DB in ./.data, no setup
```

Set `DATABASE_URL` to use a real Postgres instead (migrations in `./drizzle` run on boot). Set
`ANTHROPIC_API_KEY` for Hỏi Rồng to answer with Claude; without it, it answers with the closest library entry.

| Command | |
|---|---|
| `npm test` | Unit tests: grading, shuffling, finance math, risk scoring, gamification, content integrity |
| `npm run content:check` | Validate all lesson content (CI gate for content PRs) |
| `npm run docs:curriculum` | Regenerate docs/CURRICULUM.md from the outline |
| `npm run typecheck` · `npm run lint` · `npm run build` | |
| `npm run db:generate` | Regenerate SQL migrations after editing `src/db/schema.ts` |
| `npm run e2e:golden` | End-to-end golden path against a running app (`BASE_URL`, default `http://localhost:3100`) |
| `npm run proto:build` | Rebuild `prototype/rong-dc-academy.html` from `prototype/src` and the live content (library, voice guide) |

## Add a lesson

1. Edit `content/segments/<segment>.ts`: add a lesson with a new kebab-case `id` and challenges. Every graded
   question follows the quiz formula (context → question → 3 options → insight, see docs/QUIZ_FORMULA.md).
2. Cite a source on every graded challenge (`source: { sourceId: "amdd-dca" }`); add new documents to
   `content/sources.ts`. Fees, tax and schedules come from `content/library/fund-facts.ts`.
3. `npm run content:check && npm test`, then open a PR for Compliance review.

Stack: Next.js 15 · React 19 · TypeScript · Tailwind · Drizzle ORM · Postgres / PGlite · Zod · Vitest · Anthropic SDK (Claude) · Playwright (e2e).
