/**
 * Plan card + /admin end to end.
 *  - Learner: risk check (confirmed), a saved goal, one wrong answer; then the plan card,
 *    sharing (amounts hidden), the public page in a fresh browser, and the card image.
 *  - Staff: login (wrong then right password), analytics, the editor (live validation,
 *    "Tạo bản sửa" → diff + download, or → pull request when GITHUB_* points at
 *    e2e/mock-github.mjs), the market-drop simulator, logout.
 * Server: production build with ADMIN_USERNAME/ADMIN_PASSWORD set (CONTENT_PREVIEW=1).
 *   BASE_URL=http://localhost:3100 ADMIN_USERNAME=… ADMIN_PASSWORD=… node e2e/admin-and-plan.mjs <shots>
 * Add MOCK_GITHUB=http://localhost:3999 when the server runs with GITHUB_API_URL pointing there.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const B = process.env.BASE_URL ?? "http://localhost:3100", out = process.argv[2] ?? "e2e-shots";
const USER = process.env.ADMIN_USERNAME ?? "admin", PASS = process.env.ADMIN_PASSWORD ?? "rong-admin-2026";
const MOCK = process.env.MOCK_GITHUB;
mkdirSync(out, { recursive: true });
const local = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? (existsSync(local) ? local : undefined) });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", (e) => errors.push(e.message));
const shot = (n, p = page) => p.screenshot({ path: `${out}/${n}.png`, fullPage: true });
const btn = (n, p = page) => p.getByRole("button", { name: n, exact: true });
const step = (s) => console.log(`✓ ${s}`);

// Learner setup.
await page.goto(B + "/"); await page.getByRole("link", { name: "Bắt đầu" }).click();
await page.getByText("Tôi mới bắt đầu").click(); await btn("Tiếp tục").click();
await page.getByText("Đều đặn").click(); await btn("Tiếp tục").click();
await page.getByPlaceholder("Ví dụ: Rồng Tích Sản").fill("Rồng Kế Hoạch"); await btn("Bắt đầu học").click(); await page.waitForURL("**/learn");
await page.goto(B + "/lesson/b1-risk-check"); await btn("Tiếp tục").click();
for (const o of ["5 – 10 năm", "Điều bình thường trong đầu tư", "Giữ nguyên và chờ đợi", "Tăng trưởng: khoảng ±15%", "Lương cố định chiếm phần lớn", "5 – 20%", "Có kiến thức về đầu tư"]) {
  await page.getByText(o, { exact: true }).click(); await btn("Tiếp tục").click();
}
await btn("Đồng ý").click(); await page.getByText("Hồ sơ đầu tư của bạn").waitFor();
await page.goto(B + "/tools?tool=planner"); await btn("Du học cho con").click(); await btn("Lưu mục tiêu").click(); await btn("Đã lưu vào hồ sơ").waitFor();
await page.goto(B + "/lesson/b1-what-is-risk");
await page.getByText("Chị đã mất hẳn 12% số tiền", { exact: true }).click(); await btn("Kiểm tra").click(); await page.getByText("Chưa đúng").waitFor();
step("learner: risk profile confirmed, goal saved, one mistake");

// Plan card.
await page.goto(B + "/profile/plan");
const main = page.locator("main");
await main.getByText("Khá mạo hiểm").first().waitFor(); await main.getByText("Du học cho con").first().waitFor();
if (!/4,2 tỷ/.test(await main.innerText())) errors.push("plan card should show the goal amount");
if (/DCDS|DCDE|DCBF|DCIP|DCBA/.test(await main.innerText())) errors.push("plan card must not name funds");
await shot("p1-plan-private");
const [img] = await Promise.all([page.waitForEvent("download"), btn("Tải ảnh").click()]);
if (!/\.(png|svg)$/.test(img.suggestedFilename())) errors.push("plan image download name " + img.suggestedFilename());
await img.saveAs(`${out}/p0-plan-download${img.suggestedFilename().slice(-4)}`);
await page.getByRole("checkbox").check(); await btn("Chia sẻ").click();
const link = await page.getByLabel("Liên kết chia sẻ").inputValue();
if (!/\/p\/h-/.test(link)) errors.push("hidden-amount link should start with h-: " + link);
const visitor = await (await browser.newContext({ viewport: { width: 420, height: 900 } })).newPage();
await visitor.goto(link); await visitor.getByText("Rồng Kế Hoạch").first().waitFor();
const pub = await visitor.locator("body").innerText();
if (/4,2 tỷ|triệu\/tháng/.test(pub)) errors.push("public card with hidden amounts shows amounts");
if (!/Khá mạo hiểm/.test(pub)) errors.push("public card should show the profile");
if ((await visitor.locator('meta[name="robots"]').getAttribute("content"))?.includes("noindex") !== true) errors.push("public card should be noindex");
await shot("p2-plan-public", visitor);
const token = link.split("/p/")[1];
const svg = await (await fetch(`${B}/api/plan-card/${token}`)).text();
if (!svg.startsWith("<svg") && !svg.startsWith("<?xml")) errors.push("card image is not SVG");
await visitor.setContent(`<body style="margin:0;background:#ddd"><img id="c" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"></body>`);
await visitor.locator("#c").screenshot({ path: `${out}/p3-plan-image.png` });
await btn("Ngừng chia sẻ").click(); await btn("Chia sẻ").waitFor();
if ((await fetch(link)).status !== 404) errors.push("revoked link should 404");
step("plan card: private, shared with hidden amounts, public page, image, revoke");

// Second learner: high score without investing knowledge (rule ②), then chooses higher (§5.2 flags); asks Hỏi Rồng once.
const l2 = await (await browser.newContext({ viewport: { width: 420, height: 900 } })).newPage();
await l2.goto(B + "/"); await l2.getByRole("link", { name: "Bắt đầu" }).click();
await l2.getByText("Tôi mới bắt đầu").click(); await btn("Tiếp tục", l2).click();
await l2.getByText("Đều đặn").click(); await btn("Tiếp tục", l2).click();
await l2.getByPlaceholder("Ví dụ: Rồng Tích Sản").fill("Rồng Cao Hơn"); await btn("Bắt đầu học", l2).click(); await l2.waitForURL("**/learn");
await l2.goto(B + "/lesson/b1-risk-check"); await btn("Tiếp tục", l2).click();
for (const o of ["Trên 10 năm", "Cơ hội để đạt lợi nhuận cao", "Mua thêm vì đây là cơ hội tốt", "Mạo hiểm: hơn ±15%", "Có nhiều nguồn thu nhập", "Dưới 5%", "Chưa biết về đầu tư"]) {
  await l2.getByText(o, { exact: true }).click(); await btn("Tiếp tục", l2).click();
}
await btn("Tôi muốn nhiều rủi ro hơn", l2).click(); await l2.getByRole("checkbox").check(); await btn("Xác nhận", l2).click();
await l2.getByText("Bạn đã chọn mức cao hơn kết quả đánh giá").waitFor();
await l2.goto(B + "/rong"); await btn("Bán quỹ sau 2 năm thì mất phí và thuế gì?", l2).click();
await l2.locator("ol li").last().filter({ hasText: "0,1%" }).waitFor({ timeout: 60_000 });
step("second learner: chose a higher profile, asked Hỏi Rồng");

// Admin login.
await page.goto(B + "/admin"); await page.waitForURL("**/admin/login");
await page.getByLabel("Tên đăng nhập").fill(USER); await page.getByLabel("Mật khẩu").fill("wrong-password"); await btn("Đăng nhập").click();
await page.getByText("Sai tên đăng nhập hoặc mật khẩu").waitFor();
await page.getByLabel("Mật khẩu").fill(PASS); await btn("Đăng nhập").click(); await page.waitForURL(/\/admin$/, { waitUntil: "commit" });
step("admin: wrong password refused, right one accepted");

await page.goto(B + "/admin/analytics"); await page.getByText("b1-risk-paper-loss").first().waitFor(); await shot("a1-analytics");
step("admin: analytics lists the missed question");

// Editor: live validation, then "Tạo bản sửa".
const FILE = "content/segments/my-plan/b1-know-yourself.ts";
await page.goto(B + "/admin/editor?c=b1-risk-paper-loss");
const ctxField = page.getByLabel(/Bối cảnh/);
const original = await ctxField.inputValue();
await ctxField.fill("Quá ngắn"); await page.getByText(/Chưa hợp lệ/).waitFor();
if (!(await btn("Tạo bản sửa").isDisabled())) errors.push("invalid edit should disable Tạo bản sửa");
await ctxField.fill(original);
await page.getByLabel("Câu hỏi", { exact: true }).fill("Nhận định nào là đúng?");
await page.getByText("Hợp lệ theo schema và công thức quiz.").waitFor();
await btn("Tạo bản sửa").click();
const before = readFileSync(FILE, "utf8");
const oneLine = (after) => {
  const a = before.split("\n"), b = after.split("\n");
  const diff = a.map((l, i) => (l !== b[i] ? i : -1)).filter((i) => i >= 0);
  if (a.length !== b.length || diff.length !== 1 || !b[diff[0]].includes('prompt: "Nhận định nào là đúng?"')) errors.push(`expected exactly the prompt line to change, got lines ${diff.join(",")}`);
};
if (MOCK) {
  await page.getByText("Đã tạo pull request").waitFor();
  const writes = await (await fetch(`${MOCK}/__writes`)).json();
  const file = writes.find((w) => w.kind === "file"), pr = writes.find((w) => w.kind === "pr");
  if (file?.path !== FILE) errors.push("PR should change " + FILE + ", got " + file?.path);
  if (!pr || !/sửa b1-risk-paper-loss/.test(pr.title) || pr.head !== file.branch) errors.push("PR title/branch wrong");
  if (file) oneLine(file.text);
  step("editor: pull request opened on the mock GitHub with a one-line change");
} else {
  await page.getByText(/Thay đổi cho/).waitFor();
  const body = await page.locator("pre").first().innerText();
  if (!body.includes('+          prompt: "Nhận định nào là đúng?",') || !body.includes('-          prompt: "Nhận định nào đúng?",')) errors.push("diff should swap the prompt line");
  const [dl] = await Promise.all([page.waitForEvent("download"), btn("Tải file").click()]);
  const path = await dl.path(); oneLine(readFileSync(path, "utf8"));
  if (dl.suggestedFilename() !== "b1-know-yourself.ts") errors.push("download name " + dl.suggestedFilename());
  step("editor: diff shown and patched file downloaded with a one-line change");
}
await shot("a2-editor-result");

// Market-drop simulator (simulation only) → shows up in this browser's notifications.
await page.goto(B + "/admin/market-sim"); await page.getByText("Chỉ là mô phỏng.").waitFor();
await btn("Gửi thông báo mô phỏng").click(); await page.getByText("Đã gửi tới 1 học viên.").waitFor(); await shot("a3-market-sim");
await page.goto(B + "/notifications"); await page.getByText("[Mô phỏng] Thị trường giảm 20%: bạn sẽ làm gì?").first().waitFor(); await shot("a4-notification");
step("market-drop simulator: labelled nudge delivered in-app");

// Compliance: AI answers (all, since library answers carry no guardrail flag) and the risk audit.
await page.goto(B + "/admin/ai-review?status=todo&flag=all");
const aiItem = page.locator("li").filter({ hasText: "Bán quỹ sau 2 năm thì mất phí và thuế gì?" }).first();
await aiItem.waitFor(); await aiItem.getByText("Câu trả lời và duyệt").click();
await aiItem.getByLabel("Cần sửa").check(); await aiItem.getByRole("button", { name: "Lưu kết quả" }).click();
await aiItem.getByText(/Hãy ghi chú lý do/).waitFor();
await aiItem.getByLabel("Ghi chú").fill("Kiểm tra lại mức phí chuyển tiền"); await aiItem.getByRole("button", { name: "Lưu kết quả" }).click();
await aiItem.getByText("Đã lưu: Cần sửa").waitFor(); await shot("a5-ai-review");
await page.goto(B + "/admin/ai-review?status=issue&flag=all");
await page.getByText("Kiểm tra lại mức phí chuyển tiền").first().waitFor({ state: "attached" });
const [aiCsv] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Tải CSV" }).click()]);
const aiCsvText = readFileSync(await aiCsv.path(), "utf8");
if (!aiCsvText.includes("Cần sửa") || !aiCsvText.includes("Bán quỹ sau 2 năm")) errors.push("AI review CSV missing the reviewed row");
step("compliance: AI answer reviewed (note required for 'Cần sửa'), filtered, exported");

await page.goto(B + "/admin/risk-audit");
const riskItem = page.locator("li").filter({ hasText: "Rồng Cao Hơn" }).first();
await riskItem.waitFor();
const riskText = await riskItem.innerText();
for (const t of ["Chọn cao hơn", "đã tick xác nhận rủi ro", "Chọn hồ sơ cao hơn kết quả đánh giá"]) if (!riskText.includes(t)) errors.push("risk audit row missing: " + t);
if (/Rồng Kế Hoạch/.test(await page.locator("main").innerText())) errors.push("an unflagged 'agree' result should not be in the attention view");
await riskItem.getByText("Chi tiết điểm và duyệt").click(); await riskItem.getByText("Chưa biết về đầu tư").waitFor();
await riskItem.getByRole("button", { name: "Lưu kết quả" }).click(); await riskItem.getByText("Đã lưu: Đạt").waitFor(); await shot("a6-risk-audit");
await page.goto(B + "/admin/risk-audit");
if (/Rồng Cao Hơn/.test(await page.locator("main").innerText())) errors.push("reviewed risk result should leave the 'Chưa duyệt' view");
const [riskCsv] = await Promise.all([page.waitForEvent("download"), page.goto(B + "/admin/risk-audit/export?status=all&view=all").catch(() => null)]);
const riskCsvText = readFileSync(await riskCsv.path(), "utf8");
if (!riskCsvText.includes("Rồng Cao Hơn") || !riskCsvText.includes("Rồng Kế Hoạch") || !riskCsvText.includes("Đạt")) errors.push("risk CSV incomplete");
step("compliance: risk audit shows the higher choice with its flags, review recorded, CSV exported");

await page.goto(B + "/admin"); await btn("Đăng xuất").click(); await page.waitForURL("**/admin/login", { waitUntil: "commit" });
await page.goto(B + "/admin/analytics"); await page.waitForURL("**/admin/login");
step("admin: logout ends the session");

await browser.close();
if (errors.length) { console.error("FAILED:", errors); process.exit(1); }
console.log("Admin + plan card OK");
