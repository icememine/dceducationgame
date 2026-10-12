/**
 * Tour of the newer lesson types, the Thư viện page and the Hỏi Rồng daily cap.
 * Needs a server started with CONTENT_PREVIEW=1 RONG_DAILY_LIMIT=2, then:
 *   BASE_URL=http://localhost:3102 npm run e2e:preview -- <screenshot dir>
 */
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";
const B = process.env.BASE_URL ?? "http://localhost:3102", out = process.argv[2] ?? "e2e-shots";
mkdirSync(out, { recursive: true });
const local = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? (existsSync(local) ? local : undefined) });
const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
const errors = []; page.on("pageerror", (e) => errors.push(e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const btn = (n) => page.getByRole("button", { name: n, exact: true });
await page.goto(B + "/"); await page.getByRole("link", { name: "Bắt đầu" }).click();
await page.getByText("Tôi mới bắt đầu").click(); await btn("Tiếp tục").click();
await page.getByText("Đều đặn").click(); await btn("Tiếp tục").click();
await page.getByPlaceholder("Ví dụ: Rồng Tích Sản").fill("Rồng M1"); await btn("Bắt đầu học").click(); await page.waitForURL("**/learn");
// Estimate lesson
await page.goto(B + "/lesson/b4-compound-30y"); await btn("Tiếp tục").click();
await page.getByText("Đoán số").waitFor(); await shot("01-estimate");
await btn("Kiểm tra").click(); await page.getByText("Chưa sát lắm").waitFor(); await shot("02-estimate-reveal"); await btn("Tiếp tục").click();
await page.getByText("An có thêm 20 năm để lợi nhuận tiếp tục sinh lời", { exact: true }).click(); await btn("Kiểm tra").click(); await btn("Tiếp tục").click();
await page.getByText("Phần cổ tức đã tiêu không còn sinh lời; muốn có lãi kép phải tái đầu tư khoản đó", { exact: true }).click(); await btn("Kiểm tra").click(); await btn("Tiếp tục").click();
await page.getByText("Hoàn thành bài học!").or(page.getByText("Hoàn hảo, không sai câu nào!")).waitFor(); await shot("03-done");
// Spot lesson
await page.goto(B + "/lesson/a3-missing-units");
await page.getByText("Không chuyển thêm. Lệnh trước 14:30", { exact: false }).click(); await btn("Kiểm tra").click(); await btn("Tiếp tục").click();
for (const t of ["Kiểm tra trạng thái lệnh và kỳ giao dịch", "Đối chiếu tài khoản nhận, số tiền, nội dung chuyển khoản", "Gửi mã lệnh và chứng từ qua kênh hỗ trợ chính thức", "Chờ phản hồi, không đặt lại lệnh hay chuyển thêm"]) await page.getByRole("button", { name: t }).click();
await btn("Kiểm tra").click(); await btn("Tiếp tục").click();
await page.getByText("Tìm câu sai").waitFor(); await page.getByText("Cứ gửi mã OTP", { exact: false }).click(); await shot("04-spot");
await btn("Kiểm tra").click(); await page.getByText("Chính xác!").waitFor(); await shot("05-spot-ok"); await btn("Tiếp tục").click();
// Library
await page.goto(B + "/thu-vien"); await shot("06-library");
await page.goto(B + "/thu-vien?q=" + encodeURIComponent("phí bán sau 2 năm")); await shot("07-library-search");
const libText = await page.locator("main").innerText(); if (!/0,1%/.test(libText)) errors.push("library search missing fee answer");
// Daily cap = 2
await page.goto(B + "/rong");
for (let i = 0; i < 3; i++) { await btn("Bao lâu thì nhận được tiền bán?").click(); await page.getByRole("button", { name: "Gửi" }).waitFor(); await page.waitForTimeout(1500); }
const last = await page.locator("ol li").last().innerText(); await shot("08-rong-cap");
if (!/hỏi Rồng khá nhiều/.test(last)) errors.push("daily cap message not shown: " + last.slice(0, 80));
await browser.close();
if (errors.length) { console.error("FAILED:", errors); process.exit(1); }
console.log("Preview tour OK");
