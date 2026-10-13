# Admin: test login

**For local and test environments only.** Production must set its own `ADMIN_USERNAME` and
`ADMIN_PASSWORD`; with either one missing in production, `/admin` answers 404.

| | |
|---|---|
| Login page | <http://localhost:3000/admin/login> |
| Username | `admin` |
| Password | `rong-admin-2026` |

These are the built-in development defaults (`bootstrapCredentials` in `src/features/staff/server.ts`).
They work whenever `NODE_ENV` is not `production` and the two variables are unset, i.e. with `npm run dev`.
The first sign-in creates **admin** as a personal admin account (stored with a hashed password); from
then on that account's own password counts, so changing it at "Tài khoản của tôi" works as usual.

## Staff accounts and roles

| Role | Can open |
|---|---|
| **Quản trị** (admin) | Everything, including **Tài khoản nhân viên** and sending the market-drop simulation to all learners |
| **Nội dung** (content) | Phân tích câu hỏi, Trình soạn thảo, market-drop preview |
| **Tuân thủ** (compliance) | Duyệt câu trả lời AI, Kiểm tra hồ sơ rủi ro, Phân tích câu hỏi, Nhật ký, market-drop preview |

- An admin creates accounts at `/admin/staff`. A temporary password is shown **once**; the person must
  choose a new one at first sign-in (at least 10 characters, letters and digits, not containing the username).
- Changing a role, deactivating an account or resetting a password signs that person out everywhere.
  Accounts are never deleted, only deactivated, so the history keeps pointing at a real person.
- At least one active admin must remain (the app refuses to demote or deactivate the last one).
- Five wrong passwords within 15 minutes lock that username for 15 minutes.
- Sessions last 12 hours; the cookie holds a random token, the database only its hash.
- **Nhật ký** (`/admin/audit`) records sign-ins (including failures and lockouts), reviews, content
  edits, simulations, CSV downloads and account changes, with filters and CSV. Reviews and pull
  requests now carry the reviewer's own name.

To try the roles locally: sign in as admin, open **Tài khoản nhân viên**, create e.g. `lan.content`
(Nội dung) and `minh.compliance` (Tuân thủ), then sign in as each in a private window with the
temporary password.

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

Tested end to end by `npm run e2e:admin` (both editor modes; the PR mode against `e2e/mock-github.mjs`) and `npm run e2e:staff` (accounts, roles, sessions, lockout, audit log).

## Not built yet in /admin

1. **Single sign-on**: staff accounts are local today; DragonX/company SSO (OIDC) and two-factor sign-in are the next step for production.
2. **Editor**: add, delete or reorder questions and lessons; edit the generated risk-check items; edit outline entries.
3. **Analytics**: date-range filter, CSV export, placement and review statistics, funnel by segment, question-level drill-down over time.
4. **Learner support**: look up a learner by nickname to answer a support request (read-only).
5. **Notifications admin**: compose a one-off announcement; see reminder delivery and push subscription counts.
