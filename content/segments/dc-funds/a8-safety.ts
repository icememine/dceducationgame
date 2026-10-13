import type { UnitInput } from "../../schema";

/** Unit id is historical. */
export const unit = {
  id: "a5-dragonx-safety",
  title: "Phần 8 · An toàn tài khoản",
  description: "OTP, PIN, cuộc gọi giả mạo",
  color: "coral",
  mascot: "fight",
  lessons: [
    {
      id: "a5-stay-safe",
      title: "Giữ tài khoản an toàn",
      challenges: [
        {
          id: "a5-otp",
          type: "select",
          pattern: "decision",
          context: "Tối Chủ nhật, anh Vinh nhận một mã OTP của DragonX dù không thao tác gì. Ngay sau đó, có người tự xưng nhân viên DC gọi xin mã để \"kiểm tra hệ thống\".",
          prompt: "Anh nên làm gì?",
          options: [
            "Đọc mã cho họ, vì họ biết đúng tên anh",
            "Không cung cấp OTP; liên hệ kênh hỗ trợ chính thức và đổi mật khẩu, PIN",
            "Bỏ qua, không cần làm gì thêm",
          ],
          answer: 1,
          explain: "Nhân viên DC không bao giờ cần OTP, PIN hay mật khẩu của bạn. OTP lạ nghĩa là có người đang thử đăng nhập: hãy đổi thông tin bảo mật qua kênh chính thức ngay.",
          source: { sourceId: "library", locator: "Đăng nhập, mật khẩu & OTP" },
        },
        {
          id: "a5-caller-id",
          type: "select",
          pattern: "misconception",
          context: "Cuộc gọi đến hiển thị tên \"Dragon Capital\". Người gọi đọc đúng họ tên và số tài khoản của chị Mai, rồi đề nghị chị chuyển tiền sang một tài khoản mới để \"nâng hạng\".",
          prompt: "Nhận định nào đúng?",
          options: [
            "Tên hiển thị và thông tin chính xác là đủ để tin",
            "Tên hiển thị có thể bị giả mạo; hãy tự gọi lại số chính thức trước khi làm gì",
            "Chỉ cần hỏi tên nhân viên là kiểm tra được",
          ],
          answer: 1,
          explain: "Kẻ gian có thể giả tên hiển thị và dùng thông tin cá nhân bị lộ. Tiền mua quỹ chỉ chuyển vào tài khoản đứng tên quỹ theo hướng dẫn trên DragonX, không theo yêu cầu qua điện thoại.",
          source: { sourceId: "faq", locator: "Câu 116" },
        },
        {
          id: "a5-bad-link",
          type: "order",
          prompt: "Lỡ nhấn đường dẫn lạ: sắp xếp các bước theo thứ tự nên làm",
          items: [
            "Ngừng tương tác, không nhập thêm PIN/OTP",
            "Liên hệ hỗ trợ từ một thiết bị an toàn",
            "Đổi thông tin bảo mật qua kênh chính thức",
            "Kiểm tra lệnh và tài khoản thụ hưởng",
          ],
          source: { sourceId: "faq", locator: "Câu 120" },
        },
      ],
    },
  ],
} satisfies UnitInput;
