import type { Source } from "./schema";

/**
 * Every graded challenge cites one of these. The player shows "Nguồn: <title>" under the
 * insight for published articles only; internal documents (`internal: true`) stay in the
 * audit trail and are never shown. Bump `asOf` when facts are re-checked.
 */
export const sources = [
  { id: "faq", title: "Tư vấn sản phẩm và hỗ trợ nhà đầu tư", file: "Tu_van_san_pham_hoan_chinh.docx", asOf: "2026-10", internal: true },
  { id: "library", title: "Thư viện hỏi đáp Quỹ DC", file: "content/library (FAQ hoàn chỉnh + FAQ Tư vấn IS)", asOf: "2026-10", internal: true },
  { id: "w5-mmf", title: "W5 Bài 1 · Quỹ thị trường tiền tệ", file: "Articles/W5 Bài 1 - MMF-final.docx", asOf: "2026-10" },
  { id: "w5-index", title: "W5 Bài 2 · Quỹ chỉ số", file: "Articles/W5 Bài 2 Quỹ chỉ số_Index Fund_Final.docx", asOf: "2026-10" },
  { id: "w5-active-passive", title: "W5 Bài 3 · Quỹ chủ động vs thụ động", file: "Articles/W5 Bài 3 Active vs Passive-Final.docx", asOf: "2026-10" },
  { id: "w5-bond", title: "W5 Bài 4 · Quỹ trái phiếu nâng cao", file: "Articles/W5 Bài 4 - Quỹ trái phiếu nâng cao-final.docx", asOf: "2026-10" },
  { id: "w5-balanced", title: "W5 Bài 5 · Quỹ cân bằng nâng cao", file: "Articles/W5 bài 5-Quỹ cân bằng nâng cao-final.docx", asOf: "2026-10" },
  { id: "amdd-first-billion", title: "Làm sao đạt 1 tỷ đồng đầu tiên", file: "AMDD - Content/Làm sao đạt 1 tỷ đồng đầu tiên.docx", asOf: "2026-10" },
  { id: "amdd-billion-meaning", title: "Ý nghĩa cột mốc 1 tỷ đồng đầu tiên", file: "AMDD - Content/VÌ SAO CỘT MỐC 1 TỶ ĐỒNG ĐẦU TIÊN CÓ Ý NGHĨA.docx", asOf: "2026-10" },
  { id: "amdd-dca", title: "DCA là gì? Đầu tư đều đặn và lãi kép", file: "AMDD - Content/DCA Là Gì - ....docx", asOf: "2026-10" },
  { id: "amdd-petrol", title: "Không ai đợi giá xăng giảm mới đổ xăng", file: "AMDD - Content/Khong_ai_doi_gia_xang_giam_DCA_v5.docx", asOf: "2026-10" },
  { id: "amdd-best-day", title: "Ngày tốt nhất để đầu tư là ngày tiền về tài khoản", file: "AMDD - Content/Bai_viet_Ngay_tot_nhat_de_dau_tu (22 nam).docx", asOf: "2026-10" },
  { id: "amdd-dcds-10y", title: "10 năm đầu tư đều đặn vào DCDS", file: "AMDD - Content/DragonX_DCDS_10nam_Finalize.docx", asOf: "2026-10" },
  { id: "amdd-career-fund", title: "Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn?", file: "AMDD - Content/Bai_TuDoSuNghiep_Final.docx", asOf: "2026-10" },
  { id: "amdd-study-abroad", title: "Kế hoạch du học cho con nên bắt đầu từ đâu?", file: "AMDD - Content/dau-tu-du-hoc-BAN-CAP-NHAT-SO-LIEU.docx", asOf: "2026-10" },
  { id: "amdd-age-60", title: "Câu chuyện về nhà đầu tư 60 tuổi", file: "AMDD - Content/Câu Chuyện Về Nhà Đầu Tư 60 Tuổi.docx", asOf: "2026-10" },
  { id: "amdd-no-timing", title: "Đầu tư thế nào mà không cần đoán từng nhịp thị trường?", file: "AMDD - Content/Không cần đoán từng nhịp thị trường - ID - 20260820.docx", asOf: "2026-10" },
  { id: "amdd-sell-in-may", title: "Câu chuyện \"Sell in May\" tại thị trường Việt Nam", file: "AMDD - Content/Sell_in_May_DCDS.docx", asOf: "2026-10" },
  { id: "amdd-investor-day-3", title: "Investor Day 2026: ba điểm nhà đầu tư mới cần quan tâm", file: "AMDD - Content/3 Điểm Nhấn Quan Trọng Dành Cho Nhà Đầu Tư Mới.docx", asOf: "2026-10" },
  { id: "amdd-study-plan-nam", title: "Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam)", file: "AMDD - Content/Ke_Hoach_Du_Hoc_Cho_Con_Final.docx", asOf: "2026-10" },
  { id: "amdd-suitcase", title: "Chiếc vali được xếp trong mười năm", file: "AMDD - Content/Chiec_vali_xep_trong_muoi_nam_du_hoc_ban_don_gian_v3.docx", asOf: "2026-10" },
  { id: "amdd-waiting", title: "Thị trường còn nhiều biến số, có nên tiếp tục chờ?", file: "AMDD - Content/Đầu tư gì khi lựa chọn nào cũng có vẻ sai - Bản v7.docx", asOf: "2026-10" },
  { id: "dc-risk-quiz", title: "Bộ Đánh Giá Mức Độ Chấp Nhận Rủi Ro Nhà Đầu Tư (v2.3, 12/2025)", file: "2025-12_Risk_Scoring_Framework_VN_Final.docx", asOf: "2025-12", internal: true },
] as const satisfies readonly Source[];

export type SourceId = (typeof sources)[number]["id"];

export const sourceById = (id: string) => sources.find((s) => s.id === id);
