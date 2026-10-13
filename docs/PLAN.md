# What to build next

Owners: **P** product (you) · **C** content team · **K** Compliance · **E** engineering.

## Decisions (so we don't reopen them)

- **The app is the product; the prototype is frozen for demos.** New features land in the app first. The
  prototype only gets fixes that testers hit (it already reads the library, the risk model and the voice
  guide from the repo). Once the app is on a staging URL, testers move to it.
- **Address form:** Hỏi Rồng and the Q&A library say "anh/chị"; lessons and practice say "bạn".
- **No API key for now.** Hỏi Rồng answers from the library (closest entry). Everything AI-related is built
  so that adding `ANTHROPIC_API_KEY` later switches it on without code changes.
- **Rồng's voice** (`content/ai/rong-voice.md`) is owned by P and edited later; engineering doesn't touch tone.
- **Risk assessment** follows DC's Risk Scoring Framework v2.3, encoded in `content/risk/risk-model.ts`
  (7 questions, scoring §4, confirmation §5). Assumptions where the document is silent are marked there.
- Content is code (TS + Zod), reviewed by pull request; every graded question follows the quiz formula.
- Fees, tax and schedules live only in `content/library/fund-facts.ts`.
- Learners never see internal sources; AI compliance rules live in `src/features/ai/guardrails.ts`.

## Milestone 1: "Hiểu mình" complete in the app (current)

The first stage a new investor meets, finished end to end in the real app, then put on a staging URL for
the team and friendly testers.

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Risk assessment on the Risk Scoring Framework v2.3: scoring, overrides, confirmation, Compliance trail | E | ✅ done |
| 2 | Hỏi Rồng in the app (library answers), daily cap, `ai_messages` log | E | ✅ done |
| 3 | Thư viện page: browse 17 categories, search, linked from Hỏi Rồng | E | ✅ done |
| 4 | New interactions: **Đoán số** (estimate slider) and **Tìm câu sai** (spot the wrong statement) | E | ✅ done |
| 5 | Prototype lessons ported: "1 tỷ trong 30 năm", "Ba phản ứng khi quỹ giảm", "Hồ sơ: chưa thấy CCQ" | E | ✅ done |
| 6 | Content preview mode (`CONTENT_PREVIEW=1`) so writers and Compliance can open any lesson | E | ✅ done |
| 7 | Fund-facts expiry test (fails after ~4 months without re-check) | E | ✅ done |
| 8 | **Công cụ tab**: goal planner (presets from the articles, time to target, monthly amount needed for a chosen year, save to profile) and "25 hay 45 tuổi"; Nhiệm vụ moved to the gift icon | E | ✅ done |
| 9 | **Interactive lesson types**: "Ba phản ứng" decision simulation (`reaction_sim`) and "Nhà tiên tri" timing game (`timing_game`), seeded and tested in `features/simulations` | E | ✅ done |
| 10 | **Write Hiểu mình** from the outline: all 57 stage-B outline lessons now have a playable lesson (7 units, 55 lessons incl. 6 checkpoints). Drafts on the formula; review by K, starting with the facts each writer flagged | C + K | ✅ drafted, K review open |
| 11 | **Staging deploy** with Postgres, `CONTENT_PREVIEW=1` for reviewers | E | needs a hosting decision |
| 12 | Confirm flagged facts: sell-fee tier 1–2 years, NAV time, legacy funds, DIAMOND criteria, past returns | K + C | open |
| 13 | Prototype screen index: "Tình huống: bán hết khi giảm" (17) should sit under "Luyện tình huống AI" (16) | E | open (small) |

## Milestone 2: Hiểu quỹ + AI practice

- Stage C lessons (Hiểu quỹ) are drafted: all 42 outline lessons covered (8 units, 40 lessons). K review open.
- Write stage A (DC funds) on the library: 5 of 43 outline lessons built so far.
- **Luyện tình huống AI** in the app: persona + coach routes with the same guardrails and voice; scripted
  replies and the rule-based coach until the API key arrives (as the prototype does).
- Compliance review page over `ai_messages` (filter by guardrail flag, mark reviewed).
- Hỏi Rồng eval set (40–60 real questions with must/must-not facts), ready for when the model is switched on.

## Milestone 3: pilot

- DragonX SSO behind `getUserId()`; anonymous progress merged on first login.
- Production hosting (VN-hosted if required), migrations as a deploy step, backups.
- Funnel analytics: onboarding → first lesson → day-2 return → Hỏi Rồng → DragonX CTA.
- Badges, unit chests, streak reminders; remaining AI scenarios.
- Internal pilot with staff, then 100 friendly investors.

## Open questions for the business

1. Where do we host staging and production (Vercel, a VN cloud, on-prem)? Must learner data stay in Vietnam?
2. Who signs off lessons, the risk self-check and AI answers, and at what turnaround?
3. May Hỏi Rồng and the risk check be used before login, or only by DragonX customers?
4. Retention period for `ai_messages` (questions may contain personal details)?
5. Are rewards (fee waivers, gifts) allowed for streaks or leagues?
