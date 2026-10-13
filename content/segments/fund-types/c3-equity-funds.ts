import type { UnitInput } from "../../schema";

export const unit = {
  id: "c3-equity-funds",
  title: "Phần 4 · Quỹ cổ phiếu",
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
          type: "select",
          pattern: "misconception",
          context: "Anh Sơn định vay thêm 300 triệu để mua quỹ cổ phiếu, vì theo anh \"rủi ro cao thì chắc chắn lợi nhuận cao\".",
          prompt: "Nhận định nào đúng?",
          options: [
            "Rủi ro cao hơn chắc chắn mang lại lợi nhuận cao hơn",
            "Rủi ro cao mở ra cơ hội lợi nhuận cao hơn trong dài hạn, kèm khả năng giảm sâu",
            "Quỹ cổ phiếu có chuyên gia quản lý nên không thể lỗ",
          ],
          answer: 1,
          explain: "Kỳ vọng lợi nhuận cao luôn đi kèm khả năng thua lỗ. Vốn vay có thể buộc bạn bán đúng lúc thị trường giảm, nên chấp nhận rủi ro cao vẫn cần dự phòng và thời gian dài.",
          source: { sourceId: "faq", locator: "Câu 123" },
        },
        {
          id: "c3-drawdown",
          type: "select",
          pattern: "prediction",
          context: "Trong một đợt điều chỉnh mạnh, khoản đầu tư quỹ cổ phiếu của chị Nhi giảm 30%: từ 100 triệu còn 70 triệu.",
          prompt: "Quỹ cần tăng bao nhiêu % để chị về lại 100 triệu?",
          options: ["30%", "Khoảng 43%", "Khoảng 70%"],
          answer: 1,
          explain: "70 triệu phải tăng thêm 30 triệu, tức khoảng 43%. Giảm càng sâu thì đường về càng dốc (giảm 12,5% chỉ cần tăng khoảng 14%), nên kiểm soát mức sụt giảm quan trọng không kém tìm lợi nhuận.",
          source: { sourceId: "w5-balanced" },
        },
        {
          id: "c3-loss-year",
          type: "select",
          pattern: "decision",
          context: "Sau một năm, quỹ cổ phiếu anh Quân đầu tư giảm 15%. Anh dự định giữ khoản tiền này 7 năm nữa cho mục tiêu nghỉ hưu.",
          prompt: "Anh nên đánh giá thế nào trước khi quyết định?",
          options: [
            "Bán ngay, vì quỹ đã giảm một năm thì sẽ giảm tiếp",
            "So với chỉ số tham chiếu cùng kỳ và xem mục tiêu, thời gian của mình có thay đổi không",
            "Vay thêm để mua, vì quỹ chắc chắn sẽ hồi phục",
          ],
          answer: 1,
          explain: "Một năm giảm chưa đủ để kết luận quỹ kém: hãy so cùng kỳ với chỉ số tham chiếu và quỹ cùng loại. Không có bảo đảm phục hồi trong thời hạn cụ thể, nên quyết định cần dựa trên mục tiêu của bạn.",
          source: { sourceId: "faq", locator: "Câu 24" },
        },
      ],
    },
  ],
} satisfies UnitInput;
