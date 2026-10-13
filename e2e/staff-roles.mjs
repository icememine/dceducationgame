/**
 * Staff accounts and roles end to end: bootstrap admin, creating accounts, first sign-in with a
 * temporary password, role-limited menus and pages, role change / deactivation / reset ending
 * sessions, login lockout, last-admin protection and the audit log.
 * Server: production build with ADMIN_USERNAME/ADMIN_PASSWORD (bootstrap), fresh database.
 *   BASE_URL=http://localhost:3100 ADMIN_USERNAME=… ADMIN_PASSWORD=… node e2e/staff-roles.mjs <shots>
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const B = process.env.BASE_URL ?? "http://localhost:3100", out = process.argv[2] ?? "e2e-shots";
const USER = process.env.ADMIN_USERNAME ?? "admin", PASS = process.env.ADMIN_PASSWORD ?? "rong-admin-2026";
mkdirSync(out, { recursive: true });
const local = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? (existsSync(local) ? local : undefined) });
const errors = [];
const step = (s) => console.log(`✓ ${s}`);
const expect = (cond, msg) => { if (!cond) errors.push(msg); };

async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  return p;
}
const btn = (p, n) => p.getByRole("button", { name: n, exact: true });
async function signIn(p, u, pw) {
  await p.goto(B + "/admin/login");
  await p.getByLabel("Tên đăng nhập").fill(u); await p.getByLabel("Mật khẩu").fill(pw); await btn(p, "Đăng nhập").click();
}
const settle = (p) => p.waitForLoadState("networkidle").catch(() => {});
async function changePassword(p, current, next) {
  await p.getByLabel("Mật khẩu hiện tại").fill(current); await p.getByLabel("Mật khẩu mới", { exact: true }).fill(next); await p.getByLabel("Nhập lại mật khẩu mới").fill(next);
  await btn(p, "Đổi mật khẩu").click();
}
const navText = async (p) => (await p.locator("header").innerText());

// 1. Bootstrap admin creates two accounts.
const admin = await newPage();
await signIn(admin, USER, PASS); await admin.waitForURL(/\/admin$/, { waitUntil: "commit" });
await admin.goto(B + "/admin/staff");
async function create(username, name, role) {
  const form = admin.locator("form").filter({ hasText: "Tạo tài khoản" }).first();
  await form.getByLabel("Tên đăng nhập").fill(username); await form.getByLabel("Họ tên").fill(name); await form.getByLabel("Vai trò").selectOption({ label: role });
  const shown = form.getByTestId("temp-password");
  const before = (await shown.count()) ? await shown.innerText() : "";
  await btn(form, "Tạo tài khoản").click();
  await form.getByText(new RegExp(`cho ${username.replace(".", "\\.")}`)).waitFor();
  const pw = await shown.innerText();
  if (pw === before) errors.push("temporary password did not change for " + username);
  return pw;
}
const lanTemp = await create("lan.content", "Nguyễn Lan", "Nội dung");
const minhTemp = await create("minh.compliance", "Trần Minh", "Tuân thủ");
const form = admin.locator("form").filter({ hasText: "Tạo tài khoản" }).first();
await form.getByLabel("Tên đăng nhập").fill("lan.content"); await btn(form, "Tạo tài khoản").click(); await form.getByText("Tên đăng nhập đã tồn tại").waitFor();
await form.getByLabel("Tên đăng nhập").fill("Bad Name"); await btn(form, "Tạo tài khoản").click(); await form.getByText(/Tên đăng nhập: 3–32 ký tự/).waitFor();
await admin.screenshot({ path: `${out}/s1-staff.png`, fullPage: true });
step("admin created a content and a compliance account; duplicate and bad usernames refused");

// 2. Content person: forced password change, then a content-only menu.
const lan = await newPage();
await signIn(lan, "lan.content", lanTemp); await lan.waitForURL("**/admin/account", { waitUntil: "commit" });
await lan.goto(B + "/admin/analytics"); await lan.waitForURL("**/admin/account");
await changePassword(lan, lanTemp, "onlyletterspassword"); await lan.getByText(/cả chữ và số/).waitFor();
await changePassword(lan, lanTemp, "lan-content-2026"); await lan.getByText("Đã đổi mật khẩu.").waitFor();
await lan.goto(B + "/admin"); const lanNav = await navText(lan);
expect(lanNav.includes("Trình soạn thảo") && lanNav.includes("Phân tích câu hỏi"), "content nav should have editor and analytics");
expect(!lanNav.includes("Duyệt câu trả lời AI") && !lanNav.includes("Tài khoản nhân viên") && !lanNav.includes("Nhật ký"), "content nav shows pages it can't open: " + lanNav);
await lan.goto(B + "/admin/ai-review"); await lan.waitForURL("**/admin?denied=1"); await lan.getByText("Vai trò của bạn không được mở trang đó.").waitFor();
expect((await lan.request.get(B + "/admin/risk-audit/export")).status() === 404, "content role should not export the risk audit");
await lan.goto(B + "/admin/market-sim"); await lan.getByText("Gửi tới tất cả học viên: chỉ quản trị viên.").waitFor();
expect((await lan.getByLabel(/Tất cả học viên/).count()) === 0, "content role should not see send-to-all");
await lan.goto(B + "/admin/editor?c=b1-risk-paper-loss"); await lan.getByText("Tạo bản sửa").first().waitFor();
await lan.screenshot({ path: `${out}/s2-content-role.png`, fullPage: true });
step("content role: forced password change (policy enforced), editor allowed, compliance pages and send-to-all denied");

// 3. Compliance person.
const minh = await newPage();
await signIn(minh, "minh.compliance", minhTemp); await minh.waitForURL("**/admin/account", { waitUntil: "commit" });
await changePassword(minh, minhTemp, "minh-tuanthu-2026"); await minh.getByText("Đã đổi mật khẩu.").waitFor();
await minh.goto(B + "/admin/risk-audit"); await minh.getByRole("heading", { name: "Kiểm tra hồ sơ khẩu vị rủi ro" }).waitFor();
await minh.goto(B + "/admin/audit"); await minh.getByRole("heading", { name: "Nhật ký quản trị" }).waitFor();
await minh.goto(B + "/admin/editor"); await minh.waitForURL("**/admin?denied=1");
await minh.goto(B + "/admin/staff"); await minh.waitForURL("**/admin?denied=1");
step("compliance role: reviews and audit log allowed, editor and staff denied");

// 4. Role change and deactivation end sessions at once.
await admin.goto(B + "/admin/staff");
const lanRow = admin.locator('tr[data-username="lan.content"]');
await lanRow.getByLabel("Vai trò lan.content").selectOption({ label: "Tuân thủ" }); await lanRow.getByRole("button", { name: "Lưu" }).click(); await lanRow.getByText("Đã lưu").waitFor();
await lan.goto(B + "/admin"); await lan.waitForURL("**/admin/login");
const minhRow = admin.locator('tr[data-username="minh.compliance"]');
await minhRow.getByLabel("Đang hoạt động").uncheck(); await minhRow.getByRole("button", { name: "Lưu" }).click(); await minhRow.getByText("Đã lưu").waitFor();
await minh.goto(B + "/admin"); await minh.waitForURL("**/admin/login");
await signIn(minh, "minh.compliance", "minh-tuanthu-2026"); await minh.getByText("Sai tên đăng nhập hoặc mật khẩu").waitFor();
step("role change and deactivation sign the person out; a deactivated account can't sign in");

// 5. Reset password → old one stops working, temporary one forces a change.
const resetCell = admin.locator('tr[data-username="lan.content"]');
await resetCell.getByRole("button", { name: "Đặt lại mật khẩu" }).click(); await resetCell.getByTestId("temp-password").waitFor();
const lanTemp2 = await resetCell.getByTestId("temp-password").innerText();
await signIn(lan, "lan.content", "lan-content-2026"); await lan.getByText("Sai tên đăng nhập hoặc mật khẩu").waitFor();
await signIn(lan, "lan.content", lanTemp2); await lan.waitForURL("**/admin/account", { waitUntil: "commit" });
step("password reset: old password refused, temporary one requires a change");

// 6. Lockout after 5 wrong passwords (even the right one is refused for a while).
const bad = await newPage();
for (let i = 0; i < 4; i++) { await signIn(bad, "lan.content", "wrong-" + i); await bad.getByText("Sai tên đăng nhập hoặc mật khẩu").waitFor(); }
await signIn(bad, "lan.content", "wrong-x"); await settle(bad);
await signIn(bad, "lan.content", lanTemp2); await bad.getByText(/tạm khoá/).waitFor();
step("lockout after repeated wrong passwords");

// 7. The last admin can't remove their own admin role.
await admin.goto(B + "/admin/staff");
const meRow = admin.locator(`tr[data-username="${USER.toLowerCase()}"]`);
await meRow.getByLabel(`Vai trò ${USER.toLowerCase()}`).selectOption({ label: "Nội dung" }); await meRow.getByRole("button", { name: "Lưu" }).click();
await meRow.getByText("Phải còn ít nhất một quản trị viên đang hoạt động").waitFor();
step("last-admin protection");

// 8. Audit log records all of it, filterable, exportable.
await admin.goto(B + "/admin/audit");
const log = await admin.locator("main").innerText();
for (const t of ["Tạo quản trị viên đầu tiên", "Tạo tài khoản", "Đổi mật khẩu", "Sửa tài khoản", "Đặt lại mật khẩu", "Đăng nhập thất bại", "Bị tạm khoá đăng nhập"]) expect(log.includes(t), "audit log missing: " + t);
await admin.goto(B + "/admin/audit?user=lan.content&action=login-failed");
const filtered = await admin.locator("tbody tr").count(); expect(filtered === 5, "expected exactly 5 failed logins before the lock for lan.content, got " + filtered);
const [csv] = await Promise.all([admin.waitForEvent("download"), admin.getByRole("link", { name: "Tải CSV" }).click()]);
expect(readFileSync(await csv.path(), "utf8").includes("Đăng nhập thất bại"), "audit CSV incomplete");
await admin.goto(B + "/admin/audit?action=export");
const exports = await admin.locator("tbody tr").count(); expect(exports === 1, "one CSV download should log one export (no prefetch), got " + exports);
await admin.goto(B + "/admin/audit"); await admin.screenshot({ path: `${out}/s3-audit.png`, fullPage: true });
step("audit log: every action recorded, filter by person and action, CSV");

await browser.close();
if (errors.length) { console.error("FAILED:", errors); process.exit(1); }
console.log("Staff roles OK");
