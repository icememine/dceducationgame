import type { OutlineUnit } from "./types";

/**
 * Advanced program (Nâng cao): units taken out of the main journey. They are not on the learning
 * path; P writes new content for them later. The drafted bond lessons are parked in
 * content/advanced/bond-funds.ts (validated, not shown to learners).
 * Their FAQ references still count toward the FAQ coverage test.
 */
export const advancedUnits: OutlineUnit[] = [
  {
    code: "NC1",
    title: "Quỹ trái phiếu",
    why: "Bộ giảm chấn của danh mục, nhưng không tuyệt đối an toàn.",
    mascot: "analyze",
    lessons: [
      {
        code: "NC1.1",
        title: "Ba nguồn lợi nhuận của quỹ trái phiếu",
        goal: "Phân biệt lãi coupon, lãi/lỗ giá và giá trị từ quản lý danh mục.",
        formats: ["concept", "quiz"],
        sources: ["w5-bond"],
        facts: ["Quỹ trái phiếu định giá theo thị trường (mark-to-market): biến động lãi suất và tín dụng vào NAV ngay"],
      },
      {
        code: "NC1.2",
        title: "Bập bênh lãi suất và giá",
        goal: "Dự đoán NAV quỹ trái phiếu khi lãi suất tăng hoặc giảm.",
        formats: ["sim", "quiz"],
        sources: ["w5-bond"],
        facts: ["Lãi suất tăng → giá trái phiếu giảm → NAV giảm ngắn hạn; đây là rủi ro lớn nhất"],
        tool: "bond-seesaw",
      },
      {
        code: "NC1.3",
        title: "Duration: độ nhạy lãi suất",
        goal: "So sánh hai quỹ có duration khác nhau.",
        formats: ["concept", "sim"],
        sources: ["w5-bond"],
        facts: ["Danh mục nhiều trái phiếu duration dài thì NAV càng bị ảnh hưởng bởi lãi suất"],
        tool: "bond-seesaw",
      },
      {
        code: "NC1.4",
        title: "Coupon cao chưa chắc lời cao",
        goal: "Phân biệt coupon và yield.",
        formats: ["spot", "quiz"],
        sources: ["w5-bond"],
        facts: ["Coupon cố định khi phát hành; yield phụ thuộc giá mua, coupon và lãi/lỗ vốn"],
      },
      {
        code: "NC1.5",
        title: "Rủi ro tín dụng và đa dạng hóa",
        goal: "So sánh quỹ trái phiếu với trái phiếu doanh nghiệp riêng lẻ và tiết kiệm dài hạn.",
        formats: ["quiz", "scenario"],
        sources: ["w5-bond"],
        facts: [
          "Trái phiếu riêng lẻ: phụ thuộc doanh nghiệp, vốn tối thiểu thường 100 triệu – 1 tỷ, thanh khoản thấp",
          "Quỹ trái phiếu: đa dạng hóa, vốn từ vài chục nghìn đồng, thanh khoản T+2 đến T+4",
        ],
      },
      {
        code: "NC1.6",
        title: "Dùng quỹ trái phiếu đúng vai",
        goal: "Chọn tình huống phù hợp và không phù hợp cho quỹ trái phiếu.",
        formats: ["scenario", "quiz"],
        sources: ["w5-bond", "amdd-study-plan-nam"],
        facts: [
          "Hợp: lớp lõi thu nhập cố định, chờ giải ngân, tái cơ cấu sau biến động",
          "Không hợp: bảo toàn vốn tuyệt đối ngắn hạn; kỳ vọng lợi nhuận cao mà không chấp nhận biến động",
          "DCBF (2013) dùng lãi suất tiền gửi 12 tháng của 4 ngân hàng làm chỉ số tham chiếu",
        ],
      },
      {
        code: "NC1.7",
        title: "Nâng cao: giá sạch và lãi dồn tích",
        goal: "Hiểu vì sao giá đầy đủ = giá sạch + lãi dồn tích (bài tùy chọn).",
        formats: ["concept"],
        sources: ["faq:117"],
      },
    ],
  },
];
