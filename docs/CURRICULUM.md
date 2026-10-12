# Curriculum

Three independent segments. ✅ = written in `content/segments/*`, ☐ = backlog (source already identified).
Counts in the skeleton: **3 segments · 13 units · 19 lessons · 58 challenges**.

## Segment A · Quỹ của Dragon Capital (`dc-funds`)

Source: *Tư vấn sản phẩm và hỗ trợ nhà đầu tư* (FAQ). Locator = "Câu N". Hearts on.

| Unit | Lessons | FAQ questions |
|---|---|---|
| A1 · Quỹ mở 101 | ✅ CCQ & NAV · ✅ Ai giữ tiền của bạn? · ☐ Quỹ mở vs ETF | Thuật ngữ, 4, 5, 6, 16, 19, 134, 135 |
| A2 · Gia đình quỹ DC | ✅ Làm quen các quỹ · ☐ DCDS vs DCDE · ☐ Cổ tức DCDE · ☐ Quỹ hưu trí | 1, 14, 16, 28, 34, 40, 41, 104, 106, 115, 122–124, 130, 133 |
| A3 · Đặt lệnh & thời gian nắm giữ | ✅ Lệnh mua bán quỹ mở · ☐ Chuyển tiền & Payoo · ☐ Chuyển đổi quỹ · ☐ Khấu trừ khi bán | 5, 10, 12, 30, 33, 42–54, 108, 110, 125, 127–129 |
| A4 · Đọc hiệu suất | ✅ Tính lợi nhuận · ☐ So sánh đúng kỳ · ☐ XIRR & lợi nhuận trên DragonX · ☐ Khi quỹ tăng chậm | 8, 23–27, 29, 31, 32, 87, 121 |
| A5 · DragonX & an toàn tài khoản | ✅ Giữ tài khoản an toàn · ☐ eKYC & căn cước · ☐ Nâng hạn mức · ☐ Ủy quyền, thừa kế, tặng CCQ | 55–94, 116, 120 |
| A6 · Dragon Capital (☐) | ☐ Công ty, ban đại diện quỹ, kênh hỗ trợ | 95–103, 107, 118 |

Not taught as lessons (support-only, link out instead): app error troubleshooting (79, 88, 89, 91, 72),
partner-channel admin (105, 119, 131, 132).

## Segment B · Kế hoạch của tôi (`my-plan`)

Sources: AMDD articles + FAQ 2, 3, 13, 18, 21, 22. **Hearts off.**

| Unit | Lessons | Sources |
|---|---|---|
| B1 · Hiểu bản thân | ✅ Tự đánh giá khẩu vị rủi ro (6 items, 4 dimensions → 5 profiles) · ✅ Quỹ dự phòng trước tiên | Bai_TuDoSuNghiep, FAQ 22, draft quiz |
| B2 · Đặt mục tiêu | ✅ 1 tỷ đồng đầu tiên (+ planner) · ✅ Du học cho con (+ planner) · ✅ Muộn vẫn hơn không · ☐ Ý nghĩa cột mốc 1 tỷ · ☐ Gấp đôi vốn trong 5 năm | Làm sao đạt 1 tỷ, Vì sao cột mốc 1 tỷ, dau-tu-du-hoc, Chiec_vali, Ke_Hoach_Du_Hoc, Nhà đầu tư 60 tuổi, FAQ 13, 21 |
| B3 · Kỷ luật đầu tư | ✅ DCA như đổ xăng · ✅ Sell in May? · ☐ Ngày tốt nhất để đầu tư · ☐ 10 năm DCDS | Khong_ai_doi_gia_xang, DCA là gì, Ngày tốt nhất (22 năm), DCDS 10 năm, Sell in May, FAQ 2, 3, 18 |
| B4 · Tâm lý thị trường (☐) | ☐ Khi lựa chọn nào cũng có vẻ sai · ☐ Không cần đoán từng nhịp · ☐ 3 điểm cho nhà đầu tư mới | Đầu tư gì khi lựa chọn nào cũng sai, Không cần đoán từng nhịp, 3 Điểm Nhấn |

Risk-profile → next steps (see `src/features/risk-profile/scoring.ts`):

| Profile | Study next (segment C) | DC fund documents to read |
|---|---|---|
| Bảo toàn | C1 MMF, C2 Trái phiếu | DCIP, DCBF |
| Thận trọng | C2 Trái phiếu, C5 Cân bằng | DCBF, DCIP, DCBA |
| Cân bằng | C5 Cân bằng, C4 Chỉ số | DCBA, DCBF, DCDE |
| Tăng trưởng | C3 Cổ phiếu, C4 Chỉ số, C5 Cân bằng | DCDE, DCDS, DCBA |
| Năng động | C3 Cổ phiếu, C4 Chỉ số | DCDS, DCDE, ETF |

## Segment C · Các loại quỹ (`fund-types`)

Sources: Articles W5 + FAQ. Hearts on. W5 banners/thumbnails can be used as unit covers.

| Unit | Lessons | Source |
|---|---|---|
| C1 · Quỹ thị trường tiền tệ | ✅ Khi tiền mặt cũng sinh lời · ☐ MMF vs tiền gửi | W5 Bài 1 |
| C2 · Quỹ trái phiếu | ✅ Trái phiếu không tuyệt đối an toàn · ☐ Duration bằng ví dụ số · ☐ Rủi ro tín dụng | W5 Bài 4 |
| C3 · Quỹ cổ phiếu | ✅ Cơ hội và biến động · ☐ Đọc factsheet quỹ cổ phiếu | FAQ 9, 23, 24, 123 (W5 article pending) |
| C4 · Quỹ chỉ số & chủ động vs thụ động | ✅ Là một phần của thị trường · ☐ Chi phí và tracking · ☐ ETF trên sàn | W5 Bài 2, 3; FAQ 7, 11, 135 |
| C5 · Quỹ cân bằng | ✅ Kỷ luật tái cân bằng · ✅ Kiểm tra: các loại quỹ (checkpoint) | W5 Bài 5 |

## Writing guide (for the content team)

- One idea per challenge, 3–6 challenges per lesson, ~3 minutes.
- Start a lesson with an `info` card when introducing a new concept; pick the mascot pose by meaning.
- Every graded challenge cites `source: { sourceId, locator }`.
- Use `numeric` for anything with a formula; give a `hint` with the formula.
- Use `scenario` for situations investors actually face (FIFO, phishing, buy-the-dip).
- Never state or imply guaranteed returns; any projected return is labelled "giả định".
- Don't hard-code fees, cut-off times or NAV values; use illustrative numbers or the fund-facts table.
- Run `npm run content:check` before opening a PR.
