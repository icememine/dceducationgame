/**
 * Golden path: the thinnest journey that touches every layer (see docs/GOLDEN_PATH.md).
 *   new visitor → onboarding → risk self-check → first formula lesson (graded on the server,
 *   one deliberate mistake) → XP saved → Hỏi Rồng answers a fee question with real numbers.
 *
 * Usage: start the app (npm run dev -- -p 3100), then
 *   BASE_URL=http://localhost:3100 npm run e2e:golden [-- <screenshot dir>]
 * Runs without ANTHROPIC_API_KEY (Hỏi Rồng answers from the library); with a key it exercises the model.
 * Chromium: CHROMIUM_PATH if set, else the cloud image's /opt/pw-browsers build if present, else the
 * browser installed by `npx playwright install chromium` (CI).
 */
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const out = process.argv[2];
if (out) mkdirSync(out, { recursive: true });
const local = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync(local) ? local : undefined);
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const shot = (n) => (out ? page.screenshot({ path: `${out}/${n}.png` }) : null);
const btn = (name) => page.getByRole("button", { name, exact: true });
const step = (name) => console.log(`✓ ${name}`);
const pick = async (text) => { await page.getByText(text, { exact: true }).click(); await btn("Kiểm tra").click(); };

// 1. Onboarding: a first-time investor starts with "Hiểu mình".
await page.goto(BASE + "/");
await page.getByRole("link", { name: "Bắt đầu" }).click();
await page.getByText("Tôi mới bắt đầu").click();
await btn("Tiếp tục").click();
await page.getByText("Đều đặn").click();
await btn("Tiếp tục").click();
await page.getByPlaceholder("Ví dụ: Rồng Tích Sản").fill("Rồng Golden");
await btn("Bắt đầu học").click();
await page.waitForURL("**/learn");
await shot("01-learn");
step("onboarding → Hiểu mình path");

// 2. Risk self-check (profile lesson, never costs hearts).
await page.getByRole("link", { name: "Tự đánh giá khẩu vị rủi ro" }).click();
await btn("Tiếp tục").click();
for (const o of ["5 – 10 năm", "6 – 12 tháng", "Có ảnh hưởng nhưng vẫn ổn", "Giữ nguyên, tiếp tục kế hoạch", "+20% / −15%", "Quỹ cổ phiếu hoặc ETF"]) {
  await page.getByText(o, { exact: true }).click();
  await btn("Tiếp tục").click();
}
await page.getByText("Khẩu vị rủi ro của bạn").waitFor();
await shot("02-profile");
await btn("Tiếp tục").click();
await page.waitForURL("**/learn");
step("risk profile saved");

// 3. First formula lesson: context → question → 3 options → insight, one wrong answer re-queued.
await page.getByRole("link", { name: "Quỹ dự phòng trước tiên" }).click();
await page.getByText("Chị Lan chi tiêu 15 triệu đồng mỗi tháng", { exact: false }).waitFor();
await shot("03-quiz");
await pick("Khoảng 45 triệu, vì 3 tháng chi tiêu là đủ");
await page.getByText("Chưa đúng").waitFor();
await page.getByText("Điều cần nhớ:").waitFor();
await shot("04-insight");
await btn("Tiếp tục").click();
await pick("Khoảng 2,5 năm"); await page.getByText("Chính xác!").waitFor(); await btn("Tiếp tục").click();
await pick("Tiền cần dùng trong 8 tháng nên ưu tiên thanh khoản và ít biến động"); await page.getByText("Chính xác!").waitFor(); await btn("Tiếp tục").click();
await page.getByText("Làm lại câu sai").waitFor();
await pick("Khoảng 180 triệu, tức 12 tháng × 15 triệu chi tiêu"); await page.getByText("Chính xác!").waitFor(); await btn("Tiếp tục").click();
await page.getByText("Hoàn thành bài học!").waitFor();
await shot("05-summary");
await btn("Tiếp tục").click();
await page.waitForURL("**/learn");
step("formula lesson graded and completed");

// 4. Hỏi Rồng: a fee question gets the real numbers, with no source line.
await page.getByRole("link", { name: "Hỏi Rồng" }).click();
await page.waitForURL("**/rong");
await btn("Bán quỹ sau 2 năm thì mất phí và thuế gì?").click();
const answer = page.locator("ol li").last();
await answer.filter({ hasText: "0,1%" }).waitFor({ timeout: 60_000 });
await page.getByRole("button", { name: "Gửi" }).and(page.locator(":not([disabled])")).waitFor({ timeout: 60_000 }).catch(() => {});
const text = await answer.innerText();
if (/Nguồn\s*:/u.test(text)) errors.push("Hỏi Rồng answer has a source line");
await shot("06-rong");
step("Hỏi Rồng answered with real numbers");

await browser.close();
if (errors.length) {
  console.error("FAILED:", errors);
  process.exit(1);
}
console.log("Golden path OK");
