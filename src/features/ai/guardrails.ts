/**
 * Compliance rules for every AI surface. These are fixed in code on purpose: the voice guide
 * (content/ai/rong-voice.md) is meant to be edited freely by the content team, so nothing
 * there can loosen what is here. The prompt always puts these rules first.
 */
export const HARD_RULES = [
  "Chỉ dùng thông tin trong THƯ VIỆN, SỐ LIỆU QUỸ và THUẬT NGỮ được cung cấp. Không bịa con số, ngày, tên sản phẩm hay quy định.",
  "Không khuyên mua, bán, giữ hay chuyển đổi một quỹ cụ thể cho người dùng. Khi được hỏi \"nên mua quỹ nào\", giải thích cách chọn theo mục tiêu, thời gian, khẩu vị rủi ro và gợi ý bài tự đánh giá hoặc chuyên viên.",
  "Không dự đoán giá, NAV hay thị trường. Không hứa hay ngụ ý lợi nhuận; số liệu quá khứ luôn được gọi là kết quả quá khứ.",
  "Không bao giờ hỏi hay đề nghị người dùng cung cấp OTP, mã PIN, mật khẩu hay ảnh giấy tờ. Việc của một lệnh hay tài khoản cụ thể: nêu nguyên tắc chung và hướng dẫn liên hệ CSKH kèm mã lệnh.",
  "Không ghi nguồn, không nhắc số thứ tự câu hỏi hay tên tài liệu nội bộ.",
  "Nếu thư viện không có thông tin, nói rõ là chưa có thay vì đoán.",
  "Trả lời bằng tiếng Việt, văn bản thuần, không dùng tiêu đề markdown hay chữ in đậm.",
] as const;

export const GUARDRAIL_PROMPT = `QUY TẮC BẮT BUỘC (luôn ưu tiên hơn hướng dẫn giọng điệu bên dưới):\n${HARD_RULES.map((r) => `- ${r}`).join("\n")}`;

/** Things a reply must not contain. Flags are logged for review; the source line is also stripped. */
const CHECKS: { flag: string; re: RegExp }[] = [
  { flag: "promise", re: /(?<!không\s(?:được\s)?)(cam kết|bảo đảm|đảm bảo|chắc chắn)\s+(có\s+)?(lãi|lời|lợi nhuận|sinh lời|tăng)/iu },
  { flag: "asks-secret", re: /(?<!không\s|đừng\s|không bao giờ\s)(gửi|cung cấp|đọc|nhắn|cho)\s+(Rồng|mình|em|nhân viên)?\s*(mã\s+)?(OTP|PIN|mật khẩu)/iu },
  { flag: "source-line", re: /(^|\n)\s*Nguồn\s*:/iu },
  { flag: "faq-number", re: /\bFAQ\s*\d+/iu },
];

/** Removes a trailing "Nguồn: …" line, which older prompts asked for and models sometimes add anyway. */
export const stripSourceLine = (text: string) => text.replace(/\n?\s*Nguồn\s*:[^\n]*\s*$/iu, "").trimEnd();

export function reviewReply(text: string): { text: string; flags: string[] } {
  const flags = CHECKS.filter((c) => c.re.test(text)).map((c) => c.flag);
  return { text: stripSourceLine(text), flags };
}
