import type { UnitInput } from "../../schema";

/** Unit ids are historical (progress rows reference lesson ids only). */
export const unit = {
  id: "a2-dc-fund-family",
  title: "Phần 1 · Gia đình quỹ Dragon Capital",
  description: "Mỗi quỹ đầu tư vào đâu, hợp với mục tiêu nào",
  color: "sky",
  mascot: "analyze",
  lessons: [
    {
      id: "a2-meet-the-funds",
      title: "Làm quen các quỹ",
      challenges: [
        {
          id: "a2-fund-match",
          type: "match",
          prompt: "Nối quỹ với danh mục đầu tư",
          left: ["DCDS", "DCDE", "DCBF", "DCIP"],
          right: [
            "Khoảng 40% trái phiếu, 60% tiền gửi",
            "Tối đa 100% cổ phiếu tăng trưởng",
            "Khoảng 65% trái phiếu, 35% tiền gửi",
            "Cổ phiếu doanh nghiệp trả cổ tức đều",
          ],
          pairs: [1, 3, 0, 2],
          explain: "Hai quỹ cổ phiếu hướng đến tăng trưởng dài hạn; hai quỹ trái phiếu ưu tiên ổn định. DCBA kết hợp cả hai nhóm tài sản.",
          source: { sourceId: "library", locator: "Các quỹ mở của DC" },
        },
        {
          id: "a2-idle-cash",
          type: "select",
          pattern: "decision",
          context: "Chị Phương có 50 triệu tiền nhàn rỗi, có thể cần dùng bất cứ lúc nào trong năm, và muốn lợi nhuận tốt hơn gửi không kỳ hạn.",
          prompt: "Quỹ DC nào hợp để chị tìm hiểu trước?",
          options: [
            "DCDS, vì lợi nhuận bình quân quá khứ cao nhất",
            "DCIP: chủ yếu trái phiếu và tiền gửi, giao dịch mỗi ngày, miễn phí bán",
            "DCDE, vì quỹ có chia cổ tức",
          ],
          answer: 1,
          explain: "Tiền có thể cần bất cứ lúc nào nên ưu tiên biến động thấp và rút linh hoạt. DCIP giao dịch mỗi ngày làm việc, tiền bán về ngay trong ngày giao dịch, dù NAV vẫn có thể dao động nhẹ.",
          source: { sourceId: "library", locator: "Chọn quỹ & kế hoạch đầu tư" },
        },
        {
          id: "a2-dividend-nav",
          type: "select",
          pattern: "prediction",
          context: "NAV/CCQ của DCDE đang là 25.000 đồng. Quỹ chia cổ tức tiền mặt 1.300 đồng/CCQ; giả sử thị trường đứng yên.",
          prompt: "Sau ngày chốt quyền, NAV/CCQ là bao nhiêu?",
          options: ["Vẫn 25.000 đồng", "23.700 đồng", "26.300 đồng"],
          answer: 1,
          explain: "Cổ tức được trả từ tài sản quỹ, nên NAV/CCQ giảm đúng 1.300 đồng và khoản này về tài khoản của bạn. Tổng giá trị bạn nắm giữ không đổi: đây không phải lỗ đầu tư.",
          source: { sourceId: "faq", locator: "Câu 106" },
        },
        {
          id: "a2-volatility-order",
          type: "order",
          prompt: "Sắp xếp theo mức biến động thường thấy, từ thấp đến cao",
          items: ["DCBF (trái phiếu)", "DCBA (cân bằng)", "DCDS (cổ phiếu)"],
          explain: "Quỹ thu nhập cố định thường biến động thấp hơn quỹ cổ phiếu; quỹ cân bằng nằm giữa. Không quỹ nào bảo đảm đồng thời an toàn vốn và lợi nhuận cao.",
          source: { sourceId: "faq", locator: "Câu 1" },
        },
      ],
    },
  ],
} satisfies UnitInput;
