# What to build next

Status on 12 Oct 2026: the skeleton runs end to end ([`GOLDEN_PATH.md`](./GOLDEN_PATH.md)), 19 of the
142 outlined lessons are playable and follow the quiz formula ([`QUIZ_FORMULA.md`](./QUIZ_FORMULA.md)),
the merged Q&A library has 208 entries, and Hỏi Rồng is live in the app behind an API key. The prototype
covers more surface than the app (AI role-play, coach, tools) and is now built from the repo.

Owners: **P** product (you) · **C** content team · **K** Compliance · **E** engineering.

## P0: before anyone outside the team sees it (1–2 weeks)

| # | Item | Owner | Done when |
|---|---|---|---|
| 1 | **Rồng's voice.** Rewrite `content/ai/rong-voice.md` (tone, mood, length, examples), then `npm run proto:build` and try it in the prototype | P | Five sample answers read the way you want |
| 2 | **Hỏi Rồng eval set.** 40–60 real investor questions (from CS tickets + the library) with the facts each answer must contain and must not contain. A script scores answers; run it before and after every voice or prompt change | E + P | Baseline score recorded; voice changes are measured, not eyeballed |
| 3 | **Confirm the flagged facts**: sell-fee tier 1–2 years, NAV publishing time, legacy funds (VSF/VFS), DIAMOND criteria, quoted past returns | K + C | `fund-facts.ts` updated, `FACTS_AS_OF` bumped |
| 4 | **Prototype bug**: in the screen index, "Tình huống: bán hết khi giảm" (17) is a step inside "Luyện tình huống AI" (16), not its own item. The AI group should show two items, Luyện tình huống với AI and Hỏi Rồng, with the scenario as a sub-step | E | Index shows the hierarchy; prototype republished |
| 5 | **Abuse limits on `/api/rong`**: per-learner daily cap and question length (already capped at 600 chars), friendly message when hit | E | Cap enforced and tested |
| 6 | **API key in the deploy environment** and a spend alert on the Anthropic workspace | E | Hỏi Rồng answers with the model in staging |

## P1: MVP content and the AI practice (3–5 weeks)

| # | Item | Owner | Done when |
|---|---|---|---|
| 7 | **Write the Hiểu mình lessons** from the outline (stage B first, 50 lessons), every graded item on the formula. Then Hiểu quỹ (C) | C, reviewed by K | `npm test` green; each lesson reviewed once by Compliance |
| 8 | **One lesson source.** Generate the prototype's lessons from `content/segments` instead of the hand-written `LESSONS` in `prototype/src/app1.js`, so the two can't drift | E | Prototype lessons = app lessons |
| 9 | **Luyện tình huống AI in the app**: persona route (streamed) + coach route (structured JSON scores via `output_config.format`), both using the voice guide sections and guardrails, logged to `ai_messages`. Start with the 5 open scenarios | E | Scenario playable in the app; coach output validated by schema; added to the golden path |
| 10 | **Compliance review page**: list `ai_messages` with guardrail flags, filter by flag, mark reviewed | E + K | Compliance reviews a week of answers in under an hour |
| 11 | **Library in Rồng's voice**: the library answers are written for CS staff ("anh/chị"). Either rewrite them for investors ("bạn") or keep CS wording and let the model rephrase (offline fallback then shows CS wording) | P + C | Decision made; offline answers match the chosen voice |
| 12 | **Thư viện page**: browse and search the library by category (it already powers Hỏi Rồng) | E | Page live, linked from Hỏi Rồng |
| 13 | **Fund facts expiry**: test fails when `FACTS_AS_OF` is older than 90 days | E | Reminder in CI |

## P2: pilot (4–6 weeks)

| # | Item | Owner | Done when |
|---|---|---|---|
| 14 | DragonX SSO behind `getUserId()` (OIDC), anonymous progress merged on first login | E | Pilot users sign in with DragonX |
| 15 | Postgres + hosting (VN-hosted if required), migrations as a deploy step | E | Staging and production environments |
| 16 | Funnel analytics: onboarding → first lesson → day-2 return → Hỏi Rồng → DragonX CTA | E + P | Dashboard |
| 17 | Remaining 3–4 AI scenarios, badges, unit chests, streak reminders | E + C | In pilot build |
| 18 | Internal pilot with staff, then 100 friendly investors | P | Feedback round closed |

## Decisions already made (so we don't reopen them)

- Content is code (TS + Zod), reviewed by pull request; git history is the audit trail.
- Every graded question follows the quiz formula; the schema enforces it.
- Fees, tax and schedules live only in `content/library/fund-facts.ts`.
- Learners never see internal sources ("Nguồn: FAQ …").
- Compliance rules for AI live in code (`src/features/ai/guardrails.ts`); tone lives in `content/ai/rong-voice.md`.
- Hỏi Rồng sends the whole library (≈117k characters) as one cached system block instead of top-k
  retrieval. Revisit if the library grows several times larger; `searchLibrary()` is ready as the
  retrieval step.

## Open questions for the business

1. Who signs off lessons and AI answers, and at what turnaround?
2. May Hỏi Rồng answer before login, or only for DragonX customers?
3. Retention period for `ai_messages` (questions may contain personal details)?
4. Are rewards (fee waivers, gifts) allowed for streaks or leagues?
5. Web app, DragonX tab, or both at pilot?
