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
// Risk assessment §4.3 ② + §5.1: high score but no experience → Cân bằng; choose higher with acknowledgement.
await page.goto(B + "/lesson/b1-risk-check"); await btn("Tiếp tục").click();
for (const o of ["Trên 10 năm", "Cơ hội để đạt lợi nhuận cao", "Mua thêm vì đây là cơ hội tốt", "Mạo hiểm: hơn ±15%", "Có nhiều nguồn thu nhập", "Dưới 5%", "Chưa biết về đầu tư"]) {
  await page.getByText(o, { exact: true }).click(); await btn("Tiếp tục").click();
}
await page.getByText("Rồng điều chỉnh vì:").waitFor();
if (!(await page.getByRole("heading", { name: "Cân bằng" }).isVisible())) errors.push("override ② should give Cân bằng");
await btn("Tôi muốn nhiều rủi ro hơn").click(); await page.getByRole("checkbox").check(); await shot("00-risk-higher");
await btn("Xác nhận").click(); await page.getByText("Bạn đã chọn mức cao hơn kết quả đánh giá").waitFor();
if (!(await page.getByRole("heading", { name: "Khá mạo hiểm" }).isVisible())) errors.push("higher should give Khá mạo hiểm");
await shot("00-risk-final");
// Công cụ: planner preset + save, then the 25 vs 45 tool; the goal shows on the profile.
await page.goto(B + "/learn"); await page.getByRole("link", { name: "Công cụ" }).click(); await page.waitForURL("**/tools**");
await btn("Du học cho con").click();
await page.getByText("Thời gian ước tính").waitFor(); await shot("00-tools-planner");
await btn("Lưu mục tiêu").click(); await btn("Đã lưu vào hồ sơ").waitFor();
await page.getByRole("link", { name: "25 hay 45 tuổi" }).click(); await page.getByText("chỉ góp nhiều hơn").waitFor(); await shot("00-tools-start-early");
for (const [link, text, name] of [
  ["Tự do sự nghiệp", "Hiện tại bạn có", "runway"], ["Chi phí du học", "Theo giá hôm nay", "edu"], ["Góp đều (DCA)", "Giá vốn bình quân của bạn", "dca"],
  ["Tác động của phí", "khoảng chênh", "fee"], ["100 − tuổi", "Thu nhập cố định", "age"], ["Hồi phục", "Cần tăng để về lại điểm hòa vốn", "drawdown"],
  ["Danh mục thử nghiệm", "Kịch bản 1 năm", "sandbox"], ["Tái cân bằng", "Tỷ trọng cổ phiếu đã trôi thành", "rebalance"], ["Vòng đời lệnh", "Ngày giao dịch T", "order"],
]) { await page.getByRole("link", { name: link, exact: true }).click(); await page.getByText(text).first().waitFor(); await shot(`00-tools-${name}`); }
await btn("Bán").click(); await page.getByText("Tiền bán về tài khoản ngân hàng").waitFor(); await shot("00-tools-order-sell");
await page.goto(B + "/profile"); await page.getByText("Du học cho con").waitFor();
// Simulations: three reactions, then the timing game (5 months).
await page.goto(B + "/lesson/b3-reactions");
for (const r of ["Tiếp tục góp đều", "Tạm dừng góp, chờ hồi phục", "Bán hết, khi nào hồi lại mới mua"]) await btn(r).click();
await page.getByText("Kết quả sau 10 năm").waitFor(); await shot("00-sim-result");
await btn("Xem nhận xét").click(); await page.getByText("Điều dữ liệu cho thấy").waitFor(); await btn("Tiếp tục").click();
await page.goto(B + "/lesson/b3-market-myths");
for (let m = 0; m < 5; m++) {
  await btn("Chờ thêm").click(); await btn("Chờ thêm").click(); if (m === 0) await shot("00-game-day");
  await btn("Mua hôm nay").click();
  await btn(m < 4 ? "Tháng tiếp theo" : "Xem kết quả").click();
}
await page.getByText("Kết quả 5 tháng").waitFor(); await shot("00-game-result");
await btn("Xem nhận xét").click(); await page.getByText("Điều dữ liệu cho thấy").waitFor(); await btn("Tiếp tục").click();
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
