# Rồng DC Academy

Duolingo-style learning game for Dragon Capital investors: five-minute lessons, XP, streaks, hearts, weekly
leagues, and the Rồng DC mascot. Built on the structure of
[duolingo-clone](https://github.com/Davronov-Alimardon/duolingo-clone), with the look of the Investor365 Learn prototype.

| Journey | Teaches | Source |
|---|---|---|
| **1 · Hiểu mình** (B) | Money map, risk profile, goals and planner, compounding, DCA and discipline, the market, asset allocation | AMDD articles + FAQ |
| **2 · Hiểu quỹ** (C) | Fund basics, money market, bond, equity, index & ETF, active vs passive, balanced | Articles W5 + FAQ |
| **3 · Quỹ DC & DragonX** (A) | DC fund family, orders, fees and holding periods, performance, ETF, account, limits, security, ownership | FAQ (133 questions) |

- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Lesson program (142 lessons):** [docs/CURRICULUM.md](docs/CURRICULUM.md), generated from `content/outline/`
- **Feature list (incl. AI practice):** [docs/FEATURES.md](docs/FEATURES.md)
- **Mindmap:** [docs/MINDMAP.md](docs/MINDMAP.md)

## Run it

```bash
npm install
npm run dev          # http://localhost:3000, embedded PGlite DB in ./.data, no setup
```

Set `DATABASE_URL` to use a real Postgres instead (migrations in `./drizzle` run on boot).

| Command | |
|---|---|
| `npm test` | Unit tests: grading, shuffling, finance math, risk scoring, gamification, content integrity |
| `npm run content:check` | Validate all lesson content (CI gate for content PRs) |
| `npm run docs:curriculum` | Regenerate docs/CURRICULUM.md from the outline |
| `npm run typecheck` · `npm run lint` · `npm run build` | |
| `npm run db:generate` | Regenerate SQL migrations after editing `src/db/schema.ts` |

## Add a lesson

1. Edit `content/segments/<segment>.ts`: add a lesson with a new kebab-case `id` and challenges.
2. Cite a source on every graded challenge (`source: { sourceId: "faq", locator: "Câu 10" }`); add new
   documents to `content/sources.ts`.
3. `npm run content:check && npm test`, then open a PR for Compliance review.

Stack: Next.js 15 · React 19 · TypeScript · Tailwind · Drizzle ORM · Postgres / PGlite · Zod · Vitest.
