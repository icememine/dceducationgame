import type { SegmentInput } from "../schema";

/**
 * Segment B — Kế hoạch của tôi (self risk assessment, personal goals, investing discipline).
 * Sources: AMDD articles (1 tỷ đầu tiên, du học, nhà đầu tư 60 tuổi, quỹ tự do sự nghiệp,
 * DCA, ngày tốt nhất để đầu tư, DCDS 10 năm, Sell in May) + FAQ câu 2, 3, 13, 21, 22.
 *
 * The risk questionnaire is an EDUCATIONAL self-check, not the suitability assessment
 * DragonX performs at account opening. Its wording and score bands need Compliance sign-off
 * before launch (source "dc-risk-quiz" is marked as draft).
 */
export const myPlan = {
  id: "my-plan",
  code: "TÔI",
  title: "Kế hoạch của tôi",
  subtitle: "Khẩu vị rủi ro · Mục tiêu · Kỷ luật đầu tư",
  heartsEnabled: false,
  units: [
    {
      id: "b1-know-yourself",
      title: "Phần 1 · Hiểu bản thân",
      description: "Bạn chịu được biến động đến đâu?",
      color: "jade",
      mascot: "explore",
      lessons: [
        {
          id: "b1-risk-check",
          title: "Tự đánh giá khẩu vị rủi ro",
          kind: "profile",
          xp: 20,
          minutes: 4,
          challenges: [
            {
              id: "b1-intro",
              type: "info",
              title: "Không có câu trả lời sai",
              body: "6 câu hỏi giúp bạn hiểu khả năng tài chính, thời gian đầu tư và cảm xúc khi thị trường giảm. Kết quả dùng để gợi ý lộ trình học, không phải khuyến nghị đầu tư.",
              mascot: "explore",
            },
            {
              id: "b1-q-horizon",
              type: "profile",
              dimension: "horizon",
              prompt: "Khi nào bạn cần dùng phần lớn khoản tiền này?",
              options: [
                { label: "Trong vòng 1 năm", score: 0 },
                { label: "1 – 3 năm", score: 1 },
                { label: "3 – 5 năm", score: 2 },
                { label: "5 – 10 năm", score: 3 },
                { label: "Hơn 10 năm", score: 4 },
              ],
              source: { sourceId: "dc-risk-quiz" },
            },
            {
              id: "b1-q-emergency",
              type: "profile",
              dimension: "capacity",
              prompt: "Khoản dự phòng hiện tại đủ cho bạn chi tiêu bao lâu nếu mất thu nhập?",
              options: [
                { label: "Chưa có hoặc dưới 1 tháng", score: 0 },
                { label: "1 – 3 tháng", score: 1 },
                { label: "3 – 6 tháng", score: 2 },
                { label: "6 – 12 tháng", score: 3 },
                { label: "Trên 12 tháng", score: 4 },
              ],
              source: { sourceId: "amdd-career-fund" },
            },
            {
              id: "b1-q-income-share",
              type: "profile",
              dimension: "capacity",
              prompt: "Nếu khoản đầu tư giảm một nửa, cuộc sống của bạn bị ảnh hưởng thế nào?",
              options: [
                { label: "Rất nặng, tôi cần số tiền đó cho chi tiêu", score: 0 },
                { label: "Khá nặng, phải hoãn kế hoạch quan trọng", score: 1 },
                { label: "Có ảnh hưởng nhưng vẫn ổn", score: 3 },
                { label: "Gần như không ảnh hưởng", score: 4 },
              ],
              source: { sourceId: "dc-risk-quiz" },
            },
            {
              id: "b1-q-drawdown",
              type: "profile",
              dimension: "tolerance",
              prompt: "Danh mục của bạn giảm 20% trong 3 tháng. Bạn sẽ…",
              options: [
                { label: "Bán hết để không lỗ thêm", score: 0 },
                { label: "Bán bớt một phần", score: 1 },
                { label: "Giữ nguyên, tiếp tục kế hoạch", score: 3 },
                { label: "Mua thêm theo kế hoạch đã định", score: 4 },
              ],
              source: { sourceId: "dc-risk-quiz" },
            },
            {
              id: "b1-q-tradeoff",
              type: "profile",
              dimension: "tolerance",
              prompt: "Bạn chọn danh mục nào? (năm tốt nhất / năm tệ nhất, minh họa)",
              options: [
                { label: "+7% / +3%", score: 0 },
                { label: "+12% / −5%", score: 2 },
                { label: "+20% / −15%", score: 3 },
                { label: "+35% / −30%", score: 4 },
              ],
              source: { sourceId: "dc-risk-quiz" },
            },
            {
              id: "b1-q-knowledge",
              type: "profile",
              dimension: "knowledge",
              prompt: "Bạn đã từng đầu tư sản phẩm nào?",
              options: [
                { label: "Chỉ gửi tiết kiệm", score: 0 },
                { label: "Quỹ trái phiếu hoặc vàng", score: 1 },
                { label: "Quỹ cổ phiếu hoặc ETF", score: 3 },
                { label: "Tự giao dịch cổ phiếu nhiều năm", score: 4 },
              ],
              source: { sourceId: "dc-risk-quiz" },
            },
          ],
        },
        {
          id: "b1-emergency-first",
          title: "Quỹ dự phòng trước tiên",
          challenges: [
            {
              id: "b1-career-fund-calc",
              type: "numeric",
              prompt: "Quỹ tự do sự nghiệp 12 tháng của bạn cần bao nhiêu?",
              context: "Chi tiêu hằng tháng của bạn là 15 triệu đồng.",
              answer: 180,
              tolerance: 0,
              unit: "triệu đ",
              explain: "15 triệu × 12 tháng = 180 triệu. Khoản này cho bạn quyền lựa chọn khi mất việc, thay vì phải nhận cơ hội đến sớm nhất.",
              source: { sourceId: "amdd-career-fund" },
            },
            {
              id: "b1-short-term-equity",
              type: "true_false",
              prompt: "Tiền cần dùng trong năm tới nên dồn hết vào quỹ cổ phiếu để sinh lời nhanh.",
              answer: false,
              explain: "Khoản cần dùng sớm hoặc có thời hạn cố định nên ưu tiên thanh khoản và hạn chế biến động.",
              source: { sourceId: "faq", locator: "Câu 22" },
            },
          ],
        },
      ],
    },
    {
      id: "b2-set-goals",
      title: "Phần 2 · Đặt mục tiêu",
      description: "1 tỷ đầu tiên, du học cho con, nghỉ hưu",
      color: "gold",
      mascot: "grow",
      lessons: [
        {
          id: "b2-first-billion",
          title: "1 tỷ đồng đầu tiên",
          challenges: [
            {
              id: "b2-billion-years",
              type: "select",
              prompt: "Đầu tư 5 triệu/tháng, lợi nhuận giả định 15%/năm. Bao lâu chạm 1 tỷ?",
              options: ["Khoảng 3 năm", "Khoảng 8 năm 4 tháng", "Khoảng 16 năm", "Khoảng 25 năm"],
              answer: 1,
              explain: "Khoảng 8 năm 4 tháng. Tổng vốn góp chỉ khoảng 504 triệu, gần nửa còn lại đến từ lãi kép. Đây là giả định minh họa, không phải cam kết lợi nhuận.",
              source: { sourceId: "amdd-first-billion" },
            },
            {
              id: "b2-billion-planner",
              type: "goal_planner",
              prompt: "Thử với con số của bạn",
              goal: "first-billion",
              defaults: { target: 1_000_000_000, monthly: 5_000_000, initial: 0, annualReturn: 0.15 },
              source: { sourceId: "amdd-first-billion" },
            },
          ],
        },
        {
          id: "b2-education",
          title: "Du học cho con",
          challenges: [
            {
              id: "b2-edu-info",
              type: "info",
              title: "Con số dễ bị tính thiếu",
              body: "4 năm đại học tại một trường tư hàng đầu ở Mỹ khoảng 9,5 tỷ đồng theo mặt bằng 2026. Nếu chi phí tăng 4,4%/năm và VND mất giá 2%/năm, 10 năm nữa con số có thể lên khoảng 17,8 tỷ.",
              mascot: "analyze",
              source: { sourceId: "amdd-study-abroad" },
            },
            {
              id: "b2-edu-start-early",
              type: "true_false",
              prompt: "Bắt đầu sớm hơn giúp giảm số tiền cần góp mỗi tháng vì lãi kép có nhiều thời gian hơn.",
              answer: true,
              explain: "Với mục tiêu du học, thời điểm cần tiền gần như cố định, nên thời gian chuẩn bị là biến số quan trọng nhất.",
              source: { sourceId: "amdd-study-abroad" },
            },
            {
              id: "b2-edu-planner",
              type: "goal_planner",
              prompt: "Lập kế hoạch du học",
              goal: "education",
              defaults: { target: 4_200_000_000, monthly: 18_000_000, initial: 0, annualReturn: 0.13 },
              source: { sourceId: "amdd-study-abroad" },
            },
          ],
        },
        {
          id: "b2-retirement",
          title: "Muộn vẫn hơn không",
          challenges: [
            {
              id: "b2-age60-info",
              type: "info",
              title: "Nhà đầu tư 60 tuổi",
              body: "Người lái xe của CEO Dragon Capital bắt đầu đầu tư định kỳ ở tuổi 60. Sau gần một năm, 29 triệu vốn góp đã thành gần 37 triệu. Kết quả một năm không đại diện cho tương lai, nhưng bắt đầu là bước khó nhất.",
              mascot: "grow",
              source: { sourceId: "amdd-age-60" },
            },
            {
              id: "b2-near-goal",
              type: "select",
              prompt: "Khi gần đến thời điểm cần tiền, nên làm gì với tài sản biến động mạnh?",
              options: [
                "Giảm dần tỷ trọng để hạn chế phải bán lúc thị trường bất lợi",
                "Tăng tỷ trọng để về đích nhanh hơn",
                "Không cần thay đổi gì",
              ],
              answer: 0,
              source: { sourceId: "faq", locator: "Câu 13" },
            },
          ],
        },
      ],
    },
    {
      id: "b3-discipline",
      title: "Phần 3 · Kỷ luật đầu tư",
      description: "DCA và vì sao không cần đoán thị trường",
      color: "sky",
      mascot: "fight",
      lessons: [
        {
          id: "b3-dca",
          title: "DCA như đổ xăng",
          challenges: [
            {
              id: "b3-petrol",
              type: "info",
              title: "Không ai đợi giá xăng giảm mới đổ xăng",
              body: "Đổ \"năm chục\" mỗi lần: giá cao mua được ít, giá thấp mua được nhiều. DCA áp dụng cùng nguyên tắc cho đầu tư: số tiền cố định, lịch cố định.",
              mascot: "save",
              source: { sourceId: "amdd-petrol" },
            },
            {
              id: "b3-timing-gap",
              type: "select",
              prompt: "22 năm, 10 triệu/tháng vào DCDS. Người luôn mua đúng đáy hơn người mua theo lịch bao nhiêu?",
              options: ["Khoảng 2,7%", "Khoảng 30%", "Gấp đôi", "Gấp 5 lần"],
              answer: 0,
              explain: "Khoảng 11,8 tỷ so với 11,4 tỷ: chỉ hơn ~2,7%. Thời gian ở trong thị trường quan trọng hơn chọn ngày mua.",
              source: { sourceId: "amdd-petrol" },
            },
            {
              id: "b3-dca-no-loss",
              type: "true_false",
              prompt: "DCA loại bỏ hoàn toàn rủi ro thua lỗ.",
              answer: false,
              explain: "DCA giúp duy trì kỷ luật và giảm phụ thuộc vào một thời điểm, nhưng không loại bỏ rủi ro và không luôn hơn đầu tư một lần.",
              source: { sourceId: "faq", locator: "Câu 3" },
            },
            {
              id: "b3-strategies",
              type: "order",
              prompt: "DCDS 2016–2026, 10 triệu/tháng: xếp kết quả từ cao đến thấp",
              items: [
                "Đầu tư đều đặn (~2,21 tỷ)",
                "Tạm dừng khi quỹ giảm (~2,16 tỷ)",
                "Bán ra rồi mua lại (~1,85 tỷ)",
              ],
              explain: "Kiên trì vừa đơn giản hơn, vừa hiệu quả hơn việc đoán thị trường trong giai đoạn này.",
              source: { sourceId: "amdd-dcds-10y" },
            },
          ],
        },
        {
          id: "b3-market-myths",
          title: "Sell in May?",
          challenges: [
            {
              id: "b3-sell-in-may",
              type: "true_false",
              prompt: "Tại Việt Nam, tháng 5 luôn là tháng giảm điểm.",
              answer: false,
              explain: "Trong 12 năm quan sát, VN-Index tăng trong tháng 5 ở 8 năm. Kết quả dao động từ −7,5% đến +12,4%, phụ thuộc điều kiện từng năm.",
              source: { sourceId: "amdd-sell-in-may" },
            },
            {
              id: "b3-best-day",
              type: "select",
              prompt: "Theo dữ liệu DCDS hơn 22 năm, ngày tốt nhất để đầu tư là…",
              options: ["Ngày tiền về tài khoản", "Đầu tháng 1", "Sau khi thị trường giảm 10%", "Thứ 6 cuối tháng"],
              answer: 0,
              source: { sourceId: "amdd-best-day" },
            },
          ],
        },
      ],
    },
  ],
} satisfies SegmentInput;
