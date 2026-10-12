/**
 * The numbers investors actually ask for: fees, tax, schedule, minimums. Single source for
 * lessons, Hỏi Rồng and the help centre, so a fee change is one edit here.
 *
 * Figures come from the customer-service workbook "FAQ Tư vấn IS" and must be re-checked
 * against the current biểu phí / bản cáo bạch before release (bump `FACTS_AS_OF`).
 * Past returns are illustrations, never promises: quỹ mở không được cam kết lợi nhuận.
 */

export const FACTS_AS_OF = "2026-10";

export type OpenFund = "DCDS" | "DCDE" | "DCBF" | "DCIP" | "DCBA";

export type FundFacts = {
  code: OpenFund;
  name: string;
  kind: "cổ phiếu" | "trái phiếu" | "cân bằng";
  /** What the portfolio holds, in plain words. */
  holds: string;
  suitsFor: string;
  /** Benchmark (chỉ số tham chiếu), when stated. */
  benchmark?: string;
  /** Trading days (ngày T). */
  tradingDays: string;
  /** When sale proceeds reach the bank account, counted in working days from T. */
  cashAfterSell: string;
  /** Sell fee summary for this fund. */
  sellFee: string;
  /** Historical figure quoted in the source, if any (illustration only). */
  pastReturn?: string;
};

export const FUNDS: Record<OpenFund, FundFacts> = {
  DCDS: {
    code: "DCDS",
    name: "Quỹ Đầu tư Chứng khoán Năng động DC",
    kind: "cổ phiếu",
    holds: "Tối đa 100% cổ phiếu tăng trưởng niêm yết; phần còn lại là trái phiếu và tiền gửi.",
    suitsFor: "Mục tiêu từ 5 năm trở lên, chấp nhận NAV có thể giảm mạnh trong ngắn hạn.",
    benchmark: "80% VN-Index + 20% chỉ số trái phiếu HNX kỳ hạn 2 năm",
    tradingDays: "Hằng ngày, thứ 2 đến thứ 6",
    cashAfterSell: "T+2",
    sellFee: "Theo thời gian nắm giữ, tối đa 2,5%; nắm giữ trên 2 năm: 0%",
    pastReturn: "Trung bình khoảng 24,8%/năm giai đoạn 5 năm được dẫn trong tài liệu tư vấn; không phải cam kết",
  },
  DCDE: {
    code: "DCDE",
    name: "Quỹ Đầu tư Cổ phiếu Tập trung Cổ tức DC",
    kind: "cổ phiếu",
    holds: "Cổ phiếu của doanh nghiệp trả cổ tức đều đặn.",
    suitsFor: "Mục tiêu dài hạn, ưa doanh nghiệp có dòng tiền ổn định; vẫn biến động như quỹ cổ phiếu.",
    benchmark: "VN-Index",
    tradingDays: "Hằng ngày, thứ 2 đến thứ 6",
    cashAfterSell: "T+2",
    sellFee: "Theo thời gian nắm giữ, tối đa 2,5%; nắm giữ trên 2 năm: 0%",
    pastReturn: "Trung bình khoảng 21,2%/năm giai đoạn 5 năm được dẫn trong tài liệu tư vấn; không phải cam kết",
  },
  DCBF: {
    code: "DCBF",
    name: "Quỹ Đầu tư Trái phiếu DC",
    kind: "trái phiếu",
    holds: "Khoảng 40% trái phiếu và 60% tiền gửi, công cụ thu nhập cố định.",
    suitsFor: "Người muốn lợi nhuận ổn định, biến động thấp; mục tiêu từ 1 năm trở lên.",
    tradingDays: "Thứ 4 và thứ 6 hằng tuần",
    cashAfterSell: "T+5",
    sellFee: "Theo thời gian nắm giữ, tối đa 2,5%; nắm giữ trên 2 năm: 0%",
    pastReturn: "Trên 10%/năm giai đoạn 5 năm được dẫn trong tài liệu tư vấn; mục tiêu cao hơn lãi suất tham chiếu 1–2%",
  },
  DCIP: {
    code: "DCIP",
    name: "Quỹ Đầu tư Thu nhập Chủ động DC",
    kind: "trái phiếu",
    holds: "Khoảng 65% trái phiếu và 35% tiền gửi.",
    suitsFor: "Tiền nhàn rỗi cần linh hoạt, muốn tốt hơn tiết kiệm ngắn hạn.",
    tradingDays: "Hằng ngày, thứ 2 đến thứ 6",
    cashAfterSell: "Trong ngày T",
    sellFee: "0% (miễn phí bán)",
  },
  DCBA: {
    code: "DCBA",
    name: "Quỹ Đầu tư Cân bằng DC",
    kind: "cân bằng",
    holds: "Kết hợp cổ phiếu với trái phiếu và tài sản thu nhập cố định.",
    suitsFor: "Người muốn một danh mục cân bằng giữa tăng trưởng và ổn định.",
    tradingDays: "Theo bản cáo bạch hiện hành",
    cashAfterSell: "Theo bản cáo bạch hiện hành",
    sellFee: "Theo biểu phí hiện hành",
  },
};

/** Fees, tax and limits that apply across the open funds. */
export const FEES = {
  buyFee: "0% (miễn phí mua)",
  /** Sell fee falls with holding time; known points from the workbook. */
  sellFeeMax: 0.025,
  sellFeeExample: { holding: "trên 6 tháng đến 1 năm", rate: 0.015 },
  sellFeeFreeAfterYears: 2,
  /** Personal income tax withheld on the gross sale amount (not on profit). */
  pitOnSale: 0.001,
  /** Bank transfer fee when proceeds are paid out. */
  transferFee: { under500m: 6_600, from500m: 220_000, note: "Miễn phí khi tài khoản nhận là ví MoMo, ngân hàng số CAKE hoặc Standard Chartered" },
  managementFee: "Đã trừ trong NAV/CCQ công bố hằng ngày; nhà đầu tư không trả thêm khi giao dịch",
  /** Lots are sold first-in, first-out; each lot has its own holding time. */
  lotOrder: "FIFO",
  switchResetsHolding: true,
} as const;

export const LIMITS = {
  minBuy: 100_000,
  /** Minimum units to sell or to keep after a partial sale. */
  minUnits: 10,
  /** Default monthly sell (withdrawal) limit on DragonX; raise it via a short video call. */
  monthlySellLimit: 100_000_000,
} as const;

export const SCHEDULE = {
  orderCutoff: "14:30 ngày T-1",
  /** Money received by 22:00 T-1 still makes day T, but 14:30 is recommended (interbank delays). */
  cashCutoff: "22:00 ngày T-1 (nên chuyển trước 14:30)",
  navPublished: "Khoảng 12:00 ngày T trên website và DragonX, tính theo giá đóng cửa ngày T-1",
  returnsUpdated: "Trước 18:00 mỗi ngày giao dịch (DCBF: thứ 4 và thứ 6)",
  officeHours: "Thứ 2 đến thứ 6, 9:00–12:00 và 13:30–17:30",
} as const;

/**
 * A worked redemption from the workbook, used by lessons and Hỏi Rồng to show where the
 * money goes: 15,49 CCQ sold at NAV 57.855,58 after 6–12 months of holding. The workbook's
 * 2022 transfer fee (12.100đ) is replaced by today's 6.600đ.
 */
export const SELL_EXAMPLE = {
  units: 15.49,
  nav: 57_855.58,
  gross: 896_183,
  pit: 896,
  sellFee: 13_443,
  transferFee: 6_600,
  net: 875_244,
} as const;

/** Net cash from a sale, rounded to the đồng. Transfer fee is passed in (it depends on the bank). */
export function netProceeds(gross: number, sellFeeRate: number, transferFee = 0) {
  const pit = Math.round(gross * FEES.pitOnSale);
  const fee = Math.round(gross * sellFeeRate);
  return { pit, fee, net: gross - pit - fee - transferFee };
}
