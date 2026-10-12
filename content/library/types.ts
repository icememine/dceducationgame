/**
 * Thư viện hỏi đáp (the Q&A library behind Hỏi Rồng and the help centre).
 *
 * Merged from two internal documents: "Tư vấn sản phẩm hoàn chỉnh" (133 questions,
 * referenced as `faq:N`) and the customer-service workbook "FAQ Tư vấn IS" (sheets
 * QUỸ MỞ → `is:N`, ETF → `etf:N`, Thuật ngữ → glossary). Answers are rewritten for
 * investors: real numbers, no staff notes, no source line. `from` keeps the audit trail
 * and is never shown to the investor.
 */

export const CATEGORIES = {
  "chon-quy": { title: "Chọn quỹ & kế hoạch đầu tư", icon: "compass" },
  "quy-dc": { title: "Các quỹ mở của DC", icon: "dragon" },
  "nav-loi-nhuan": { title: "NAV, lợi nhuận & cổ tức", icon: "chart" },
  "bieu-phi-thue": { title: "Biểu phí & thuế", icon: "receipt" },
  "lich-giao-dich": { title: "Lịch giao dịch & thời điểm khớp lệnh", icon: "clock" },
  "dat-lenh": { title: "Đặt lệnh, hủy lệnh & nhận tiền bán", icon: "swap" },
  isaving: { title: "Đầu tư định kỳ iSAVING", icon: "repeat" },
  "chuyen-tien": { title: "Chuyển tiền & hoàn tiền", icon: "bank" },
  "so-du": { title: "Số dư, sao kê & xác nhận sở hữu", icon: "wallet" },
  "chuyen-doi": { title: "Chuyển đổi quỹ & chuyển số dư", icon: "shuffle" },
  "tai-khoan": { title: "Mở tài khoản, eKYC & hồ sơ", icon: "id" },
  "dang-nhap": { title: "Đăng nhập, mật khẩu & OTP", icon: "lock" },
  "han-muc": { title: "Hạn mức giao dịch", icon: "gauge" },
  "an-toan": { title: "An toàn tài sản & pháp lý", icon: "shield" },
  "kien-thuc": { title: "Kiến thức chung về chứng khoán & quỹ", icon: "book" },
  etf: { title: "Quỹ ETF", icon: "layers" },
  "lien-he": { title: "Liên hệ & dịch vụ nhà đầu tư", icon: "chat" },
} as const;

export type CategoryId = keyof typeof CATEGORIES;

export const FUND_CODES = ["DCDS", "DCDE", "DCBF", "DCIP", "DCBA", "VN30", "DIAMOND", "MIDCAP"] as const;
export type FundCode = (typeof FUND_CODES)[number];

/**
 * Where an entry came from: `faq:N` (Tư vấn sản phẩm hoàn chỉnh, N = 1..135),
 * `is:N` (FAQ Tư vấn IS, sheet QUỸ MỞ, row N) or `etf:N` (sheet ETF, row N).
 */
export type Origin = `faq:${number}` | `is:${number}` | `etf:${number}`;

export type LibraryEntry = {
  /** Stable kebab-case id. */
  id: string;
  cat: CategoryId;
  /** The question as an investor would ask it. */
  q: string;
  /** Other ways investors phrase it (helps search and the AI match questions). */
  alt?: string[];
  /** The answer, in Vietnamese, addressed to "anh/chị". Plain text; "\n" separates paragraphs or list lines. */
  a: string;
  funds?: FundCode[];
  from: Origin[];
};

export type GlossaryTerm = {
  term: string;
  /** Expansion of an acronym, if any (e.g. "Net Asset Value"). */
  full?: string;
  def: string;
};

/**
 * Source rows deliberately left out of the library, with the reason. Every source row is
 * either merged into an entry (`from`) or listed here, so nothing is lost silently.
 */
export type Excluded = { from: Origin; reason: string };
