/**
 * Prints the Q&A library and the fund facts as JSON for the standalone prototype
 * (prototype/rong-dc-academy.html embeds them for Hỏi Rồng). Usage:
 *   npx tsx scripts/export-library.ts > library.json
 */
import { FACTS_AS_OF, FEES, FUNDS, LIMITS, SCHEDULE } from "../content/library/fund-facts";
import { CATEGORIES, glossary, library } from "../content/library";

const vnd = (n: number) => n.toLocaleString("vi-VN");
const pct = (x: number) => `${(x * 100).toLocaleString("vi-VN")}%`;

const fundFacts = [
  `Số liệu cập nhật ${FACTS_AS_OF}. Quỹ mở không được cam kết lợi nhuận; số liệu quá khứ chỉ để minh họa.`,
  ...Object.values(FUNDS).map(
    (f) =>
      `${f.code} (${f.name}, quỹ ${f.kind}): ${f.holds} Phù hợp: ${f.suitsFor}${f.benchmark ? ` Chỉ số tham chiếu: ${f.benchmark}.` : ""} Giao dịch: ${f.tradingDays}. Nhận tiền bán: ${f.cashAfterSell}. Phí bán: ${f.sellFee}.${f.pastReturn ? ` Quá khứ: ${f.pastReturn}.` : ""}`,
  ),
  `Phí mua: ${FEES.buyFee}. Phí bán tối đa ${pct(FEES.sellFeeMax)}, ví dụ nắm giữ ${FEES.sellFeeExample.holding}: ${pct(FEES.sellFeeExample.rate)}; nắm giữ trên ${FEES.sellFeeFreeAfterYears} năm: 0%. Mỗi lần mua tính thời gian nắm giữ riêng, bán theo thứ tự mua trước bán trước (FIFO). Chuyển đổi quỹ làm thời gian nắm giữ tính lại từ đầu.`,
  `Thuế TNCN: ${pct(FEES.pitOnSale)} trên tổng số tiền bán (không phải trên lãi), áp dụng cả khi lỗ.`,
  `Phí chuyển tiền bán: ${vnd(FEES.transferFee.under500m)}đ nếu dưới 500 triệu, ${vnd(FEES.transferFee.from500m)}đ từ 500 triệu trở lên. ${FEES.transferFee.note}.`,
  `Phí quản lý: ${FEES.managementFee}.`,
  `Mua tối thiểu ${vnd(LIMITS.minBuy)}đ; bán hoặc duy trì tối thiểu ${LIMITS.minUnits} CCQ; hạn mức bán mặc định ${vnd(LIMITS.monthlySellLimit)}đ/tháng trên DragonX, nâng hạn mức qua cuộc gọi video.`,
  `Chốt lệnh ${SCHEDULE.orderCutoff}; tiền về ${SCHEDULE.cashCutoff}. NAV: ${SCHEDULE.navPublished}. Lợi nhuận cập nhật ${SCHEDULE.returnsUpdated}. Giờ làm việc: ${SCHEDULE.officeHours}.`,
].join("\n");

const out = {
  lib: library.map((e) => ({ c: CATEGORIES[e.cat].title, q: e.q, alt: e.alt ?? [], a: e.a, from: e.from })),
  glossary: glossary.map((g) => `${g.term}${g.full ? ` (${g.full})` : ""}: ${g.def}`),
  fundFacts,
};
process.stdout.write(JSON.stringify(out));
