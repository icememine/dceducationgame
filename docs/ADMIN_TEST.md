# Admin: test login

**For local and test environments only.** Production must set its own `ADMIN_USERNAME` and
`ADMIN_PASSWORD`; with either one missing in production, `/admin` answers 404.

| | |
|---|---|
| Login page | <http://localhost:3000/admin/login> |
| Username | `admin` |
| Password | `rong-admin-2026` |

These are the built-in development defaults (`DEV_ADMIN` in `src/features/admin/auth.ts`). They work
whenever `NODE_ENV` is not `production` and the two variables are unset, i.e. with `npm run dev`.

## Try it locally

```bash
npm install
npm run dev                      # http://localhost:3000
# learner side: http://localhost:3000  → onboarding, lessons, Hồ sơ › Bản kế hoạch đầu tư
# staff side:   http://localhost:3000/admin/login  → admin / rong-admin-2026
```

A production build needs the variables explicitly:

```bash
npm run build
ADMIN_USERNAME=admin ADMIN_PASSWORD=rong-admin-2026 CONTENT_PREVIEW=1 npx next start -p 3000
```

On a staging server, put your own values in its environment (never reuse the password above).

## What is in /admin

| Page | What it does |
|---|---|
| `/admin/analytics` | Per question: attempts, learners, first-try accuracy, most common wrong answer. Per lesson: started, completed, completion rate, average mistakes. |
| `/admin/editor` | Pick segment › unit › lesson › question, edit with live validation (schema + quiz-formula limits) and a live preview. "Tạo bản sửa" changes only that question in its unit file and opens a GitHub pull request (`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BASE`), or shows the diff and a "Tải file" download. |
| `/admin/ai-review` | **Compliance: Hỏi Rồng answers.** Default view: answers with a guardrail flag, not yet reviewed. Filter by flag, review status, date range and keyword; read question and answer; record **Đạt / Cần sửa / Chuyển cấp trên** with a note (required unless Đạt). Every decision is kept as history (who, when, note). "Tải CSV" exports the filtered list. |
| `/admin/risk-audit` | **Compliance: risk-check results.** Default view: results that need a look (§5.2 special cases, capacity warning ③, or the learner chose a higher profile), not yet reviewed. Each shows total → scored → proposed (after rules ① ②) → the learner's §5 choice → profile used, whether the acknowledgement was ticked, every answer with its points, and the flags. Same review and CSV as above. |
| `/admin/market-sim` | **Simulation only.** Sends the labelled "[Mô phỏng] Thị trường giảm X%" nudge to this browser (preview) or to every learner (drill). No market data; never automatic. |

Tested end to end by `npm run e2e:admin` (both editor modes; the PR mode against `e2e/mock-github.mjs`).

## Not built yet in /admin

1. **Staff accounts and roles**: one shared login today, so the review history records the shared username; per-person accounts (content vs Compliance), audit log of who did what, and SSO later.
2. **Editor**: add, delete or reorder questions and lessons; edit the generated risk-check items; edit outline entries.
3. **Analytics**: date-range filter, CSV export, placement and review statistics, funnel by segment, question-level drill-down over time.
4. **Learner support**: look up a learner by nickname to answer a support request (read-only).
5. **Notifications admin**: compose a one-off announcement; see reminder delivery and push subscription counts.
