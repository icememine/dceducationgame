import type { UnitInput } from "../../schema";

export const unit = {
  id: "a4-reading-performance",
  title: "Phần 4 · Hiệu suất và báo cáo trên DragonX",
  description: "Lợi nhuận kỳ, lợi nhuận kép, so sánh đúng cách",
  color: "violet",
  mascot: "analyze",
  lessons: [
    {
      id: "a4-returns",
      title: "Tính lợi nhuận",
      challenges: [
        {
          id: "a4-period-return",
          type: "select",
          pattern: "prediction",
          context: "Đầu năm, khoản đầu tư DCDE của anh Bảo trị giá 100 triệu. Cuối năm còn 112 triệu, và trong năm anh đã nhận 3 triệu cổ tức tiền mặt.",
          prompt: "Lợi nhuận cả năm của anh là bao nhiêu?",
          options: ["12%, chỉ tính phần giá trị tăng", "15%, gồm cả cổ tức đã nhận", "3%, chỉ tính cổ tức"],
          answer: 1,
          explain: "Tổng lợi nhuận = (giá trị cuối kỳ + tiền đã nhận − giá trị đầu kỳ) ÷ đầu kỳ. Bỏ quên cổ tức sẽ đánh giá thấp quỹ chia cổ tức, vì NAV đã giảm đúng phần tiền chia ra.",
          source: { sourceId: "faq", locator: "Câu 31" },
        },
        {
          id: "a4-double-5y",
          type: "select",
          pattern: "misconception",
          context: "Một người bạn khoe: \"Quỹ của mình 5 năm qua tăng tổng cộng 100%, tức là mỗi năm 20%.\"",
          prompt: "Nhận định nào đúng?",
          options: [
            "Đúng, 100% chia cho 5 năm là 20%/năm",
            "Chưa đúng: nhờ lãi kép, gấp đôi trong 5 năm chỉ cần khoảng 15%/năm",
            "Phải hơn 20%/năm mới gấp đôi được trong 5 năm",
          ],
          answer: 1,
          explain: "Mỗi năm lợi nhuận tính trên số vốn đã lớn lên, nên khoảng 15%/năm trong 5 năm đã gấp đôi. Khi so sánh quỹ, hãy dùng lợi nhuận bình quân năm (kép), không chia đều tổng lợi nhuận.",
          source: { sourceId: "faq", locator: "Câu 21" },
        },
        {
          id: "a4-fixed-return",
          type: "select",
          pattern: "misconception",
          context: "Tài liệu tư vấn dẫn lợi nhuận bình quân 5 năm của DCDS khoảng 24,8%/năm. Anh Định đầu tư 100 triệu và tính sẵn: \"Cuối năm chắc chắn mình có 124,8 triệu.\"",
          prompt: "Anh đang hiểu sai điều gì?",
          options: [
            "Không sai, bình quân 5 năm là mức năm nào cũng đạt",
            "Bình quân là kết quả quá khứ, gồm cả năm tăng mạnh lẫn năm giảm; từng năm có thể khác xa",
            "Lợi nhuận chỉ được trả vào cuối năm thứ 5",
          ],
          answer: 1,
          explain: "Quỹ mở không được cam kết lợi nhuận. Mức bình quân có thể đến từ những năm tăng rất mạnh và những năm âm, nên hãy lập kế hoạch với giả định thận trọng và thời gian đủ dài.",
          source: { sourceId: "library", locator: "NAV, lợi nhuận & cổ tức" },
        },
      ],
    },
  ],
} satisfies UnitInput;
