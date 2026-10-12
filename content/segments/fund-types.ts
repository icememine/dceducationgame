import type { SegmentInput } from "../schema";

/**
 * Segment C — Các loại quỹ.
 * Sources: Week 5 articles (MMF, Index fund, Active vs Passive, Bond fund nâng cao,
 * Balanced fund nâng cao). An equity-fund unit has no W5 article yet; it is built from the
 * FAQ until the content team publishes one.
 */
export const fundTypes = {
  id: "fund-types",
  code: "LOẠI",
  title: "Các loại quỹ",
  subtitle: "Tiền tệ · Trái phiếu · Cổ phiếu · Chỉ số · Cân bằng",
  heartsEnabled: true,
  units: [
    {
      id: "c1-money-market",
      title: "Phần 1 · Quỹ thị trường tiền tệ",
      description: "Lớp đệm thanh khoản của danh mục",
      color: "sky",
      mascot: "save",
      lessons: [
        {
          id: "c1-mmf-basics",
          title: "Khi tiền mặt cũng sinh lời",
          challenges: [
            {
              id: "c1-mmf-info",
              type: "info",
              title: "Quỹ thị trường tiền tệ (MMF)",
              body: "Đầu tư vào công cụ nợ ngắn hạn, thanh khoản cao, rủi ro tín dụng thấp. Là một trong những loại hình biến động thấp nhất, đóng vai trò lớp đệm thanh khoản.",
              mascot: "save",
              source: { sourceId: "w5-mmf" },
            },
            {
              id: "c1-mmf-insured",
              type: "true_false",
              prompt: "Quỹ thị trường tiền tệ được bảo hiểm tiền gửi như tiết kiệm ngân hàng.",
              answer: false,
              explain: "Khác với tiền gửi ngân hàng, quỹ thị trường tiền tệ không được bảo hiểm tiền gửi.",
              source: { sourceId: "w5-mmf" },
            },
            {
              id: "c1-mmf-role",
              type: "select",
              prompt: "MMF phù hợp nhất cho khoản tiền nào?",
              options: [
                "Tiền chờ giải ngân hoặc cần dùng trong ngắn hạn",
                "Khoản tích lũy 20 năm cho nghỉ hưu",
                "Khoản muốn tăng trưởng gấp đôi trong 3 năm",
              ],
              answer: 0,
              source: { sourceId: "w5-mmf" },
            },
          ],
        },
      ],
    },
    {
      id: "c2-bond-funds",
      title: "Phần 2 · Quỹ trái phiếu",
      description: "Lãi suất, duration và vai trò giảm chấn",
      color: "jade",
      mascot: "analyze",
      lessons: [
        {
          id: "c2-bond-risk",
          title: "Trái phiếu không tuyệt đối an toàn",
          challenges: [
            {
              id: "c2-coupon-return",
              type: "true_false",
              prompt: "Coupon cao đồng nghĩa với lợi nhuận quỹ cao.",
              answer: false,
              explain: "NAV còn chịu tác động của duration, giá mua trái phiếu và rủi ro tín dụng.",
              source: { sourceId: "w5-bond" },
            },
            {
              id: "c2-duration",
              type: "select",
              prompt: "Lãi suất thị trường tăng. Quỹ nào bị ảnh hưởng NAV nhiều hơn?",
              options: ["Quỹ có duration dài", "Quỹ có duration ngắn", "Như nhau"],
              answer: 0,
              explain: "Duration là độ nhạy của giá trái phiếu với lãi suất. Danh mục nhiều trái phiếu duration dài thì NAV càng bị ảnh hưởng.",
              source: { sourceId: "w5-bond" },
            },
            {
              id: "c2-compare",
              type: "match",
              prompt: "Nối kênh đầu tư với đặc điểm an toàn vốn",
              left: ["Gửi tiết kiệm", "Trái phiếu DN riêng lẻ", "Quỹ mở trái phiếu"],
              right: [
                "Phụ thuộc doanh nghiệp phát hành",
                "Đa dạng hóa nhiều tổ chức phát hành",
                "Cao trong hạn mức bảo hiểm tiền gửi",
              ],
              pairs: [2, 0, 1],
              source: { sourceId: "w5-bond" },
            },
          ],
        },
      ],
    },
    {
      id: "c3-equity-funds",
      title: "Phần 3 · Quỹ cổ phiếu",
      description: "Tăng trưởng dài hạn, chấp nhận biến động",
      color: "coral",
      mascot: "fight",
      lessons: [
        {
          id: "c3-equity-basics",
          title: "Cơ hội và biến động",
          challenges: [
            {
              id: "c3-high-risk-high-return",
              type: "true_false",
              prompt: "Quỹ rủi ro cao hơn chắc chắn mang lại lợi nhuận cao hơn.",
              answer: false,
              explain: "Chấp nhận rủi ro cao vẫn cần năng lực tài chính, khoản dự phòng và thời gian đầu tư. Không nên dùng vốn vay chỉ vì kỳ vọng sinh lời.",
              source: { sourceId: "faq", locator: "Câu 123" },
            },
            {
              id: "c3-loss-year",
              type: "select",
              prompt: "Sau một năm quỹ cổ phiếu giảm mạnh, cách đánh giá hợp lý là…",
              options: [
                "Xem lại mục tiêu, thời gian đầu tư và nhu cầu dùng vốn của mình",
                "Bán ngay vì quỹ chắc chắn sẽ giảm tiếp",
                "Vay thêm để mua vì quỹ chắc chắn sẽ phục hồi",
              ],
              answer: 0,
              source: { sourceId: "faq", locator: "Câu 24" },
            },
          ],
        },
      ],
    },
    {
      id: "c4-index-passive",
      title: "Phần 4 · Quỹ chỉ số & chủ động vs thụ động",
      description: "Alpha, Beta và chi phí",
      color: "violet",
      mascot: "study",
      lessons: [
        {
          id: "c4-index-vs-active",
          title: "Là một phần của thị trường",
          challenges: [
            {
              id: "c4-index-def",
              type: "select",
              prompt: "Quỹ chỉ số được thiết kế để…",
              options: [
                "Mô phỏng hiệu suất một chỉ số như VN30, với chi phí thấp",
                "Đánh bại thị trường bằng cách chọn cổ phiếu",
                "Bảo đảm không lỗ",
              ],
              answer: 0,
              source: { sourceId: "w5-index" },
            },
            {
              id: "c4-active-passive-match",
              type: "match",
              prompt: "Nối loại quỹ với mục tiêu",
              left: ["Quỹ thụ động", "Quỹ chủ động"],
              right: ["Tạo giá trị gia tăng (alpha) qua lựa chọn danh mục", "Tiếp cận tăng trưởng chung (beta) với chi phí thấp"],
              pairs: [1, 0],
              explain: "Kết hợp cả hai trong cùng danh mục thường giúp ổn định dài hạn và linh hoạt theo chu kỳ.",
              source: { sourceId: "w5-active-passive" },
            },
            {
              id: "c4-vn-inefficient",
              type: "true_false",
              prompt: "Quỹ chủ động có dư địa phát huy hơn tại các thị trường kém hiệu quả như Việt Nam.",
              answer: true,
              source: { sourceId: "w5-active-passive" },
            },
          ],
        },
      ],
    },
    {
      id: "c5-balanced",
      title: "Phần 5 · Quỹ cân bằng",
      description: "Tái cân bằng: bán cao, mua thấp tự động",
      color: "gold",
      mascot: "trophy",
      lessons: [
        {
          id: "c5-rebalancing",
          title: "Kỷ luật tái cân bằng",
          challenges: [
            {
              id: "c5-rebalance-scenario",
              type: "select",
              prompt: "Danh mục mục tiêu 60/40 trôi thành 70/30 sau khi cổ phiếu tăng. Tái cân bằng là…",
              options: [
                "Bán bớt cổ phiếu, mua thêm trái phiếu về lại 60/40",
                "Mua thêm cổ phiếu vì đang tăng",
                "Giữ nguyên 70/30",
              ],
              answer: 0,
              explain: "Tái cân bằng thực hiện kỷ luật \"bán cao, mua thấp\" và loại bỏ cảm xúc khỏi quyết định.",
              source: { sourceId: "w5-balanced" },
            },
            {
              id: "c5-markowitz",
              type: "true_false",
              prompt: "Một tài sản biến động cao vẫn có thể làm giảm rủi ro tổng thể nếu tương quan thấp với phần còn lại.",
              answer: true,
              explain: "Đây là ý chính của Lý thuyết danh mục hiện đại (Markowitz, 1952), nền tảng của quỹ cân bằng.",
              source: { sourceId: "w5-balanced" },
            },
          ],
        },
        {
          id: "c5-checkpoint",
          title: "Kiểm tra: các loại quỹ",
          kind: "checkpoint",
          xp: 30,
          minutes: 4,
          challenges: [
            {
              id: "c5-cp-order",
              type: "order",
              prompt: "Sắp xếp theo mức biến động thường thấy, từ thấp đến cao",
              items: ["Quỹ thị trường tiền tệ", "Quỹ trái phiếu", "Quỹ cân bằng", "Quỹ cổ phiếu"],
              source: { sourceId: "w5-balanced" },
            },
            {
              id: "c5-cp-goal-match",
              type: "match",
              prompt: "Nối nhu cầu với loại quỹ phù hợp để tìm hiểu",
              left: ["Tiền chờ giải ngân", "Thu nhập ổn định, ít biến động", "Tích sản trung hạn, không có thời gian theo dõi", "Tăng trưởng dài hạn, chịu được biến động"],
              right: ["Quỹ cân bằng", "Quỹ cổ phiếu", "Quỹ thị trường tiền tệ", "Quỹ trái phiếu"],
              pairs: [2, 3, 0, 1],
              source: { sourceId: "w5-balanced" },
            },
          ],
        },
      ],
    },
  ],
} satisfies SegmentInput;
