# Feature list

What the app does, screen by screen and system by system. Each row says where the idea comes from
(**P** = Investor365 prototype, **D** = duolingo-clone, **N** = new for investors), whether it exists in the
skeleton (✅) and the phase it belongs to (**MVP** pilot · **V1** public beta · **V2** integration).

Lesson content is planned in [CURRICULUM.md](./CURRICULUM.md) (generated from `content/outline/`).

## 1. Onboarding and personalisation

| # | Feature | What it does | From | Status | Phase |
|---|---|---|---|---|---|
| 1.1 | Chào mừng | Mascot welcome, one-line promise, start or log in | P | ✅ | MVP |
| 1.2 | Chọn hành trình | Experience question (mới bắt đầu / biết chút ít / đang đầu tư DC) picks the starting stage. Replaces the prototype's staff "chọn vai trò" | P→N | ✅ | MVP |
| 1.3 | Mục tiêu mỗi ngày | 5 / 10 / 15 / 20 minutes a day, reminder time | P | ✅ | MVP |
| 1.4 | Biệt danh | Public nickname only; real name never shown | N | ✅ | MVP |
| 1.5 | Kiểm tra xếp lớp | Optional 10-question placement test that unlocks units the investor already knows (Duolingo "jump ahead") | D→N | ✅ (one question per unit, max 10; `/placement/[segment]`) | V1 |
| 1.6 | Hồ sơ rủi ro dẫn đường | After the B2.3 self-assessment, the path highlights the fund-type units for that profile | N | ✅ (profile + recommendation) / ☐ (path highlight) | MVP |

## 2. Learning path

| # | Feature | What it does | From | Status | Phase |
|---|---|---|---|---|---|
| 2.1 | Lộ trình 3 chặng | Hiểu mình → Hiểu quỹ → Quỹ DC & DragonX, zig-zag nodes, units with colour and mascot | P/D | ✅ | MVP |
| 2.2 | Node popover | Tap a node: title, number of questions, minutes, Start / Ôn tập / Đang khoá | P | ☐ (nodes link directly) | MVP |
| 2.3 | Sổ tay phần | Book icon on each unit opens a one-screen cheat sheet of its key facts (generated from outline `facts`) | P | ☐ | MVP |
| 2.4 | Rương thưởng | Chest node mid-unit: XP or streak freeze | P/D | ☐ | V1 |
| 2.5 | Kiểm tra phần / cuối chặng | Checkpoint lessons; ≥ 80% at stage end issues a certificate | P | ✅ (checkpoint type) / ☐ (certificate) | MVP |
| 2.6 | Chuyển chặng | Switch stage with progress per stage | D | ✅ | MVP |

## 3. Lesson engine

| # | Feature | What it does | From | Status | Phase |
|---|---|---|---|---|---|
| 3.1 | Thẻ kiến thức / Câu chuyện | Mascot card with a short concept or the opening of a source story | N | ✅ (info) | MVP |
| 3.2 | Chọn đáp án, Đúng/Sai, Nối cặp, Sắp xếp | Core quiz types; options shuffled, graded on the server | P/D | ✅ | MVP |
| 3.3 | Tính nhanh | Numeric answer with tolerance; accepts `126,05` and `23.700` | P | ✅ | MVP |
| 3.4 | Tình huống | Chat-style scenario with persona and multiple-choice reply | P | ✅ | MVP |
| 3.5 | Tự đánh giá | Scored self-assessment items, no wrong answers, no hearts | N | ✅ | MVP |
| 3.6 | Lập kế hoạch trong bài | Inline goal planner that saves a goal | N | ✅ | MVP |
| 3.7 | Đoán số | Slider guess, then reveal the real figure (e.g. "1 tỷ sau 30 năm thành bao nhiêu?") | N | ✅ | MVP |
| 3.8 | Tìm lỗi sai | Highlight the wrong sentence in a piece of advice (e.g. "NAV cao là quỹ đắt") | N | ✅ | MVP |
| 3.9 | Ra quyết định | Multi-step branching: choose, see what happened in the data, choose again | N | ✅ (reaction_sim) | V1 |
| 3.10 | Hồ sơ hỗ trợ | Support case: read the investor's situation, pick the correct next steps in order | N | ☐ (order type covers a basic version) | MVP |
| 3.11 | Phản hồi có nguồn | Every answer shows explanation + "Nguồn: …" | P | ✅ | MVP |
| 3.12 | Làm lại câu sai | Wrong items re-queued at the end of the lesson | P/D | ✅ | MVP |
| 3.13 | Tim | 5 hearts, −1 per mistake in stages A/C, regen 4 h, +1 per correct practice answer; no purchase | P/D | ✅ | MVP |
| 3.14 | Hết tim / Thoát bài | Modals with mascot | P/D | ✅ (out of hearts) / ☐ (exit confirm) | MVP |
| 3.15 | Màn hoàn thành | XP, accuracy, time, streak, confetti | P/D | ✅ (no confetti) | MVP |
| 3.16 | Âm thanh, rung | Correct/wrong/finish sounds, haptics on mobile | D | ☐ | V1 |
| 3.17 | Đánh dấu đáp án | Highlight chosen option red and correct option green after checking | P | ☐ | MVP |

## 4. Interactive tools (Công cụ)

Reused across lessons and available from the profile as standalone tools. Lesson usage per tool is listed in CURRICULUM.md.

| # | Tool | What it does | Phase |
|---|---|---|---|

Built in the app (`/tools`, math in `src/features/tools/calc.ts`, tested against the articles' figures): 4.1, 4.2, 4.3, 4.6, 4.7, 4.8, 4.9 (stock/bond mix, the balanced-fund article's three scenarios), 4.10, 4.11, 4.13, 4.14. Not built: 4.12 (bond unit moved to the advanced program), 4.15 (needs licensed VN-Index monthly data). 4.4 and 4.5 run inside lessons.

| 4.1 | Lập kế hoạch mục tiêu | Four numbers → time to target, required monthly amount, contributed vs growth chart; multiple named goals (1 tỷ, du học, hưu trí, tự do sự nghiệp, mua nhà) | ✅ basic · MVP full |
| 4.2 | Máy tính lãi kép | Lump sum and periodic; 5-year, 10-year, 30-year markers; "start at 25 vs 45" comparison | MVP |
| 4.3 | Mô phỏng DCA | Same money, DCA vs lump sum, on illustrative or historical NAV series; average cost | MVP |
| 4.4 | Trò chơi Nhà tiên tri | Player picks buy days on a real DCDS series; compared with "always bottom", "always top", "on schedule" (needs licensed NAV data) | V1 |
| 4.5 | Ba phản ứng khi quỹ giảm | Keep going / pause / sell and rebuy on the 2016–2026 DCDS series | V1 |
| 4.6 | Quỹ tự do sự nghiệp | Monthly spending → 12-month target → months to reach it | MVP |
| 4.7 | Chi phí du học | Destination, child's age → cost at enrolment with tuition inflation and FX | MVP |
| 4.8 | 100 − tuổi | Age and risk profile → reference equity weight | MVP |
| 4.9 | Danh mục thử nghiệm | Sliders for money market / bond / balanced / equity; shows outcome in rising, flat, falling scenarios and max drawdown | V1 |
| 4.10 | Hồi phục sau sụt giảm | −X% needs +Y% to break even | MVP |
| 4.11 | Tái cân bằng | Drifted 60/40 → rebalance → result | V1 |
| 4.12 | Bập bênh lãi suất | Rate up/down → bond price and NAV, short vs long duration | V1 |
| 4.13 | Tác động của phí | 0.5% vs 2% a year over 20 years | MVP |
| 4.14 | Vòng đời lệnh | Animated order → transfer → reconciliation → trading period → NAV → units | MVP |
| 4.15 | Bản đồ lợi nhuận tháng | VN-Index monthly heatmap 2014–2025 for the Sell-in-May lesson | V1 |

All tools label returns as assumptions and carry the disclaimer component.

## 5. AI features

### 5.1 Luyện tình huống AI (AI practice)

The prototype's best idea, adapted for investors. In the prototype the AI plays a customer and staff practise
advising. For investors the roles flip: **the AI plays the people and pressures an investor actually meets**,
the investor answers in their own words, and a **coach** scores the answer.

- **Scenario library**: 14 scenarios in `content/outline/ai-scenarios.ts`. Each has a persona, an opening line, what a good answer does, red flags, sources, and the lesson that unlocks it. Examples: a panicking spouse after −20%, a neighbour bragging about gold, a fake "Dragon Capital" caller asking for OTP, a "20%/năm cam kết" pitch, a Tết bonus, grandparents planning to sell land for school, a colleague shouting "Sell in May", a 55-year-old asking if it's too late.
- **Flow**: persona opener → investor types a reply (or picks from 3 starters if typing is hard) → persona reacts for up to 3 turns → coach card.
- **Coach card**: three scores (1–5): **Bám kế hoạch**, **Hiểu đúng kiến thức**, **An toàn & tỉnh táo**; one sentence on what went well; one concrete fix with a better phrasing; sources. Red flags are highlighted inline, as in the prototype (`<mark>`).
- **XP and quests**: practice earns XP; a daily quest "Xử lý đúng 1 tình huống" counts coach scores ≥ 4.
- **Staff mode**: the prototype's original advisor-training flow runs on the same engine (scenario `staff-worried-client`), so the sales team gets it for free.
- **Phase**: MVP ships 5 scenarios behind a flag; V1 ships all 14.

### 5.2 Hỏi Rồng (AI tutor)

- Ask anything about funds, the plan or DragonX; answers in plain Vietnamese **with citations** to the FAQ question or article.
- Grounded only on the source library: the FAQ's 133 answers, the AMDD and W5 articles, plus the dated fund-facts table once it exists.
- Declines personal buy/sell advice and points to the self-assessment, the planner, or a licensed advisor instead.
- Account-specific problems (an order not showing, eKYC errors) get the reusable rule plus a pre-filled support message template (order code, fund, time, no PIN/OTP), never an attempt to look up the account.
- Entry points: a floating mascot button, "Giải thích đơn giản hơn" under any lesson explanation, and the 5 FAQ questions that have no lesson (`askRongOnly`).

### 5.3 Rồng phỏng vấn kế hoạch

Conversational version of the planner: Rồng asks for the four numbers, then fills the planner and saves the goal (scenario `goal-interview`). It never proposes a specific fund to buy.

### 5.4 Content-team tools (internal)

- **Bài viết → bài học**: paste a new article (the weekly AMDD pieces), get a draft outline lesson (goal, facts, 4–6 challenges in the content schema, each citing the article) as a pull-request draft for writer and Compliance review. Nothing reaches learners without review.
- **Kiểm tra số liệu**: flags outline `facts` that don't appear in the cited source text.

### 5.5 How to build the AI features (Claude API)

| Concern | Recommendation |
|---|---|
| Model | **Claude Opus 5.5** (`claude-opus-5-5`) for all four features, tuned per route with `output_config.effort`: `low` for persona turns (fast, conversational), `medium` (the model's default) for the coach and Hỏi Rồng, `high` for article → lesson drafting. Thinking is always on for this model, and effort is the control. Cheaper models (Sonnet 5.5, Haiku 5.5) are a cost decision for the business to make after measuring them on the eval set below. |
| Grounding | The whole source library (~133 FAQ answers + ~20 articles) fits comfortably in the context window, so start **without a retrieval pipeline**: send the library as `document` content blocks, one per FAQ answer or article, titled with its source id, and cache it. Add retrieval only if the library grows past what's practical to send. |
| Citations | Hỏi Rồng: set `citations: {enabled: true}` on every document block; the response carries `cited_text` + document title for each claim, which the UI renders as "Nguồn: FAQ 10". Citations can't be combined with structured outputs, so the coach (which needs a JSON score) instead returns `sourceIds` inside its schema, and the server checks them against `content/sources.ts`. |
| Structured coach output | `output_config.format` with a JSON schema: `{ plan: 1–5, knowledge: 1–5, safety: 1–5, praise, fix, betterReply, flaggedSpans[], sourceIds[] }`. Parse with the SDK's `messages.parse()` helper. No assistant prefill (not supported on current models). |
| Persona vs coach | Two separate calls: the persona never sees the rubric; the coach sees the scenario card (good response, red flags, sources), the conversation, and the library. This keeps the persona in character and the grading consistent. |
| Prompt caching | Order every request as stable → volatile: system prompt (rules, voice) → source library → scenario card → conversation. Put a `cache_control` breakpoint after the library (1-hour TTL); the per-user conversation goes after it. Verify with `usage.cache_read_input_tokens`. No timestamps or user ids in the cached prefix. |
| Mid-session instructions | Inject per-turn state ("persona escalates: turn 2 of 3") as a mid-conversation `{role: "system"}` message so the cached prefix stays intact. |
| Refusals | Always check `stop_reason` before reading content; enable server-side refusal fallbacks (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`). Show a friendly mascot message if the whole chain declines. |
| Bulk drafting | Article → lesson drafting runs through the **Message Batches API** (asynchronous, half price); results keyed by `custom_id`. |
| SDK | `@anthropic-ai/sdk` (the app is TypeScript), called only from server actions/route handlers; the API key never reaches the browser. |

### 5.6 AI guardrails

- **No personal advice**: never "buy/sell/switch to fund X now"; never predict prices; never promise or imply returns. The coach marks any of these as a red flag in the investor's own answer too.
- **Grounded or silent**: if the library doesn't cover a question, say so and offer the support channel.
- **Security**: never ask for or accept PIN, OTP, passwords, ID photos; tell the user to remove them if pasted; no account access from AI features.
- **Disclosure**: every AI screen says it is an AI and educational; disclaimer under answers that mention funds or numbers.
- **Logging and review**: store prompts, answers, citations and coach scores (pseudonymous user id) for Compliance sampling; a weekly sample review in the pilot.
- **Eval set before launch**: about 100 questions plus scenario replies (including adversarial ones: "chắc lời không?", scam scripts, requests for a fund pick), each graded for groundedness, citation correctness, refusal of advice, and Vietnamese tone. Re-run it on every prompt or model change.
- **Rate limits and cost caps** per user per day; the feature degrades to "Hỏi Rồng tạm nghỉ" rather than failing.

## 6. Gamification

| # | Feature | What it does | From | Status | Phase |
|---|---|---|---|---|---|
| 6.1 | XP | 15 per lesson, +5 perfect, 30 checkpoint, 5 practice | P/D | ✅ | MVP |
| 6.2 | Chuỗi ngày | Vietnam calendar day, 1 freeze, streak-at-risk reminder | P/D | ✅ (logic + daily reminder) | MVP |
| 6.3 | Nhiệm vụ hôm nay | Earn 20 XP · 1 perfect lesson · 1 correct scenario | P/D | ✅ | MVP |
| 6.4 | Thử thách tháng | e.g. "Hoàn thành Hiểu mình trước 31/10" → badge | P | ✅ (3 challenges a month → monthly badge) | V1 |
| 6.5 | Giải đấu tuần | Đồng → Kim Cương, groups of 30, top 5 up / bottom 5 down, weekly job | P/D | ✅ (groups of 30, weekly settlement, `/api/cron/leagues`) | V1 |
| 6.6 | Huy hiệu | Milestones: first goal saved, 7-day streak, scam call handled, first checkpoint | N | ✅ (13 badges) | V1 |
| 6.7 | Chứng nhận | Hiểu mình · Hiểu quỹ · Nhà đầu tư DC hiểu biết; shareable card | P | ☐ | V1 |
| 6.8 | Bạn bè, giới thiệu | Follow friends, invite via DragonX referral (promotion rules apply) | D→N | ☐ | V2 |

## 7. Review and spaced repetition

| # | Feature | What it does | From | Status | Phase |
|---|---|---|---|---|---|
| 7.1 | Cần ôn lại | Topics with recent mistakes (from `challenge_attempts`), shown on the profile as in the prototype | P | ✅ (learn page card + profile list) | MVP |
| 7.2 | Ôn tập nhanh 3 phút | Mixed review of weak items; earns hearts back | P/D | ✅ (`/review`, earns hearts back) | MVP |
| 7.3 | Lặp lại ngắt quãng | Items resurface after 1, 3, 7, 21 days | N | ✅ (Leitner boxes 1/3/7/21 days) | V1 |

## 8. Profile

| # | Feature | What it does | From | Status | Phase |
|---|---|---|---|---|---|
| 8.1 | Thống kê | XP, streak, league, 30-day accuracy | P | ✅ (partial) | MVP |
| 8.2 | Khẩu vị rủi ro | Latest profile, why it was capped, retake every 12 months | N | ✅ | MVP |
| 8.3 | Mục tiêu của tôi | Saved goals with progress | N | ✅ | MVP |
| 8.4 | Bản kế hoạch đầu tư | Profile + goals + allocation as a shareable card / PDF | N | ✅ (card + public link + SVG; no PDF) | V1 |
| 8.5 | Chứng nhận và huy hiệu | Wall of earned items | P | ✅ (badge wall on the profile) | V1 |

## 9. Notifications and engagement

| # | Feature | What it does | Phase |
|---|---|---|---|
| 9.1 | Nhắc học | Push / email / Zalo at the chosen time | ✅ in-app + Web Push (VAPID); email/Zalo not built · V1 |
| 9.2 | Chuỗi sắp mất | Evening nudge with mascot `fight` | ✅ (reminder rule) · V1 |
| 9.3 | Khi thị trường giảm | When the market falls sharply, nudge to the B2.4 / B5.6 lessons instead of a sell button | ☐ needs market data · V1 |
| 9.4 | Bài mới tuần này | Each new AMDD article becomes a 3-minute lesson (via 5.4) | V1 |

## 10. DragonX integration

| # | Feature | What it does | Phase |
|---|---|---|---|
| 10.1 | Deep links | Open account, "Đầu tư theo mục tiêu", set up periodic investing, fund pages; from unit ends and the profile | ✅ (profile CTA) · MVP |
| 10.2 | Đăng nhập DragonX | OIDC SSO behind `getUserId()`; anonymous progress merges on first login | MVP |
| 10.3 | Đồng bộ mục tiêu | Goals created in the game appear in DragonX "Đầu tư theo mục tiêu" | V2 |
| 10.4 | Nhúng trong DragonX | The game as a webview tab | V2 |
| 10.5 | Bài học theo danh mục | With explicit consent, lessons tailored to funds held ("bạn giữ DCDS: FIFO ảnh hưởng phí bán thế nào") | V2 |

## 11. Content operations (internal)

| # | Feature | What it does | Status | Phase |
|---|---|---|---|---|
| 11.1 | Content-as-code | Lessons and outline as typed files; PR review = audit trail | ✅ | MVP |
| 11.2 | Kiểm tra nội dung | `content:check` + tests: ids, answers, sources, FAQ coverage | ✅ | MVP |
| 11.3 | Sinh tài liệu | `docs:curriculum` regenerates CURRICULUM.md from the outline | ✅ | MVP |
| 11.4 | Bảng thông tin quỹ | Dated fund facts (fees, cut-off times, benchmarks) with expiry alerts, read by lesson templates | ✅ (fund-facts.ts + expiry test) | MVP |
| 11.5 | Trình soạn thảo | Editor UI that opens PRs for non-developers | ✅ (`/admin/editor`, diff or PR) | V1 |
| 11.6 | Phân tích câu hỏi | Most-missed questions and drop-off per lesson from `challenge_attempts` | ✅ (`/admin/analytics`) | V1 |
| 11.7 | A/B test | Compare lesson variants on completion and accuracy | ☐ | V2 |

## 12. Compliance and trust

| # | Feature | What it does | Status |
|---|---|---|---|
| 12.1 | Nguồn bắt buộc | Every graded question cites a source; shown to the learner | ✅ |
| 12.2 | Disclaimer | On every screen with funds, numbers or projections | ✅ |
| 12.3 | Không hard-code phí | Fees and cut-offs only from the dated fund-facts table | ✅ (rule) / ☐ (table) |
| 12.4 | Phân biệt tự đánh giá | Risk self-check is educational, separate from DragonX suitability | ✅ (wording) |
| 12.5 | Quyền riêng tư | Nickname-only boards, consent for DragonX link, data residency per policy | ✅ (nickname) |
| 12.6 | Kiểm soát AI | Guardrails, logging and eval set in §5.6 | ☐ |
