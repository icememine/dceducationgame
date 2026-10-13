import type { UnitInput } from "../../schema";

export const unit = {
  id: "c1-money-market",
  title: "Phần 2 · Quỹ thị trường tiền tệ",
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
          body: "Đầu tư vào công cụ nợ ngắn hạn chất lượng cao như tín phiếu Kho bạc, chứng chỉ tiền gửi, kỳ hạn bình quân thường dưới 90 ngày. Mục tiêu là giữ vốn và thanh khoản, không phải tăng trưởng dài hạn.",
          mascot: "save",
          source: { sourceId: "w5-mmf" },
        },
        {
          id: "c1-mmf-insured",
          type: "select",
          pattern: "misconception",
          context: "Anh Bình chuyển 200 triệu từ sổ tiết kiệm sang một quỹ thị trường tiền tệ vì nghe nói quỹ này \"an toàn y như gửi ngân hàng\".",
          prompt: "Điểm khác biệt nào anh cần biết?",
          options: [
            "Quỹ được bảo hiểm tiền gửi giống sổ tiết kiệm",
            "Quỹ không được bảo hiểm tiền gửi và lợi suất thay đổi theo lãi suất ngắn hạn",
            "Quỹ cam kết lợi suất cố định cao hơn tiết kiệm",
          ],
          answer: 1,
          explain: "Quỹ thị trường tiền tệ biến động thấp vì nắm công cụ nợ ngắn hạn chất lượng cao, nhưng nó không phải tiền gửi: không có bảo hiểm tiền gửi và không cam kết lợi suất.",
          source: { sourceId: "w5-mmf" },
        },
        {
          id: "c1-mmf-role",
          type: "select",
          pattern: "decision",
          context: "Chị Linh vừa bán một mảnh đất, có 2 tỷ đồng sẽ dùng để thanh toán tiền mua nhà sau 3 tháng nữa.",
          prompt: "Chị nên để khoản tiền này ở đâu trong lúc chờ?",
          options: [
            "Quỹ cổ phiếu, để kiếm thêm chút lời trong 3 tháng",
            "Công cụ thanh khoản cao, biến động thấp như quỹ thị trường tiền tệ hoặc tiền gửi ngắn hạn",
            "Trái phiếu doanh nghiệp riêng lẻ kỳ hạn 3 năm có coupon cao",
          ],
          answer: 1,
          explain: "Tiền chờ giải ngân cần sẵn sàng đúng hạn hơn là sinh lời cao. Quỹ thị trường tiền tệ không giúp danh mục tăng nhanh hơn, mà giúp bạn có tiền đúng lúc cần.",
          source: { sourceId: "w5-mmf" },
        },
        {
          id: "c1-mmf-liquidity",
          type: "select",
          pattern: "prediction",
          context: "Sáng thứ Hai, anh Đức đặt lệnh bán toàn bộ chứng chỉ quỹ thị trường tiền tệ để trả một hóa đơn phải thanh toán ngay chiều hôm đó.",
          prompt: "Điều gì nhiều khả năng xảy ra?",
          options: [
            "Tiền về tài khoản sau vài phút, như rút ATM",
            "Tiền về sau một đến vài ngày làm việc, theo lịch giao dịch của quỹ",
            "Không bán được vì quỹ khóa vốn tối thiểu 1 năm",
          ],
          answer: 1,
          explain: "Quỹ mở trả tiền bán theo lịch giao dịch, thường từ T+2 đến T+4; quỹ nhanh nhất cũng cần qua phiên giao dịch. Khoản phải chi ngay hôm nay nên nằm ở tài khoản thanh toán.",
          source: { sourceId: "w5-mmf" },
        },
      ],
    },
  ],
} satisfies UnitInput;
