# Chương trình học Rồng DC Academy

> Tài liệu này được sinh tự động từ `content/outline/`. Sửa ở đó rồi chạy `npm run docs:curriculum`.

**3 chặng · 25 phần · 142 bài · 14 tình huống luyện AI.** 22 bài đã có bản chơi được (✅).

## Triết lý

Hiểu mình → Hiểu quỹ → Hiểu quỹ DC. Nhà đầu tư bắt đầu từ chính tình hình tài chính, khẩu vị rủi ro và mục tiêu của mình;
sau đó học loại quỹ nào làm việc gì; cuối cùng áp dụng vào sản phẩm Dragon Capital và giao dịch an toàn trên DragonX.

| Chặng | Vai trò | Phần | Bài |
|---|---|---|---|
| 1. Hiểu mình (B) | Chặng chính. Mọi quyết định đầu tư bắt đầu từ tình hình tài chính, mục tiêu và hành vi của chính nhà đầu tư. | 7 | 57 |
| 2. Hiểu quỹ (C) | Hỗ trợ chặng Hiểu mình. Sau khi biết khẩu vị và mục tiêu, nhà đầu tư học loại quỹ nào làm việc gì. | 8 | 42 |
| 3. Quỹ DC & DragonX (A) | Áp dụng: sản phẩm cụ thể của Dragon Capital và cách giao dịch an toàn trên DragonX. | 10 | 43 |

### Dạng bài

| Dạng | Mô tả | Số bài dùng |
|---|---|---|
| `story` | Câu chuyện | 11 |
| `concept` | Thẻ kiến thức | 50 |
| `quiz` | Câu hỏi nhanh | 70 |
| `calc` | Tính nhanh | 14 |
| `estimate` | Đoán số | 8 |
| `sim` | Mô phỏng | 26 |
| `game` | Trò chơi dữ liệu | 4 |
| `scenario` | Tình huống | 20 |
| `decision` | Ra quyết định | 10 |
| `case` | Hồ sơ hỗ trợ | 19 |
| `spot` | Tìm lỗi sai | 10 |
| `reflect` | Tự đánh giá · cam kết | 9 |
| `ai` | Luyện cùng AI | 1 |
| `checkpoint` | Kiểm tra | 10 |

### Công cụ tương tác dùng lại

| Công cụ | Dùng trong bài |
|---|---|
| Lập kế hoạch mục tiêu (`planner`) | B1.5, B3.2, B3.5, B3.11, B4.6, B7.5 |
| Máy tính lãi kép (`compound`) | B3.8, B4.2, B4.3, B4.4 |
| Mô phỏng DCA và đầu tư một lần (`dca-sim`) | B5.2, B5.3 |
| Trò chơi Nhà tiên tri (chọn ngày mua) (`timing-game`) | B5.5 |
| Mô phỏng ba phản ứng khi quỹ giảm (`reaction-sim`) | B2.4, B5.6 |
| Máy tính quỹ tự do sự nghiệp (`runway`) | B1.3, B1.4 |
| Ước tính chi phí du học (`edu-cost`) | B3.4 |
| Phân bổ theo quy tắc 100 − tuổi (`age-rule`) | B7.2 |
| Danh mục thử nghiệm (`sandbox`) | B7.4, B7.6, C6.5, C7.2, C8.2 |
| Máy tính hồi phục sau sụt giảm (`drawdown`) | C4.5 |
| Mô phỏng tái cân bằng (`rebalance`) | C7.3 |
| Bập bênh lãi suất – giá trái phiếu (`bond-seesaw`) | C3.2, C3.3 |
| Tác động của phí theo thời gian (`fee-impact`) | B4.7, C6.2 |
| Vòng đời một lệnh quỹ mở (`order-flow`) | A2.1 |
| Bản đồ lợi nhuận theo tháng (`month-heatmap`) | B6.5 |
| Chia thu nhập thành các ngăn (`income-split`) | B1.1 |

## Chặng 1 · Hiểu mình (B)

*Tiền của tôi · Khẩu vị rủi ro · Mục tiêu · Lãi kép · Kỷ luật · Thị trường · Phân bổ*

Chặng chính. Mọi quyết định đầu tư bắt đầu từ tình hình tài chính, mục tiêu và hành vi của chính nhà đầu tư.

### B1 · Tiền của tôi đang ở đâu?

Trước khi đầu tư, cần biết mình có gì, tiêu gì và có lưới an toàn hay chưa. Linh vật: `save`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B1.1** Chia thu nhập thành các ngăn | Chia thu nhập hằng tháng theo mục đích và chọn kênh phù hợp cho từng ngăn. *Công cụ: Chia thu nhập thành các ngăn.* | Câu chuyện, Mô phỏng, Câu hỏi nhanh | Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) |
| **B1.2** Tiền thưởng cũng là tiền lương | Nhận ra tâm lý chia ngăn và có kế hoạch cho các khoản thu ngoài lương. | Câu chuyện, Câu hỏi nhanh, Ra quyết định | Ngày tốt nhất để đầu tư là ngày tiền về tài khoản |
| **B1.3** Nếu mất việc hôm nay ✅ | Tự tính số tháng mình sống được không cần thu nhập và đặt mục tiêu quỹ tự do sự nghiệp. *Công cụ: Máy tính quỹ tự do sự nghiệp.* | Câu chuyện, Tính nhanh, Tự đánh giá · cam kết | Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn? |
| **B1.4** Bao lâu để có 12 tháng quyền lựa chọn | Chọn mức tích lũy hằng tháng thực tế để đạt quỹ dự phòng. *Công cụ: Máy tính quỹ tự do sự nghiệp.* | Mô phỏng, Đoán số | Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn? |
| **B1.5** Đặt tên cho khoản tiền | Tách riêng và đặt tên quỹ dự phòng để nó không bị tiêu lẫn. *Công cụ: Lập kế hoạch mục tiêu.* | Thẻ kiến thức, Tự đánh giá · cam kết | Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn? |
| **B1.6** Kiểm tra: Tiền của tôi | Ôn lại cả phần. | Kiểm tra | Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn? · Ngày tốt nhất để đầu tư là ngày tiền về tài khoản · Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B1.1**: Gia đình anh Nam thu nhập 90 triệu/tháng, chia 4 ngăn: sinh hoạt 36 triệu (40%), học phí hiện tại 20 triệu (22%), hưu trí 10 triệu (11%), du học 20–25 triệu (27%); Học phí hiện tại → quỹ trái phiếu/tiết kiệm; hưu trí → quỹ hưu trí; du học dài hạn → quỹ cổ phiếu
- **B1.2**: Thưởng Tết 50 triệu: qua 21 mùa Tết, đầu tư ngay trong tháng 2 cao hơn khoảng 7% so với chờ 6 tháng; Tâm lý chia ngăn: tiền thưởng, hoa hồng, tiền dự án dễ bị xếp vào ngăn "để tính sau"
- **B1.3**: Quỹ tự do sự nghiệp = 12 tháng chi tiêu; chi 15 triệu/tháng → khoảng 180 triệu; Dưới 3 tháng: cần hành động; 6–12 tháng: tương đối an toàn; lý tưởng 12–18 tháng
- **B1.4**: Giả định 15%/năm: góp 3 / 5 / 10 triệu/tháng đạt 180 triệu sau 3,8 / 2,5 / 1,4 năm; Sau 5 năm: 266 / 443 / 886 triệu, tương đương 1,5 / 2,5 / 5 năm chi tiêu
- **B1.5**: Khoản tiền được đặt tên và theo dõi tiến độ được xử lý như một cam kết, không phải khoản "để dành nếu còn tiền"

</details>

### B2 · Khẩu vị rủi ro của tôi

Biết mình chịu được biến động đến đâu trước khi chọn bất kỳ quỹ nào. Linh vật: `explore`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B2.1** Rủi ro nghĩa là gì với bạn? | Phân biệt biến động giá, mất vốn và không đạt mục tiêu. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 9, 23 |
| **B2.2** Muốn chịu rủi ro và có thể chịu rủi ro | Hiểu vì sao khả năng tài chính và thời gian giới hạn mức rủi ro, dù mình rất muốn mạo hiểm. | Thẻ kiến thức, Tình huống | Kế hoạch du học cho con nên bắt đầu từ đâu? · FAQ 123 |
| **B2.3** Bài tự đánh giá khẩu vị rủi ro ✅ | Nhận một trong 5 hồ sơ (Bảo toàn → Năng động) và lộ trình học gợi ý. | Tự đánh giá · cam kết | Bộ câu hỏi tự đánh giá (bản nháp, chờ Compliance duyệt) · Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn? |
| **B2.4** Danh mục của bạn vừa giảm 20% | Trải nghiệm cảm giác thua lỗ tạm thời và thấy điều gì xảy ra nếu kiên nhẫn. *Công cụ: Mô phỏng ba phản ứng khi quỹ giảm.* | Mô phỏng, Ra quyết định | Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) |
| **B2.5** Rủi ro lớn nhất là chính mình | Nhận diện FOMO, bán tháo và "mua cao bán thấp". | Câu chuyện, Câu hỏi nhanh, Tìm lỗi sai | DCA là gì? Đầu tư đều đặn và lãi kép · Investor Day 2026: ba điểm nhà đầu tư mới cần quan tâm |
| **B2.6** Hồ sơ của tôi và lộ trình tiếp theo | Đọc kết quả hồ sơ, hiểu vì sao bị giới hạn, biết khi nào cần làm lại (mỗi 12 tháng hoặc khi hoàn cảnh đổi). | Tự đánh giá · cam kết, Thẻ kiến thức | Bộ câu hỏi tự đánh giá (bản nháp, chờ Compliance duyệt) |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B2.1**: Quỹ mở có rủi ro thị trường, lãi suất, tín dụng, thanh khoản và rủi ro từ quyết định đầu tư; Lợi nhuận quỹ có thể âm trong một số năm
- **B2.2**: Chấp nhận rủi ro cao vẫn cần năng lực tài chính, khoản dự phòng và thời gian đầu tư; Khả năng chấp nhận biến động không thể tách rời thời gian còn lại đến mục tiêu
- **B2.4**: DCDS: người bắt đầu giữa năm 2024, sau 12 tháng (đầu 5/2025) vẫn lỗ nhẹ; Giữ thêm 3–6 tháng, đến cuối 2025 đã có lợi nhuận 38%; "Chúng ta không dự đoán được khi nào thị trường tăng mạnh, khi nào giảm mạnh, kể cả nhà đầu tư chuyên nghiệp"
- **B2.5**: Hơn 90% tài khoản giao dịch cá nhân không có lãi, hoặc lãi dưới 10%/năm; Nguyên nhân chính là hành vi: mua khi đã tăng mạnh vì FOMO, bán tháo khi giảm; Rủi ro lớn nhất của nhà đầu tư cá nhân thường đến từ hành vi thiếu kỷ luật, không phải từ thị trường

</details>

### B3 · Mục tiêu của tôi

Một kế hoạch bắt đầu từ số tiền cần có và thời điểm cần tiền, không phải từ tên quỹ. Linh vật: `grow`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B3.1** Bốn con số của mọi kế hoạch | Trả lời được: cần bao nhiêu, còn bao lâu, đã có bao nhiêu, mỗi tháng góp được bao nhiêu. | Thẻ kiến thức, Câu hỏi nhanh | Kế hoạch du học cho con nên bắt đầu từ đâu? · Làm sao đạt 1 tỷ đồng đầu tiên |
| **B3.2** 1 tỷ đồng đầu tiên ✅ | Tính được thời gian đạt 1 tỷ với mức góp của mình. *Công cụ: Lập kế hoạch mục tiêu.* | Đoán số, Mô phỏng | Làm sao đạt 1 tỷ đồng đầu tiên |
| **B3.3** Vì sao cột mốc 1 tỷ có ý nghĩa | Hiểu giai đoạn tài sản bắt đầu "làm việc" và vì sao nhiều người bỏ cuộc trước đó. | Câu chuyện, Thẻ kiến thức, Câu hỏi nhanh | Ý nghĩa cột mốc 1 tỷ đồng đầu tiên |
| **B3.4** Du học: con số thật ✅ | Ước tính chi phí du học tại thời điểm nhập học, có tính lạm phát học phí và tỷ giá. *Công cụ: Ước tính chi phí du học.* | Đoán số, Mô phỏng | Kế hoạch du học cho con nên bắt đầu từ đâu? · Chiếc vali được xếp trong mười năm |
| **B3.5** Chiếc vali xếp trong mười năm | Thấy bắt đầu sớm làm giảm mạnh số tiền phải góp mỗi tháng. *Công cụ: Lập kế hoạch mục tiêu.* | Câu chuyện, Mô phỏng, Câu hỏi nhanh | Chiếc vali được xếp trong mười năm · Kế hoạch du học cho con nên bắt đầu từ đâu? |
| **B3.6** Có nhà đất rồi, đã đủ cho con đi học chưa? | Đánh giá một tài sản theo ba tiêu chí: tăng trưởng theo kịp chi phí, thanh khoản, có tiền đúng lúc. | Tình huống, Ra quyết định | Kế hoạch du học cho con nên bắt đầu từ đâu? |
| **B3.7** Thiếu tiền: tăng rủi ro hay điều chỉnh mục tiêu? | Chọn cách bù thiếu hụt mà không đẩy rủi ro vượt khả năng chịu đựng. | Tình huống, Ra quyết định | Kế hoạch du học cho con nên bắt đầu từ đâu? · FAQ 22 |
| **B3.8** Muộn vẫn hơn không: chuẩn bị nghỉ hưu ✅ | Hiểu chi phí của sự trì hoãn và các cách tích lũy hưu trí. *Công cụ: Máy tính lãi kép.* | Câu chuyện, Mô phỏng, Câu hỏi nhanh | Câu chuyện về nhà đầu tư 60 tuổi · FAQ 41, 130 |
| **B3.9** Gấp đôi vốn trong 5 năm? | Tính lợi nhuận cần thiết cho một mục tiêu và nhận ra khi nào mục tiêu đòi hỏi rủi ro quá lớn. | Tính nhanh, Câu hỏi nhanh | Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) · FAQ 21 |
| **B3.10** Mua nhà, mua xe: mục tiêu có ngày cố định | Chọn mức biến động phù hợp cho khoản tiền cần dùng vào một ngày cụ thể. | Tình huống, Câu hỏi nhanh | FAQ 22, 13 |
| **B3.11** Lập kế hoạch của tôi | Tạo ít nhất một mục tiêu với bốn con số và lưu vào hồ sơ. *Công cụ: Lập kế hoạch mục tiêu.* | Tự đánh giá · cam kết, Mô phỏng | Làm sao đạt 1 tỷ đồng đầu tiên · Kế hoạch du học cho con nên bắt đầu từ đâu? |
| **B3.12** Kiểm tra: Mục tiêu của tôi | Ôn lại cả phần. | Kiểm tra | Làm sao đạt 1 tỷ đồng đầu tiên · Chiếc vali được xếp trong mười năm · Câu chuyện về nhà đầu tư 60 tuổi |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B3.1**: Khi chưa rõ số tiền cần có và thời điểm cần tiền, ngay cả một quỹ tốt cũng chưa chắc giúp đạt mục tiêu
- **B3.2**: 5 triệu/tháng, giả định 15%/năm → khoảng 8 năm 4 tháng; vốn góp khoảng 504 triệu, khoảng 496 triệu từ lãi kép; 10 triệu/tháng → khoảng 5 năm 6 tháng, nhanh hơn gần 3 năm; 10 triệu/tháng: gần 2,75 tỷ sau 10 năm, khoảng 15 tỷ sau 20 năm
- **B3.3**: Giai đoạn đầu, tài sản tăng chủ yếu nhờ tiền góp, dễ mất kiên nhẫn nhất; Đến một lúc, lợi nhuận một năm có thể sánh ngang hoặc vượt số tiền góp trong năm; 1 tỷ không phải tự do tài chính, mà là điểm khởi đầu của giai đoạn tích lũy mới
- **B3.4**: Trường tư hàng đầu Mỹ: 362.000 USD ≈ 9,5 tỷ (2026); Singapore ≈ 7,6 tỷ; Anh ≈ 6,5 tỷ; bình quân 40.000 USD/năm ≈ 4,2 tỷ cho 4 năm; Chi phí tăng 4,4%/năm và VND mất giá 2%/năm → khoảng 17,8 tỷ sau 10 năm (gần 1,9 lần); Phần chưa dùng tiếp tục sinh lời 7%/năm → cần khoảng 15,1 tỷ tại thời điểm nhập học
- **B3.5**: Mục tiêu 4,2 tỷ, giả định 13%/năm: bắt đầu khi con 3 tuổi → 8 triệu/tháng; 8 tuổi → 18 triệu; 13 tuổi → 51 triệu; 15 năm: góp 1,5 tỷ, 2,7 tỷ từ sinh lời; 5 năm: góp 3,1 tỷ, chỉ 1,1 tỷ từ sinh lời; Mỗi 1 tỷ đầu tư ngay từ đầu giảm khoảng 15 triệu tiền góp mỗi tháng (≈1,8 tỷ trong 10 năm)
- **B3.6**: Lịch nhập học không lùi được vì thị trường bất động sản trầm lắng; học phí đóng từng kỳ, nhà đất khó bán từng phần
- **B3.7**: Gia đình có 2 tỷ đã đầu tư + 20 triệu/tháng: đủ cho Anh, thiếu ~6 triệu/tháng cho Singapore, thiếu ~20 triệu/tháng cho trường top Mỹ; Có thể bù bằng học bổng, học trong nước rồi chuyển tiếp, hoặc dùng một phần thu nhập khi con đi học
- **B3.8**: Người lái xe 60 tuổi góp 2 triệu/tháng; sau gần 1 năm, 29 triệu vốn thành gần 37 triệu (+27%); Cùng mức góp, bắt đầu ở 25–30 tuổi và ở 45–50 tuổi chênh lệch rất lớn sau 20–30 năm; Quỹ hưu trí qua doanh nghiệp khác tự tích lũy: có đóng góp của doanh nghiệp, cơ chế rút khác
- **B3.9**: Gấp đôi trong 5 năm cần khoảng 14,9%/năm, trước phí và thuế, không được bảo đảm; Với 15%/năm, khoảng 5 năm tiền nhân đôi
- **B3.10**: Khoản cần dùng sớm hoặc có thời hạn cố định nên ưu tiên thanh khoản và hạn chế biến động; Gần đến lúc cần tiền, giảm dần tài sản biến động mạnh
- **B3.11**: Rà soát kế hoạch ít nhất mỗi năm một lần, hoặc 2–3 năm một lần với mục tiêu dài

</details>

### B4 · Sức mạnh của lãi kép

Thời gian là biến số mạnh nhất mà nhà đầu tư cá nhân kiểm soát được. Linh vật: `grow`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B4.1** Lãi sinh lãi | Giải thích lãi kép và nhận biết khi nào lãi kép bị ngắt. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 38 |
| **B4.2** 1 tỷ trong 30 năm ✅ | Đoán rồi so sánh với con số thật để cảm nhận đường cong lãi kép. *Công cụ: Máy tính lãi kép.* | Đoán số, Mô phỏng | Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) |
| **B4.3** 5 triệu mỗi tuần | Thấy góp nhỏ đều đặn trong thời gian dài tạo ra kết quả lớn. *Công cụ: Máy tính lãi kép.* | Đoán số, Mô phỏng | DCA là gì? Đầu tư đều đặn và lãi kép |
| **B4.4** Bắt đầu năm 25 tuổi hay 45 tuổi | So sánh hai người cùng mức góp, khác thời điểm bắt đầu. *Công cụ: Máy tính lãi kép.* | Mô phỏng, Câu hỏi nhanh | Câu chuyện về nhà đầu tư 60 tuổi · DCA là gì? Đầu tư đều đặn và lãi kép |
| **B4.5** Ba năm đầu: lãi kép chưa thấy đâu | Chuẩn bị tâm lý cho giai đoạn đầu khi tài khoản chủ yếu là vốn của mình. | Câu chuyện, Đoán số | 10 năm đầu tư đều đặn vào DCDS · Ý nghĩa cột mốc 1 tỷ đồng đầu tiên |
| **B4.6** Tăng mức góp 5% mỗi năm | Thấy tác dụng của việc tăng dần số tiền góp theo thu nhập. *Công cụ: Lập kế hoạch mục tiêu.* | Mô phỏng, Tính nhanh | 10 năm đầu tư đều đặn vào DCDS · Làm sao đạt 1 tỷ đồng đầu tiên |
| **B4.7** Phí cũng có lãi kép | Thấy chênh lệch phí nhỏ mỗi năm thành khoảng lớn sau 20 năm. *Công cụ: Tác động của phí theo thời gian.* | Mô phỏng, Câu hỏi nhanh | W5 Bài 2 · Quỹ chỉ số · W5 Bài 3 · Quỹ chủ động vs thụ động · FAQ 125 |
| **B4.8** Cổ tức và tái đầu tư | Không cộng trùng cổ tức khi tính lợi nhuận và biết khi nào cần tự tái đầu tư. | Thẻ kiến thức, Tìm lỗi sai | FAQ 39, 40 |
| **B4.9** Kiểm tra: Lãi kép | Ôn lại cả phần. | Kiểm tra | DCA là gì? Đầu tư đều đặn và lãi kép · 10 năm đầu tư đều đặn vào DCDS · FAQ 38 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B4.1**: Lãi kép: lợi nhuận được giữ lại hoặc tái đầu tư tạo cơ sở sinh lời cho kỳ sau; không cần góp thêm vốn; Quỹ giữ lại thu nhập: phản ánh trong NAV; quỹ trả tiền mặt: phải tự tái đầu tư nếu muốn tiếp tục tích lũy
- **B4.2**: Đầu tư một lần 1 tỷ, giả định 15%/năm: 5 năm → 2 tỷ; 10 năm → 4 tỷ; 20 năm → 16,4 tỷ; 30 năm → 66,2 tỷ
- **B4.3**: 5 triệu/tuần (~20 triệu/tháng) trong 30 năm: vốn góp ~7,9 tỷ; Giả định 15%/năm: 10 năm ~5,8 tỷ; 20 năm ~29,1 tỷ; 30 năm ~123,5 tỷ (hơn 15 lần vốn); 15%/năm là mức tham chiếu lịch sử thị trường Việt Nam từ năm 2000, gồm cổ tức; không được bảo đảm
- **B4.4**: Thời gian đầu tư dài hơn tạo tác động lớn hơn việc tăng số tiền ban đầu; Trì hoãn có chi phí thật: chi phí cơ hội của những năm lãi kép bị bỏ lỡ
- **B4.5**: 10 triệu/tháng vào DCDS từ 8/2016: sau 3 năm góp 360 triệu, tài khoản ~404 triệu (gần 90% là vốn); Sau 5 năm: 600 triệu → 1,06 tỷ; sau 10 năm: 1,2 tỷ → ~2,21 tỷ
- **B4.6**: Tăng 5%/năm từ 10 triệu lên ~15,5 triệu ở năm 10: góp thêm ~310 triệu, tài khoản thêm ~440 triệu, lên 2,65 tỷ
- **B4.7**: Quỹ chỉ số 0,3–0,8%/năm; quỹ chủ động 1,5–2,5%/năm; Phí quản lý đã phản ánh trong NAV, không thu thêm khi giao dịch
- **B4.8**: Không cộng thêm cổ tức vào một chỉ tiêu đã bao gồm cổ tức; Tiền phân phối ra ngoài quỹ chỉ được tái đầu tư khi có giao dịch mua tương ứng

</details>

### B5 · Kỷ luật và DCA

Một kế hoạch chỉ có giá trị nếu duy trì được qua các nhịp thị trường. Linh vật: `fight`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B5.1** Không ai đợi giá xăng giảm mới đổ xăng ✅ | Giải thích DCA bằng một ví dụ đời thường. | Câu chuyện, Câu hỏi nhanh | Không ai đợi giá xăng giảm mới đổ xăng · DCA là gì? Đầu tư đều đặn và lãi kép |
| **B5.2** Giá vốn bình quân | Tự tính số CCQ mua được và giá vốn bình quân qua nhiều kỳ. *Công cụ: Mô phỏng DCA và đầu tư một lần.* | Tính nhanh, Mô phỏng | DCA là gì? Đầu tư đều đặn và lãi kép · Không ai đợi giá xăng giảm mới đổ xăng |
| **B5.3** DCA hay đầu tư một lần? | Chọn cách giải ngân phù hợp với nguồn tiền và khả năng chịu biến động. *Công cụ: Mô phỏng DCA và đầu tư một lần.* | Thẻ kiến thức, Tình huống | FAQ 3, 2, 13, 18 |
| **B5.4** Ngày tốt nhất để đầu tư | Hiểu vì sao giảm thời gian tiền nằm chờ quan trọng hơn chọn ngày đẹp. | Trò chơi dữ liệu, Câu hỏi nhanh | Ngày tốt nhất để đầu tư là ngày tiền về tài khoản |
| **B5.5** Trò chơi Nhà tiên tri | Tự chơi chọn ngày mua và thấy chênh lệch chỉ vài phần trăm sau 22 năm. *Công cụ: Trò chơi Nhà tiên tri (chọn ngày mua).* | Trò chơi dữ liệu | Không ai đợi giá xăng giảm mới đổ xăng · Ngày tốt nhất để đầu tư là ngày tiền về tài khoản |
| **B5.6** Ba phản ứng khi quỹ giảm ✅ | So sánh kiên trì, tạm dừng và bán rồi mua lại trên dữ liệu 10 năm. *Công cụ: Mô phỏng ba phản ứng khi quỹ giảm.* | Ra quyết định, Trò chơi dữ liệu | 10 năm đầu tư đều đặn vào DCDS |
| **B5.7** Điều bạn kiểm soát được | Phân loại các yếu tố kiểm soát được và không kiểm soát được. | Câu hỏi nhanh, Tự đánh giá · cam kết | 10 năm đầu tư đều đặn vào DCDS |
| **B5.8** DCA linh hoạt và DCA với ETF | Biết có thể đổi số tiền góp và áp dụng tích lũy định kỳ cho ETF. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 129, 7 |
| **B5.9** Kiểm tra: Kỷ luật | Ôn lại cả phần. | Kiểm tra | Không ai đợi giá xăng giảm mới đổ xăng · Ngày tốt nhất để đầu tư là ngày tiền về tài khoản · 10 năm đầu tư đều đặn vào DCDS |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B5.1**: Người mua không quyết định được giá, nhưng quyết định được số tiền bỏ ra; giá cao mua ít, giá thấp mua nhiều
- **B5.2**: Giá vốn hình thành qua nhiều lần mua ở các mức giá khác nhau, không phụ thuộc một lần mua duy nhất
- **B5.3**: Vốn từ thu nhập hằng tháng → đầu tư định kỳ; đã có vốn sẵn → một lần hoặc chia đợt; DCA không loại bỏ rủi ro và không luôn hơn đầu tư một lần, đặc biệt khi thị trường tăng liên tục
- **B5.4**: DCDS 5/2004–6/2026 tăng bình quân ~12,6%/năm; Mua vào ngày 1, 10 hay 25 hằng tháng chỉ xê dịch kết quả dưới 1%; Đầu tư ngay cho kết quả cao hơn chờ 3 tháng trong ~58% trường hợp, cao hơn chờ 6 tháng trong ~63% (đo sau 3 năm)
- **B5.5**: 10 triệu/tháng × 265 tháng (5/2004–6/2026), vốn 2,65 tỷ: luôn mua đáy ~11,8 tỷ; theo lịch ~11,4 tỷ; luôn mua đỉnh ~11 tỷ; Người mua theo lịch chỉ thấp hơn người luôn mua đáy ~2,7%; người xui nhất chỉ kém ~3,6%
- **B5.6**: Cùng góp 1,2 tỷ trong 10 năm vào DCDS: kiên trì ~2,21 tỷ; tạm dừng khi quỹ giảm ~2,16 tỷ (11 lần ra vào); bán rồi mua lại ~1,85 tỷ; Bán ra rồi mua lại ít hơn ~360 triệu, tương đương 3 năm đầu tư
- **B5.7**: Kiểm soát được: số tiền góp, mức rủi ro chấp nhận, có tiếp tục kế hoạch hay không; Không kiểm soát được: thị trường năm tới, quỹ tăng bao nhiêu, thời điểm tốt nhất
- **B5.8**: Có thể điều chỉnh số tiền nếu đáp ứng mức tối thiểu; ETF mua theo giá thị trường: tính đơn vị giao dịch, thanh khoản, chênh lệch giá mua bán, phí và thuế

</details>

### B6 · Hiểu thị trường

Hiểu thị trường vận hành thế nào để không hoảng loạn và không đuổi theo tin đồn. Linh vật: `analyze`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B6.1** Thị trường chứng khoán đi cùng nền kinh tế | Giải thích vì sao thị trường tăng trưởng dài hạn theo lợi nhuận doanh nghiệp và kinh tế. | Thẻ kiến thức, Câu hỏi nhanh | Investor Day 2026: ba điểm nhà đầu tư mới cần quan tâm · Câu chuyện về nhà đầu tư 60 tuổi |
| **B6.2** Chỉ một phần nhỏ cổ phiếu dẫn dắt | Hiểu vì sao chọn đúng cổ phiếu khó và quỹ đa dạng hóa giúp gì. | Thẻ kiến thức, Đoán số | DCA là gì? Đầu tư đều đặn và lãi kép · Investor Day 2026: ba điểm nhà đầu tư mới cần quan tâm |
| **B6.3** Vàng, tiết kiệm hay chứng khoán? | So sánh các kênh trên cùng khung thời gian và hiểu kết quả phụ thuộc thời điểm. | Câu chuyện, Câu hỏi nhanh | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? |
| **B6.4** Có nên chờ thêm? | Phân biệt thận trọng hợp lý (tiền cần trong 1–2 năm) với chờ vô thời hạn. | Câu chuyện, Ra quyết định | Thị trường còn nhiều biến số, có nên tiếp tục chờ? |
| **B6.5** Sell in May có đúng ở Việt Nam? ✅ | Kiểm tra một quy tắc truyền miệng bằng dữ liệu. *Công cụ: Bản đồ lợi nhuận theo tháng.* | Trò chơi dữ liệu, Câu hỏi nhanh | Câu chuyện "Sell in May" tại thị trường Việt Nam |
| **B6.6** Vì sao quỹ đi khác chỉ số | Giải thích vì sao thị trường giảm mà NAV quỹ tăng, hoặc vừa mua đã thấy âm. | Thẻ kiến thức, Hồ sơ hỗ trợ | FAQ 37, 87 |
| **B6.7** Sau một năm thua lỗ | Đánh giá một năm quỹ giảm hoặc tăng chậm hơn quỹ khác mà không phản ứng vội. | Tình huống, Ra quyết định | FAQ 24, 121 |
| **B6.8** Kiểm tra: Thị trường | Ôn lại cả phần. | Kiểm tra | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? · Câu chuyện "Sell in May" tại thị trường Việt Nam · Thị trường còn nhiều biến số, có nên tiếp tục chờ? |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B6.1**: Quy mô thị trường kỳ vọng mở rộng cùng lợi nhuận doanh nghiệp, làn sóng IPO và nâng hạng; Đây là kịch bản kỳ vọng, không phải dự báo chắc chắn
- **B6.2**: Năm 2025 chỉ khoảng 17% cổ phiếu niêm yết tăng vượt chỉ số
- **B6.3**: Vị luật sư khoe vàng năm 2011, rồi im lặng gần 10 năm; Vàng có tính chu kỳ: 9% đến 19–20%/năm tùy thời điểm mua; Khung 10–15 năm: chứng khoán ~13–14%/năm; tiền gửi tốt ~7,5%/năm; Lãi suất tiền gửi 9–10% được đánh giá là đột biến, không kỳ vọng kéo dài
- **B6.4**: Vàng miếng từ gần 180 triệu xuống ~147 triệu/lượng: người mua đầu năm lỗ ~30 triệu/lượng; Với mục tiêu 3–10 năm, thị trường hiếm khi có thời điểm "mọi thứ đã rõ ràng"
- **B6.5**: 2014–2025: VN-Index tăng trong tháng 5 ở 8/12 năm, trung bình +2,01% (DCDS +2,82%), xếp thứ 4/12 tháng; Tháng 5 dao động từ −7,52% đến +12,40%; Tháng 5–10 trung bình +6,82%, cao hơn tháng 11–4 (+4,83%); tháng 3, 9, 10 mới có trung bình âm
- **B6.6**: Danh mục và tỷ trọng quỹ khác chỉ số; tiền mặt, trái phiếu, chi phí cũng ảnh hưởng; Vừa mua đã âm có thể do NAV mới thay đổi, làm tròn hoặc chi phí
- **B6.7**: So sánh cùng kỳ, cùng phương pháp, cùng mức rủi ro trước khi kết luận; Không có bảo đảm quỹ phục hồi trong một thời hạn cụ thể

</details>

### B7 · Phân bổ tài sản của tôi

Cầu nối sang chặng Hiểu quỹ: tỷ trọng cổ phiếu và trái phiếu quan trọng hơn số lượng quỹ. Linh vật: `trophy`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **B7.1** Nhiều quỹ chưa chắc tốt hơn | Hiểu mỗi quỹ đã đa dạng hóa sẵn và tỷ trọng mới là điều quan trọng. | Thẻ kiến thức, Câu hỏi nhanh | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? |
| **B7.2** Quy tắc 100 trừ tuổi | Tính tỷ trọng cổ phiếu tham khảo và hiểu giới hạn của quy tắc. *Công cụ: Phân bổ theo quy tắc 100 − tuổi.* | Tính nhanh, Mô phỏng | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? |
| **B7.3** Ba chân dung nhà đầu tư | Ghép chân dung với khung phân bổ tham khảo. | Câu hỏi nhanh, Tình huống | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? |
| **B7.4** Công thức 60/40 | Hiểu danh mục 60% cổ phiếu, 40% trái phiếu và vì sao vẫn dùng được ở tuổi 60. *Công cụ: Danh mục thử nghiệm.* | Thẻ kiến thức, Mô phỏng | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? · W5 Bài 5 · Quỹ cân bằng nâng cao |
| **B7.5** Càng gần ngày cần tiền | Lập lộ trình giảm dần tỷ trọng tài sản biến động khi gần mục tiêu. *Công cụ: Lập kế hoạch mục tiêu.* | Thẻ kiến thức, Mô phỏng | Kế hoạch du học cho con nên bắt đầu từ đâu? · Chiếc vali được xếp trong mười năm · FAQ 13 |
| **B7.6** Bản kế hoạch đầu tư của tôi | Ghép hồ sơ rủi ro, mục tiêu và phân bổ thành một bản kế hoạch có thể lưu và chia sẻ. *Công cụ: Danh mục thử nghiệm.* | Tự đánh giá · cam kết, Mô phỏng | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? · Làm sao đạt 1 tỷ đồng đầu tiên |
| **B7.7** Kiểm tra cuối chặng: Hiểu mình | Đạt ≥ 80% để nhận chứng nhận "Hiểu mình". | Kiểm tra | Đầu tư thế nào mà không cần đoán từng nhịp thị trường? · 10 năm đầu tư đều đặn vào DCDS · Làm sao đạt 1 tỷ đồng đầu tiên |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **B7.1**: "Không cần thiết phải nhiều quỹ. Quan trọng nhất là tỷ trọng giữa cổ phiếu và trái phiếu"
- **B7.2**: 100 − tuổi = tỷ trọng cổ phiếu tham khảo (30 tuổi → 70%); Biến thể 120 − tuổi cho người chấp nhận rủi ro cao hơn; Tuổi chỉ là một yếu tố, bên cạnh mục tiêu và khẩu vị rủi ro
- **B7.3**: Thận trọng, thời gian ngắn → quỹ rủi ro thấp như quỹ trái phiếu; 3–5 năm, rủi ro vừa phải → quỹ cân bằng (~40% trái phiếu làm "bộ giảm sốc"); Trẻ, chấp nhận rủi ro cao → cổ phiếu 80–90%, thậm chí 100% (chỉ là khung tham khảo)
- **B7.5**: Ví dụ du học: 15%/năm trong 7 năm đầu, 7%/năm trong 3 năm cuối khi giảm tài sản biến động mạnh

</details>

## Chặng 2 · Hiểu quỹ (C)

*Quỹ là gì · Tiền tệ · Trái phiếu · Cổ phiếu · Chỉ số & ETF · Chủ động vs thụ động · Cân bằng*

Hỗ trợ chặng Hiểu mình. Sau khi biết khẩu vị và mục tiêu, nhà đầu tư học loại quỹ nào làm việc gì.

### C1 · Quỹ đầu tư 101

Nền tảng chung cho mọi loại quỹ: sở hữu gì, giá tính thế nào, ai bảo vệ tiền. Linh vật: `study`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C1.1** Góp chung, chuyên gia quản lý ✅ | Giải thích quỹ mở và chứng chỉ quỹ bằng lời của mình. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 134 |
| **C1.2** NAV và NAV/CCQ | Tính NAV/CCQ và số CCQ mua được. | Thẻ kiến thức, Tính nhanh | FAQ 6, 19 |
| **C1.3** NAV cao không có nghĩa là đắt | Tránh so sánh quỹ bằng NAV/CCQ. | Tìm lỗi sai, Câu hỏi nhanh | FAQ 16 |
| **C1.4** Lợi nhuận đến từ đâu | Kể ra các nguồn lợi nhuận ở cấp quỹ và cấp nhà đầu tư. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 8 |
| **C1.5** Năm loại rủi ro | Ghép mỗi loại rủi ro với ví dụ. | Câu hỏi nhanh | FAQ 9 |
| **C1.6** Ai bảo vệ tiền của bạn ✅ | Nêu vai trò ngân hàng giám sát, kiểm toán, UBCKNN, ban đại diện quỹ, và giới hạn của chúng. | Thẻ kiến thức, Câu hỏi nhanh, Tình huống | W5 Bài 2 · Quỹ chỉ số · FAQ 4, 103 |
| **C1.7** Quỹ mở, ETF hay tự mua cổ phiếu | So sánh ba cách tham gia thị trường theo chi phí, thời gian, rủi ro lựa chọn, minh bạch. | Câu hỏi nhanh, Thẻ kiến thức | W5 Bài 2 · Quỹ chỉ số · FAQ 30 |
| **C1.8** Kiểm tra: Quỹ 101 | Ôn lại cả phần. | Kiểm tra | W5 Bài 2 · Quỹ chỉ số · FAQ 9, 134 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C1.1**: CCQ xác nhận quyền sở hữu một phần vốn góp; nhà đầu tư không trực tiếp đứng tên từng cổ phiếu, trái phiếu
- **C1.2**: NAV = tổng tài sản − nghĩa vụ phải trả; NAV/CCQ = NAV ÷ số CCQ lưu hành; Quỹ mở phát hành thêm khi có lệnh mua, mua lại khi có lệnh bán; phát hành theo NAV không làm giảm NAV/CCQ của người cũ
- **C1.3**: NAV/CCQ khác nhau do thời điểm thành lập, lịch sử và phân phối; so sánh tổng lợi nhuận cùng kỳ và mức rủi ro
- **C1.4**: Cấp quỹ: thay đổi giá tài sản, cổ tức, lãi trái phiếu, sau chi phí; Cấp nhà đầu tư: thay đổi giá trị CCQ + phân phối thực nhận, sau phí và thuế
- **C1.5**: Rủi ro thị trường, lãi suất, tín dụng, thanh khoản, quyết định đầu tư; đa dạng hóa giúp quản trị nhưng không loại bỏ
- **C1.6**: Ngân hàng giám sát lưu ký tài sản, giám sát giao dịch, xác nhận NAV; báo cáo năm được kiểm toán độc lập; Tài sản quỹ tách biệt với tài sản công ty quản lý quỹ; Các cơ chế này không bảo đảm vốn hay lợi nhuận
- **C1.7**: ETF mua bán trên sàn theo giá thị trường trong ngày; quỹ mở giao dịch theo NAV của kỳ giao dịch; Quỹ mở không biết trước giá khớp khi đặt lệnh

</details>

### C2 · Quỹ thị trường tiền tệ

Lớp đệm thanh khoản: nơi cho tiền dự phòng và tiền chờ giải ngân. Linh vật: `save`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C2.1** Khi tiền mặt cũng sinh lời ✅ | Nêu MMF đầu tư vào đâu và mục tiêu của nó. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 1 · Quỹ thị trường tiền tệ |
| **C2.2** MMF hay tiền gửi kỳ hạn ngắn | So sánh rủi ro vốn, thanh khoản và lợi suất của hai lựa chọn. | Câu hỏi nhanh, Tìm lỗi sai | W5 Bài 1 · Quỹ thị trường tiền tệ |
| **C2.3** Khi nào dùng, khi nào không | Xếp các khoản tiền vào đúng chỗ: MMF hay tài sản tăng trưởng. | Câu hỏi nhanh, Tình huống | W5 Bài 1 · Quỹ thị trường tiền tệ · Nếu mất việc hôm nay, bạn có bao nhiêu quyền lựa chọn? |
| **C2.4** MMF tại Việt Nam | Hiểu sản phẩm tương đương trong nước và cách đánh giá đúng thước đo. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 1 · Quỹ thị trường tiền tệ |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C2.1**: Công cụ nợ ngắn hạn chất lượng cao, kỳ hạn bình quân thường dưới 90 ngày: tín phiếu Kho bạc, chứng chỉ tiền gửi, thương phiếu; Mục tiêu: bảo toàn vốn, thanh khoản cao, lợi suất ổn định; không phải công cụ tăng trưởng dài hạn
- **C2.2**: MMF không được bảo hiểm tiền gửi; Rút vốn linh hoạt, thanh toán thường T+2 đến T+4, không tức thời như tài khoản ngân hàng; Lợi suất biến động theo lãi suất ngắn hạn; sau phí có thể bằng hoặc thấp hơn tiền gửi
- **C2.3**: Hợp: quỹ khẩn cấp, tiền chờ giải ngân, chi tiêu lớn trong 6–12 tháng; Không hợp: tăng trưởng dài hạn, đánh bại lạm phát nhiều năm
- **C2.4**: Sản phẩm tương đương chủ yếu là quỹ trái phiếu ngắn hạn hoặc quỹ tập trung vào công cụ tiền tệ; Ví dụ DCIP: chỉ số tham chiếu là lãi suất tiền gửi 3 tháng bình quân của Agribank, VietinBank, Vietcombank, BIDV; "Quỹ thị trường tiền tệ không giúp danh mục sinh lời nhanh hơn mà giúp nhà đầu tư ra quyết định tốt hơn"

</details>

### C3 · Quỹ trái phiếu

Bộ giảm chấn của danh mục, nhưng không tuyệt đối an toàn. Linh vật: `analyze`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C3.1** Ba nguồn lợi nhuận của quỹ trái phiếu | Phân biệt lãi coupon, lãi/lỗ giá và giá trị từ quản lý danh mục. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 4 · Quỹ trái phiếu nâng cao |
| **C3.2** Bập bênh lãi suất và giá ✅ | Dự đoán NAV quỹ trái phiếu khi lãi suất tăng hoặc giảm. *Công cụ: Bập bênh lãi suất – giá trái phiếu.* | Mô phỏng, Câu hỏi nhanh | W5 Bài 4 · Quỹ trái phiếu nâng cao |
| **C3.3** Duration: độ nhạy lãi suất | So sánh hai quỹ có duration khác nhau. *Công cụ: Bập bênh lãi suất – giá trái phiếu.* | Thẻ kiến thức, Mô phỏng | W5 Bài 4 · Quỹ trái phiếu nâng cao |
| **C3.4** Coupon cao chưa chắc lời cao | Phân biệt coupon và yield. | Tìm lỗi sai, Câu hỏi nhanh | W5 Bài 4 · Quỹ trái phiếu nâng cao |
| **C3.5** Rủi ro tín dụng và đa dạng hóa | So sánh quỹ trái phiếu với trái phiếu doanh nghiệp riêng lẻ và tiết kiệm dài hạn. | Câu hỏi nhanh, Tình huống | W5 Bài 4 · Quỹ trái phiếu nâng cao |
| **C3.6** Dùng quỹ trái phiếu đúng vai | Chọn tình huống phù hợp và không phù hợp cho quỹ trái phiếu. | Tình huống, Câu hỏi nhanh | W5 Bài 4 · Quỹ trái phiếu nâng cao · Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) |
| **C3.7** Nâng cao: giá sạch và lãi dồn tích | Hiểu vì sao giá đầy đủ = giá sạch + lãi dồn tích (bài tùy chọn). | Thẻ kiến thức | FAQ 117 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C3.1**: Quỹ trái phiếu định giá theo thị trường (mark-to-market): biến động lãi suất và tín dụng vào NAV ngay
- **C3.2**: Lãi suất tăng → giá trái phiếu giảm → NAV giảm ngắn hạn; đây là rủi ro lớn nhất
- **C3.3**: Danh mục nhiều trái phiếu duration dài thì NAV càng bị ảnh hưởng bởi lãi suất
- **C3.4**: Coupon cố định khi phát hành; yield phụ thuộc giá mua, coupon và lãi/lỗ vốn
- **C3.5**: Trái phiếu riêng lẻ: phụ thuộc doanh nghiệp, vốn tối thiểu thường 100 triệu – 1 tỷ, thanh khoản thấp; Quỹ trái phiếu: đa dạng hóa, vốn từ vài chục nghìn đồng, thanh khoản T+2 đến T+4
- **C3.6**: Hợp: lớp lõi thu nhập cố định, chờ giải ngân, tái cơ cấu sau biến động; Không hợp: bảo toàn vốn tuyệt đối ngắn hạn; kỳ vọng lợi nhuận cao mà không chấp nhận biến động; DCBF (2013) dùng lãi suất tiền gửi 12 tháng của 4 ngân hàng làm chỉ số tham chiếu

</details>

### C4 · Quỹ cổ phiếu

Động cơ tăng trưởng dài hạn, đi kèm biến động lớn. Linh vật: `fight`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C4.1** Tăng trưởng và biến động ✅ | Hiểu vì sao quỹ cổ phiếu hợp với mục tiêu dài và không hợp với tiền cần sớm. | Thẻ kiến thức, Câu hỏi nhanh | Kế hoạch du học cho con: bài toán tài chính gia đình (anh Nam) · FAQ 1, 123 |
| **C4.2** Quỹ cổ phiếu không trả lãi hằng tháng | Phân biệt cổ tức quỹ với lãi tiền gửi. | Tìm lỗi sai, Câu hỏi nhanh | FAQ 14 |
| **C4.3** Chiến lược năng động và chiến lược cổ tức | Giải thích vì sao hai quỹ cổ phiếu có lúc chênh lệch hiệu suất. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 16, 124 |
| **C4.4** Đánh giá hiệu suất quỹ cổ phiếu | Xem nhiều kỳ, so với chỉ số tham chiếu, xem biến động và giai đoạn giảm. | Tìm lỗi sai, Tính nhanh | FAQ 25, 26, 29 |
| **C4.5** Drawdown: giảm bao nhiêu thì cần tăng bao nhiêu | Tính mức phục hồi cần thiết sau một đợt giảm. *Công cụ: Máy tính hồi phục sau sụt giảm.* | Tính nhanh, Đoán số | W5 Bài 5 · Quỹ cân bằng nâng cao |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C4.1**: Quỹ cổ phiếu có thể giảm giá đáng kể trong ngắn hạn; Quỹ rủi ro hơn không chắc chắn lợi nhuận cao hơn; không nên dùng vốn vay
- **C4.2**: Cổ tức quỹ phụ thuộc kết quả và phương án được duyệt; cần dòng tiền đều thì lập kế hoạch rút tiền
- **C4.3**: Hiệu suất tương đối thay đổi theo chu kỳ; so sánh tổng lợi nhuận đã tính cổ tức, cùng kỳ
- **C4.4**: Không so sánh lợi nhuận 8 tháng năm nay với cả năm trước; Chênh lệch giữa hai tỷ suất diễn đạt bằng điểm phần trăm
- **C4.5**: Giảm 30% cần tăng ~43% để hòa vốn; giảm 12,5% cần ~14%

</details>

### C5 · Quỹ chỉ số và ETF

Cách đơn giản, chi phí thấp để "là một phần của thị trường". Linh vật: `study`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C5.1** Là một phần của thị trường ✅ | Giải thích quỹ chỉ số mô phỏng gì và vì sao chi phí thấp. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 2 · Quỹ chỉ số |
| **C5.2** Benchmark, tracking error, expense ratio | Dùng ba thuật ngữ để chọn giữa hai quỹ cùng chỉ số. | Câu hỏi nhanh, Tìm lỗi sai | W5 Bài 2 · Quỹ chỉ số |
| **C5.3** Quỹ chỉ số mở và ETF | Phân biệt giao dịch theo NAV cuối ngày và theo giá thị trường trong ngày. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 2 · Quỹ chỉ số · FAQ 7 |
| **C5.4** Các chỉ số ở Việt Nam | Ghép chỉ số với nhóm cổ phiếu nó đại diện. | Câu hỏi nhanh | W5 Bài 2 · Quỹ chỉ số |
| **C5.5** Quỹ chỉ số không phòng thủ | Hiểu quỹ chỉ số giảm cùng thị trường và không chuyển sang tiền mặt. | Tình huống, Câu hỏi nhanh | W5 Bài 2 · Quỹ chỉ số |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C5.1**: Mô phỏng VN-Index, VN30, S&P 500…; ba yếu tố: thụ động, đa dạng hóa rộng, chi phí thấp (0,3–0,8%/năm)
- **C5.2**: Cùng theo dõi một chỉ số: ưu tiên quỹ có tracking error và chi phí thấp hơn
- **C5.3**: ETF giá thị trường có thể chênh lệch NAV; thuế TNCN khi bán CCQ ETF 0,1% giá trị giao dịch
- **C5.4**: VN30: 30 doanh nghiệp vốn hóa lớn, thanh khoản cao; VN100/VNX50; VNDiamond: cạn room ngoại; VNFIN Lead: tài chính – ngân hàng; VN Midcap: vốn hóa trung bình
- **C5.5**: VN30 giảm 20% thì quỹ mô phỏng VN30 cũng giảm tương ứng; quỹ chỉ số loại bỏ rủi ro chọn sai cổ phiếu, không loại bỏ rủi ro thị trường

</details>

### C6 · Chủ động và thụ động

Alpha hay Beta: chọn đúng công cụ, hoặc kết hợp cả hai. Linh vật: `analyze`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C6.1** Alpha và Beta | Định nghĩa alpha, beta và triết lý của hai trường phái. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 3 · Quỹ chủ động vs thụ động |
| **C6.2** Phí và lợi thế | So sánh chi phí, tính linh hoạt, minh bạch, rủi ro chính. *Công cụ: Tác động của phí theo thời gian.* | Câu hỏi nhanh, Mô phỏng | W5 Bài 3 · Quỹ chủ động vs thụ động |
| **C6.3** Thị trường Việt Nam có gì khác | Hiểu vì sao quản lý chủ động có dư địa ở thị trường kém hiệu quả. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 3 · Quỹ chủ động vs thụ động |
| **C6.4** Một năm thua chỉ số có sao không? | Đánh giá quỹ chủ động trên khung 3–5 năm. | Tình huống, Ra quyết định | W5 Bài 3 · Quỹ chủ động vs thụ động · FAQ 121 |
| **C6.5** Core – Satellite | Dựng danh mục lõi thụ động + vệ tinh chủ động. *Công cụ: Danh mục thử nghiệm.* | Mô phỏng, Thẻ kiến thức | W5 Bài 3 · Quỹ chủ động vs thụ động · W5 Bài 2 · Quỹ chỉ số |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C6.1**: Thụ động: thị trường khó bị đánh bại dài hạn; chủ động: thị trường có lúc định giá sai
- **C6.2**: Thụ động 0,5–0,8%/năm tại VN; chủ động 1,5–2,5%/năm; Rủi ro chính: thụ động = thị trường; chủ động = nhận định sai của con người
- **C6.3**: Thụ động chiếm hơn 50% tài sản quỹ cổ phiếu toàn cầu; Cuối 10/2025 Việt Nam có 18 ETF (~14% số quỹ) và 69 quỹ mở (~56%)

</details>

### C7 · Quỹ cân bằng

Một lệnh duy nhất, kỷ luật "bán cao, mua thấp" tự động. Linh vật: `trophy`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C7.1** Markowitz và tương quan thấp | Giải thích vì sao kết hợp cổ phiếu và trái phiếu giảm rủi ro tổng thể. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 5 · Quỹ cân bằng nâng cao |
| **C7.2** Ba kịch bản thị trường | Tính kết quả danh mục 100% cổ phiếu và 50/50 trong ba kịch bản. *Công cụ: Danh mục thử nghiệm.* | Tính nhanh, Mô phỏng | W5 Bài 5 · Quỹ cân bằng nâng cao |
| **C7.3** Tái cân bằng ✅ | Thực hiện tái cân bằng khi tỷ trọng trôi khỏi mục tiêu. *Công cụ: Mô phỏng tái cân bằng.* | Mô phỏng, Câu hỏi nhanh | W5 Bài 5 · Quỹ cân bằng nâng cao |
| **C7.4** Tĩnh và động, Sharpe và drawdown | Phân biệt quỹ cân bằng tĩnh/động và đọc Sharpe ratio. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 5 · Quỹ cân bằng nâng cao |
| **C7.5** Quỹ cân bằng hay tự mua 50/50? | Cân nhắc giữa tự kiểm soát tỷ trọng và tái cân bằng tự động. | Tình huống, Ra quyết định | W5 Bài 5 · Quỹ cân bằng nâng cao |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **C7.1**: Lý thuyết danh mục hiện đại (1952): một tài sản biến động cao vẫn giảm rủi ro tổng nếu tương quan thấp
- **C7.2**: Tăng mạnh: +25% vs +14%; đi ngang: +5% vs +5,5%; sụt giảm: −30% vs −12,5%
- **C7.3**: Mục tiêu 50/50, cổ phiếu tăng lên 60% → bán bớt cổ phiếu, mua trái phiếu về 50/50
- **C7.4**: Động: cổ phiếu dao động trong biên độ, ví dụ 40–70%; Sharpe = (lợi nhuận − lãi suất phi rủi ro) / độ biến động
- **C7.5**: Tự mua hai quỹ: phải tự tái cân bằng, có thể tốn phí chuyển đổi; nắm giữ khuyến nghị từ 3 năm

</details>

### C8 · Ghép danh mục

Nối kiến thức về quỹ với kế hoạch đã lập ở chặng Hiểu mình. Linh vật: `celebrate`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **C8.1** Mỗi khoản tiền một công cụ ✅ | Ghép từng mục tiêu trong hồ sơ với loại quỹ phù hợp để tìm hiểu. | Câu hỏi nhanh, Tự đánh giá · cam kết | W5 Bài 1 · Quỹ thị trường tiền tệ · W5 Bài 4 · Quỹ trái phiếu nâng cao · W5 Bài 5 · Quỹ cân bằng nâng cao · Đầu tư thế nào mà không cần đoán từng nhịp thị trường? |
| **C8.2** Danh mục thử nghiệm qua ba kịch bản | Thử danh mục của mình trong thị trường tăng, đi ngang, sụt giảm. *Công cụ: Danh mục thử nghiệm.* | Mô phỏng, Ra quyết định | W5 Bài 5 · Quỹ cân bằng nâng cao · Đầu tư thế nào mà không cần đoán từng nhịp thị trường? |
| **C8.3** Kiểm tra cuối chặng: Hiểu quỹ | Đạt ≥ 80% để nhận chứng nhận "Hiểu quỹ". | Kiểm tra | W5 Bài 1 · Quỹ thị trường tiền tệ · W5 Bài 4 · Quỹ trái phiếu nâng cao · W5 Bài 2 · Quỹ chỉ số · W5 Bài 3 · Quỹ chủ động vs thụ động · W5 Bài 5 · Quỹ cân bằng nâng cao |

## Chặng 3 · Quỹ DC & DragonX (A)

*Sản phẩm · Đặt lệnh · Phí & nắm giữ · Hiệu suất · ETF · Tài khoản · Hạn mức · An toàn · Sở hữu*

Áp dụng: sản phẩm cụ thể của Dragon Capital và cách giao dịch an toàn trên DragonX.

### A1 · Gia đình quỹ Dragon Capital

Ghép mỗi quỹ DC với loại quỹ và mục tiêu đã học. Linh vật: `analyze`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A1.1** Bản đồ sản phẩm DC ✅ | Ghép DCDS, DCDE, DCBF, DCIP, DCBA, ETF với loại tài sản và mục tiêu. | Câu hỏi nhanh, Thẻ kiến thức | FAQ 1, 28, 122 |
| **A1.2** DCDS và DCDE | Phân biệt chiến lược, cổ tức và chỉ số tham chiếu của hai quỹ cổ phiếu. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 16, 124, 115 |
| **A1.3** Cổ tức DCDE | Tính NAV sau ngày chốt quyền và đọc thông báo phân phối. | Tính nhanh, Câu hỏi nhanh | FAQ 104, 106, 133 |
| **A1.4** DCBF và DCIP | Hiểu hai quỹ thu nhập cố định, chỉ số tham chiếu và lịch NAV. | Thẻ kiến thức, Câu hỏi nhanh | W5 Bài 4 · Quỹ trái phiếu nâng cao · W5 Bài 1 · Quỹ thị trường tiền tệ · FAQ 113 |
| **A1.5** DCBA: quỹ cân bằng của DC | Biết DCBA hợp với ai và khác DCDS thế nào cho một mục tiêu dài hạn. | Thẻ kiến thức, Tình huống | Kế hoạch du học cho con nên bắt đầu từ đâu? · FAQ 34 |
| **A1.6** Đọc báo cáo quỹ | Tìm top khoản đầu tư, tỷ trọng ngành, phân bổ tài sản và ngày chốt số liệu. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 15, 118 |
| **A1.7** Đã mua theo giới thiệu, giờ muốn xem lại | Rà soát lại khoản đã mua theo mục tiêu, và so sánh công ty quản lý quỹ đúng tiêu chí. | Tình huống, Tự đánh giá · cam kết | FAQ 28, 95 |
| **A1.8** Kiểm tra: Gia đình quỹ DC | Ôn lại cả phần. | Kiểm tra | FAQ 1, 16, 34 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A1.1**: DCBF, DCIP: chủ yếu thu nhập cố định, biến động thấp hơn; DCDS, DCDE: tăng trưởng dài hạn; DCBA: kết hợp; Không quỹ nào bảo đảm đồng thời an toàn vốn và lợi nhuận cao
- **A1.2**: DCDS: năng động, tăng trưởng vốn dài hạn; DCDE: doanh nghiệp nền tảng tốt, trả cổ tức; DCDS không mặc nhiên luôn lời hơn hay rủi ro hơn DCDE
- **A1.3**: Phân phối 1.300 đ/CCQ, các yếu tố khác không đổi → NAV/CCQ giảm tương ứng 1.300 đ; không phải lỗ đầu tư; Mức và lịch chi trả theo phương án được duyệt từng đợt; DCDE đã có các đợt phân phối tiền mặt
- **A1.4**: DCBF tham chiếu lãi suất 12 tháng, DCIP tham chiếu lãi suất 3 tháng của 4 ngân hàng; Kiểm tra ngày NAV đang hiển thị trước khi kết luận dữ liệu sai
- **A1.5**: Còn nhiều thời gian, chịu biến động → có thể cân nhắc DCDS; muốn cân bằng hơn → DCBA; gần mục tiêu → chuyển dần sang bảo toàn
- **A1.6**: Báo cáo phản ánh danh mục tại thời điểm báo cáo, có thể khác danh mục hiện tại
- **A1.7**: So sánh theo chiến lược, rủi ro, hiệu suất cùng kỳ, phí, minh bạch, chất lượng phục vụ; không theo quy mô hay một năm lời cao

</details>

### A2 · Đặt lệnh và dòng tiền

Hiểu quy trình để không lo lắng, không chuyển tiền hai lần. Linh vật: `save`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A2.1** Vòng đời một lệnh mua | Sắp xếp các bước: đặt lệnh → chuyển tiền → đối soát → kỳ giao dịch → NAV → CCQ về tài khoản. *Công cụ: Vòng đời một lệnh quỹ mở.* | Mô phỏng, Câu hỏi nhanh | FAQ 5, 108, 44 |
| **A2.2** Đặt lệnh khi chưa biết giá ✅ | Quyết định mua/bán dựa trên kế hoạch, không dựa vào giá tạm tính. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 12, 30 |
| **A2.3** Chuyển tiền đúng cách | Kiểm tra tên thụ hưởng, tài khoản, số tiền, nội dung; biết quy định tài khoản chuyển tiền khác. | Tình huống, Tìm lỗi sai | FAQ 5, 52 |
| **A2.4** Hồ sơ: Đã chuyển tiền mà chưa thấy CCQ ✅ | Xử lý đúng ba tình huống: chưa thấy CCQ, chưa xác nhận nhận tiền, chưa có thông báo. | Hồ sơ hỗ trợ | FAQ 43, 44, 45, 49 |
| **A2.5** Hồ sơ: Payoo, hủy lệnh và chuyển nhầm quỹ | Biết tiền đi đâu khi chuyển trước, hủy lệnh hoặc chuyển nhầm. | Hồ sơ hỗ trợ | FAQ 50, 54, 128 |
| **A2.6** Hồ sơ: Ứng dụng báo lỗi khi đặt lệnh | Kiểm tra lịch sử lệnh trước khi thử lại. | Hồ sơ hỗ trợ | FAQ 88 |
| **A2.7** Bán và nhận tiền | Biết khi nào tiền về, vì sao lệnh bán bị hủy, tiền về tài khoản nào. | Hồ sơ hỗ trợ, Câu hỏi nhanh | FAQ 46, 47, 111 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A2.1**: Lệnh hoặc tiền đến sau hạn tiếp nhận có thể chuyển sang kỳ sau; Chuyển tiền thành công chưa có nghĩa lệnh đã được thực hiện
- **A2.3**: Không chuyển tiền mua quỹ vào tài khoản cá nhân của người tư vấn
- **A2.4**: Không đặt lại lệnh hoặc chuyển thêm tiền chỉ vì trạng thái chưa đổi; Gửi mã lệnh, tên quỹ, thời điểm và chứng từ qua kênh chính thức
- **A2.5**: Hủy lệnh không có nghĩa tiền được hoàn ngay; Tiền chuyển cho DCBF không tự trở thành tiền mua DCDS
- **A2.6**: Không lặp lại lệnh hoặc chuyển tiền nhiều lần trước khi xác định trạng thái
- **A2.7**: Thời gian chờ tính từ ngày giao dịch hợp lệ, không nhất thiết từ ngày đặt lệnh; Không bắt buộc mở tài khoản tại ngân hàng giám sát

</details>

### A3 · Phí, thuế và thời gian nắm giữ

Biết chính xác mình trả gì và vì sao tiền bán khác tiền tạm tính. Linh vật: `save`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A3.1** Phí nào đã nằm trong NAV | Phân biệt phí quản lý (trong NAV) với phí giao dịch và thuế. | Thẻ kiến thức, Tìm lỗi sai | FAQ 125 |
| **A3.2** Tuổi của từng lô CCQ | Áp dụng FIFO để biết lô nào được bán trước và chịu phí nào. | Tình huống, Tính nhanh | FAQ 10, 42 |
| **A3.3** Bán thì bị khấu trừ những gì | Tính tiền thực nhận từ số CCQ, NAV áp dụng, phí bán và thuế (số liệu minh họa). | Tính nhanh, Hồ sơ hỗ trợ | FAQ 127, 33, 48 |
| **A3.4** Chuyển đổi giữa các quỹ | Hiểu chuyển đổi = bán quỹ nguồn + mua quỹ đích, có thể có phí và thuế. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 53 |
| **A3.5** Mã giới thiệu có ưu đãi gì? | Không mặc định mã giới thiệu nào cũng có ưu đãi. | Câu hỏi nhanh | FAQ 131 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A3.2**: Thời gian nắm giữ tính riêng từng lần mua; bán một phần không làm lần mua mới hưởng tuổi lô cũ
- **A3.3**: Biểu phí và thuế lấy từ bảng thông tin quỹ có ngày hiệu lực, không dùng tài liệu cũ

</details>

### A4 · Hiệu suất và báo cáo trên DragonX

Đọc đúng con số lợi nhuận của chính mình. Linh vật: `analyze`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A4.1** Lợi nhuận kỳ, CAGR và XIRR ✅ | Tính lợi nhuận một khoản đầu tư, tăng trưởng kép và biết khi nào cần XIRR. | Tính nhanh | FAQ 31 |
| **A4.2** Ba con số lợi nhuận trên DragonX | Phân biệt lợi nhuận đang nắm giữ, đã thực hiện và tổng lợi nhuận có phân phối. | Thẻ kiến thức, Tính nhanh | FAQ 32 |
| **A4.3** Tài liệu chính thức và giấy xác nhận | Biết xin báo cáo, giấy xác nhận sở hữu (ví dụ cho hồ sơ visa) và lịch sử NAV ở đâu. | Hồ sơ hỗ trợ | FAQ 27, 112, 82 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A4.1**: Lợi nhuận kỳ = (cuối kỳ + phân phối − đầu kỳ) / đầu kỳ; CAGR = (cuối/đầu)^(1/số năm) − 1; Nhiều lần mua bán → dùng XIRR

</details>

### A5 · ETF trên DragonX

ETF giao dịch khác quỹ mở; biết điểm khác để tránh nhầm. Linh vật: `study`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A5.1** Hồ sơ: Chưa thấy ETF trên DragonX | Kiểm tra phiên bản ứng dụng và điều kiện kích hoạt tài khoản ETF. | Hồ sơ hỗ trợ | FAQ 11 |
| **A5.2** Cổ tức trong ETF ảnh hưởng NAV thế nào | Không kết luận cổ tức làm NAV tăng thêm tương ứng. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 35 |
| **A5.3** Hoán đổi ETF là gì | Phân biệt giao dịch hoán đổi lô lớn với mua ETF trên sàn. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 36, 135 |

### A6 · Tài khoản và định danh

Giữ hồ sơ đúng để giao dịch không bị gián đoạn. Linh vật: `explore`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A6.1** Mở tài khoản | Biết các cách mở tài khoản, vì sao hồ sơ chưa duyệt, ai được dùng chung số điện thoại. | Hồ sơ hỗ trợ, Câu hỏi nhanh | FAQ 63, 114, 132, 105 |
| **A6.2** Hồ sơ: Cập nhật căn cước | Xử lý các lỗi thường gặp khi cập nhật căn cước. | Hồ sơ hỗ trợ | FAQ 55, 56, 57, 58, 62, 69 |
| **A6.3** Hồ sơ: Thay đổi thông tin cá nhân | Hiểu vì sao cần chụp giấy tờ và khuôn mặt, và xử lý khi bị từ chối. | Hồ sơ hỗ trợ | FAQ 59, 60, 67, 70, 71, 72, 81 |
| **A6.4** Tài khoản nhận tiền, số dư ở nhiều kênh | Biết đổi tài khoản thụ hưởng, gộp số dư, cập nhật khi ở nước ngoài, tài khoản phụ thuộc. | Hồ sơ hỗ trợ, Câu hỏi nhanh | FAQ 68, 119, 93, 94 |
| **A6.5** Đóng tài khoản | Biết các bước và vì sao có thể cần hồ sơ giấy. | Hồ sơ hỗ trợ | FAQ 61, 126 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A6.1**: Mua quỹ qua ngân hàng đối tác không biến quỹ thành tiền gửi được bảo đảm
- **A6.2**: Cập nhật ở MoMo/CAKE không tự cập nhật tài khoản quỹ; Không gửi ảnh giấy tờ lên kênh công khai
- **A6.3**: Không xác nhận hồ sơ có thông tin sai; không cung cấp PIN/OTP cho người hỗ trợ

</details>

### A7 · Hạn mức và xác minh

Tránh lệnh bị từ chối vì vượt hạn mức. Linh vật: `study`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A7.1** Hạn mức là gì | Kiểm tra hạn mức trước khi đặt lệnh lớn. | Thẻ kiến thức, Hồ sơ hỗ trợ | FAQ 110, 76 |
| **A7.2** Hồ sơ: Nâng hạn mức | Đi hết quy trình email → đường dẫn → cuộc gọi video, và xử lý khi hết hạn hoặc không kết nối được. | Hồ sơ hỗ trợ | FAQ 74, 75, 77, 78 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A7.1**: Không mặc định mọi tài khoản có cùng hạn mức; hoàn thành cuộc gọi xác minh chưa chắc hạn mức cập nhật ngay
- **A7.2**: Chỉ mở đường dẫn từ nguồn đã xác nhận; không dùng đường dẫn người khác chuyển tiếp

</details>

### A8 · An toàn tài khoản

Kẻ gian nhắm vào nhà đầu tư; phản xạ đúng bảo vệ tài sản. Linh vật: `fight`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A8.1** PIN và OTP ✅ | Xử lý quên PIN, OTP lạ và nguyên tắc không chia sẻ. | Câu hỏi nhanh, Hồ sơ hỗ trợ | FAQ 80, 90, 92 |
| **A8.2** Cuộc gọi và đường dẫn giả mạo | Nhận diện cuộc gọi giả danh và xử lý khi lỡ nhấn đường dẫn lạ. | Tình huống, Luyện cùng AI | FAQ 116, 120 |
| **A8.3** Mất điện thoại và đăng nhập | Bảo vệ tài khoản khi mất máy; hiểu yêu cầu đăng nhập lại hoặc cài lại Face ID. | Hồ sơ hỗ trợ | FAQ 85, 89, 91, 79 |
| **A8.4** Kênh chính thức và tiện ích DragonX | Biết DragonLib, hiển thị thời hạn đầu tư, mã QR thanh toán DCIP, kênh liên hệ chính thức. | Câu hỏi nhanh | FAQ 83, 84, 86, 99 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A8.2**: Tên hiển thị không đủ để xác nhận; gọi lại số chính thức; Nhân viên không cần PIN/OTP; không chuyển tiền vào tài khoản cá nhân hay cài ứng dụng lạ

</details>

### A9 · Sở hữu, ủy quyền và thừa kế

Chuẩn bị cho những việc lớn của gia đình. Linh vật: `save`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A9.1** Ủy quyền không phải chuyển quyền sở hữu | Phân biệt ủy quyền giao dịch, chuyển sở hữu và sắp xếp thừa kế. | Thẻ kiến thức, Tình huống | FAQ 64, 73 |
| **A9.2** Thừa kế và tặng CCQ | Biết thủ tục khi nhà đầu tư qua đời và khi tặng CCQ, kể cả nghĩa vụ thuế. | Hồ sơ hỗ trợ | FAQ 65, 66 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A9.2**: Không mặc định thuế tặng bằng 10% toàn bộ giá trị

</details>

### A10 · Dragon Capital và quyền của nhà đầu tư

Biết công ty quản lý tiền của mình và tiếng nói của nhà đầu tư. Linh vật: `trophy`.

| Bài | Mục tiêu | Dạng | Nguồn |
|---|---|---|---|
| **A10.1** Dragon Capital là ai | Biết Dragon Capital Việt Nam thuộc đơn vị nào và công ty mẹ ở đâu. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 97, 98 |
| **A10.2** Đại hội nhà đầu tư và ban đại diện quỹ | Biết quyền tham dự đại hội và vai trò ban đại diện. | Thẻ kiến thức, Câu hỏi nhanh | FAQ 107, 103 |
| **A10.3** Liên hệ và chăm sóc | Biết cách liên hệ đúng kênh và chuẩn bị thông tin khi cần hỗ trợ. | Hồ sơ hỗ trợ | FAQ 99, 100 |
| **A10.4** Kiểm tra cuối chặng: Quỹ DC & DragonX | Đạt ≥ 80% để nhận chứng nhận "Nhà đầu tư DC hiểu biết". | Kiểm tra | FAQ 10, 44, 116, 125 |

<details><summary>Số liệu và ý chính cần dạy</summary>

- **A10.3**: Gửi mã yêu cầu/mã lệnh, mô tả sự cố, thời điểm; không bao giờ gửi PIN, OTP, mật khẩu

</details>

Câu hỏi FAQ chỉ trả lời qua Hỏi Rồng (không làm bài): 51, 96, 101, 102, 109.

## Tình huống luyện AI

| Tình huống | AI đóng vai | Mở khóa sau | Chế độ |
|---|---|---|---|
| Vợ/chồng muốn bán hết khi thị trường giảm | Người bạn đời, lo lắng sau khi tài khoản giảm 20% trong 3 tháng | B5.6 | Nhà đầu tư |
| Hàng xóm khoe lãi vàng | Anh hàng xóm vừa lời đậm từ vàng, rủ dồn hết tiền vào vàng | B6.3 | Nhà đầu tư |
| Cuộc gọi tự xưng nhân viên Dragon Capital | Kẻ gian giả danh chăm sóc khách hàng, giọng gấp gáp | A8.2 | Nhà đầu tư |
| Người môi giới hứa lãi 20%/năm | Người tự xưng chuyên gia trên mạng xã hội | B2.5 | Nhà đầu tư |
| Thưởng Tết 50 triệu | Chính bạn của tháng Hai: muốn tiêu, muốn gửi, muốn đầu tư | B1.2 | Nhà đầu tư |
| Bố mẹ định bán đất lo cho cháu du học | Ông bà, tin rằng mảnh đất là đủ cho cháu đi học | B3.6 | Nhà đầu tư |
| Đồng nghiệp: "Sell in May đi!" | Đồng nghiệp đọc diễn đàn chứng khoán | B6.5 | Nhà đầu tư |
| Lãi tiết kiệm 9%, sao phải đầu tư quỹ? | Người thân lớn tuổi, quen gửi tiết kiệm | B6.4 | Nhà đầu tư |
| "55 tuổi rồi, đầu tư còn kịp không?" | Chú 55 tuổi, chưa từng đầu tư | B3.8 | Nhà đầu tư |
| Sắp nghỉ việc, có nên rút hết quỹ? | Chính bạn, vừa biết công ty tái cơ cấu | B1.3 | Nhà đầu tư |
| Quỹ của tôi thua quỹ khác năm nay | Bạn thân khoe quỹ của họ lời hơn | C6.4 | Nhà đầu tư |
| Chuyển tiền rồi mà chưa thấy CCQ | Chính bạn, sốt ruột sau khi chuyển tiền | A2.4 | Nhà đầu tư |
| Kể cho Rồng nghe mục tiêu của bạn | Rồng DC đóng vai người phỏng vấn kế hoạch | B3.1 | Nhà đầu tư |
| Chế độ chuyên viên: chị Lan lo thị trường giảm | Chị Lan, 45 tuổi, giữ quỹ cổ phiếu 8 tháng, đang lỗ nhẹ | A3.2 | Chuyên viên |

Chi tiết lời mở đầu, tiêu chí chấm và cờ đỏ: `content/outline/ai-scenarios.ts`. Thiết kế tính năng: `docs/FEATURES.md`.

## Bản đồ 133 câu hỏi FAQ

| FAQ | Bài |
|---|---|
| 1 | C4.1, A1.1, A1.8 |
| 2 | B5.3 |
| 3 | B5.3 |
| 4 | C1.6 |
| 5 | A2.1, A2.3 |
| 6 | C1.2 |
| 7 | B5.8, C5.3 |
| 8 | C1.4 |
| 9 | B2.1, C1.5, C1.8 |
| 10 | A3.2, A10.4 |
| 11 | A5.1 |
| 12 | A2.2 |
| 13 | B3.10, B5.3, B7.5 |
| 14 | C4.2 |
| 15 | A1.6 |
| 16 | C1.3, C4.3, A1.2, A1.8 |
| 18 | B5.3 |
| 19 | C1.2 |
| 21 | B3.9 |
| 22 | B3.7, B3.10 |
| 23 | B2.1 |
| 24 | B6.7 |
| 25 | C4.4 |
| 26 | C4.4 |
| 27 | A4.3 |
| 28 | A1.1, A1.7 |
| 29 | C4.4 |
| 30 | C1.7, A2.2 |
| 31 | A4.1 |
| 32 | A4.2 |
| 33 | A3.3 |
| 34 | A1.5, A1.8 |
| 35 | A5.2 |
| 36 | A5.3 |
| 37 | B6.6 |
| 38 | B4.1, B4.9 |
| 39 | B4.8 |
| 40 | B4.8 |
| 41 | B3.8 |
| 42 | A3.2 |
| 43 | A2.4 |
| 44 | A2.1, A2.4, A10.4 |
| 45 | A2.4 |
| 46 | A2.7 |
| 47 | A2.7 |
| 48 | A3.3 |
| 49 | A2.4 |
| 50 | A2.5 |
| 51 | Hỏi Rồng |
| 52 | A2.3 |
| 53 | A3.4 |
| 54 | A2.5 |
| 55 | A6.2 |
| 56 | A6.2 |
| 57 | A6.2 |
| 58 | A6.2 |
| 59 | A6.3 |
| 60 | A6.3 |
| 61 | A6.5 |
| 62 | A6.2 |
| 63 | A6.1 |
| 64 | A9.1 |
| 65 | A9.2 |
| 66 | A9.2 |
| 67 | A6.3 |
| 68 | A6.4 |
| 69 | A6.2 |
| 70 | A6.3 |
| 71 | A6.3 |
| 72 | A6.3 |
| 73 | A9.1 |
| 74 | A7.2 |
| 75 | A7.2 |
| 76 | A7.1 |
| 77 | A7.2 |
| 78 | A7.2 |
| 79 | A8.3 |
| 80 | A8.1 |
| 81 | A6.3 |
| 82 | A4.3 |
| 83 | A8.4 |
| 84 | A8.4 |
| 85 | A8.3 |
| 86 | A8.4 |
| 87 | B6.6 |
| 88 | A2.6 |
| 89 | A8.3 |
| 90 | A8.1 |
| 91 | A8.3 |
| 92 | A8.1 |
| 93 | A6.4 |
| 94 | A6.4 |
| 95 | A1.7 |
| 96 | Hỏi Rồng |
| 97 | A10.1 |
| 98 | A10.1 |
| 99 | A8.4, A10.3 |
| 100 | A10.3 |
| 101 | Hỏi Rồng |
| 102 | Hỏi Rồng |
| 103 | C1.6, A10.2 |
| 104 | A1.3 |
| 105 | A6.1 |
| 106 | A1.3 |
| 107 | A10.2 |
| 108 | A2.1 |
| 109 | Hỏi Rồng |
| 110 | A7.1 |
| 111 | A2.7 |
| 112 | A4.3 |
| 113 | A1.4 |
| 114 | A6.1 |
| 115 | A1.2 |
| 116 | A8.2, A10.4 |
| 117 | C3.7 |
| 118 | A1.6 |
| 119 | A6.4 |
| 120 | A8.2 |
| 121 | B6.7, C6.4 |
| 122 | A1.1 |
| 123 | B2.2, C4.1 |
| 124 | C4.3, A1.2 |
| 125 | B4.7, A3.1, A10.4 |
| 126 | A6.5 |
| 127 | A3.3 |
| 128 | A2.5 |
| 129 | B5.8 |
| 130 | B3.8 |
| 131 | A3.5 |
| 132 | A6.1 |
| 133 | A1.3 |
| 134 | C1.1, C1.8 |
| 135 | A5.3 |

## Hướng dẫn viết bài

1. Chọn một bài trong dàn ý chưa có ✅. Viết vào `content/segments/<chặng>.ts`, dùng id mới dạng kebab-case.
2. Mỗi bài 3–6 câu, khoảng 3 phút; mở đầu bằng thẻ kiến thức hoặc câu chuyện khi giới thiệu khái niệm mới; chọn tư thế linh vật theo ý nghĩa.
3. Dạy đúng các số liệu trong mục "Số liệu và ý chính" và trích nguồn `source: { sourceId, locator }` cho mọi câu có chấm điểm.
4. Dùng `numeric` cho mọi công thức (kèm gợi ý công thức), `scenario` cho tình huống thật (FIFO, lừa đảo, mua khi giảm).
5. Không hứa hay ngụ ý lợi nhuận; mọi lợi nhuận dự phóng ghi rõ "giả định". Không hard-code phí, giờ chốt lệnh hay NAV.
6. Đặt `builtAs` cho bài trong `content/outline/`, chạy `npm run content:check && npm test && npm run docs:curriculum`, rồi mở PR để Compliance duyệt.
