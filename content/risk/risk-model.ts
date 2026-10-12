/**
 * Bài tự đánh giá khẩu vị rủi ro: câu hỏi, đáp án và quy tắc chấm, trong MỘT file.
 *
 * Edit this file to change the questionnaire. The app (lesson b1-risk-check), the prototype
 * and the tests all read it. It is an EDUCATIONAL self-check, not the suitability assessment
 * DragonX performs at account opening; wording and rules need Compliance sign-off.
 *
 * How the result is worked out (content/risk/score.ts):
 *  1. WILLINGNESS ("bạn sẵn sàng chịu bao nhiêu"): options of `willingness` questions carry a
 *     `level` 0–4 (Bảo toàn → Năng động). The weighted average, rounded, is the level the
 *     learner is willing to take.
 *  2. LIMITS ("hoàn cảnh cho phép bao nhiêu"): any option may carry a `cap` with a `reason`.
 *     The result is the lowest of the willingness level and every cap that applies, and each
 *     cap that lowered the result is shown to the learner with its reason.
 *  3. NOTES: answers that contradict each other are pointed out, without changing the result.
 * Experience never lowers a learner below Tăng trưởng: being new is not the same as being unable.
 */

export const PROFILE_IDS = ["bao-toan", "than-trong", "can-bang", "tang-truong", "nang-dong"] as const;
export type ProfileId = (typeof PROFILE_IDS)[number];
/** 0 = Bảo toàn … 4 = Năng động */
export type Level = 0 | 1 | 2 | 3 | 4;

export type ProfileInfo = {
  id: ProfileId;
  name: string;
  summary: string;
  mascot: string;
  /** Fund TYPES to study first (segment C unit ids). Education, not a recommendation. */
  studyUnits: string[];
  /** DC funds whose documents are most relevant to read. Shown with a disclaimer. */
  relevantFunds: string[];
};

export const PROFILES: ProfileInfo[] = [
  {
    id: "bao-toan", name: "Bảo toàn", mascot: "save",
    summary: "Ưu tiên giữ vốn và thanh khoản, chấp nhận lợi nhuận thấp hơn.",
    studyUnits: ["c1-money-market", "c2-bond-funds"], relevantFunds: ["DCIP", "DCBF"],
  },
  {
    id: "than-trong", name: "Thận trọng", mascot: "study",
    summary: "Chấp nhận biến động nhỏ để có thu nhập ổn định hơn tiền gửi.",
    studyUnits: ["c2-bond-funds", "c5-balanced"], relevantFunds: ["DCBF", "DCIP", "DCBA"],
  },
  {
    id: "can-bang", name: "Cân bằng", mascot: "grow",
    summary: "Cân bằng giữa tăng trưởng và kiểm soát biến động.",
    studyUnits: ["c5-balanced", "c4-index-passive"], relevantFunds: ["DCBA", "DCBF", "DCDE"],
  },
  {
    id: "tang-truong", name: "Tăng trưởng", mascot: "analyze",
    summary: "Mục tiêu dài hạn, chịu được những đợt giảm đáng kể.",
    studyUnits: ["c3-equity-funds", "c4-index-passive", "c5-balanced"], relevantFunds: ["DCDE", "DCDS", "DCBA"],
  },
  {
    id: "nang-dong", name: "Năng động", mascot: "fight",
    summary: "Chấp nhận biến động lớn để tìm tăng trưởng vốn dài hạn.",
    studyUnits: ["c3-equity-funds", "c4-index-passive"], relevantFunds: ["DCDS", "DCDE", "ETF"],
  },
];

export type RiskOption = {
  label: string;
  /** Willingness questions only: the profile level this answer expresses. */
  level?: Level;
  /** Highest profile allowed when this answer is chosen, and why (shown to the learner). */
  cap?: Level;
  reason?: string;
};

export type RiskQuestion = {
  /** Also the challenge id in the lesson; never reuse once shipped. */
  id: string;
  kind: "willingness" | "limit";
  prompt: string;
  /** Willingness questions: how much this answer counts in the average. */
  weight?: number;
  options: RiskOption[];
};

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: "b1-q-horizon",
    kind: "limit",
    prompt: "Khi nào bạn cần dùng phần lớn khoản tiền này?",
    options: [
      { label: "Trong vòng 1 năm", cap: 0, reason: "Bạn cần tiền trong vòng 1 năm: lúc này giữ vốn và thanh khoản quan trọng hơn sinh lời." },
      { label: "1 – 3 năm", cap: 1, reason: "Với 1–3 năm, nếu cổ phiếu giảm sâu, bạn có thể chưa kịp chờ hồi phục." },
      { label: "3 – 5 năm", cap: 2, reason: "Với 3–5 năm, tỷ trọng cổ phiếu nên ở mức vừa phải." },
      { label: "5 – 10 năm" },
      { label: "Hơn 10 năm" },
    ],
  },
  {
    id: "b1-q-emergency",
    kind: "limit",
    prompt: "Khoản dự phòng hiện tại đủ cho bạn chi tiêu bao lâu nếu mất thu nhập?",
    options: [
      { label: "Chưa có hoặc dưới 1 tháng", cap: 1, reason: "Chưa có quỹ dự phòng: một biến cố có thể buộc bạn bán khoản đầu tư đúng lúc thị trường giảm." },
      { label: "1 – 3 tháng", cap: 2, reason: "Quỹ dự phòng dưới 3 tháng chi tiêu còn mỏng; nên xây thêm trước khi chọn mức rủi ro cao." },
      { label: "3 – 6 tháng" },
      { label: "6 – 12 tháng" },
      { label: "Trên 12 tháng" },
    ],
  },
  {
    id: "b1-q-income-share",
    kind: "limit",
    prompt: "Nếu khoản đầu tư giảm 30%, cuộc sống của bạn bị ảnh hưởng thế nào?",
    options: [
      { label: "Rất nặng, tôi cần số tiền đó cho chi tiêu", cap: 1, reason: "Bạn cần chính số tiền này cho chi tiêu, nên không nên để nó biến động nhiều." },
      { label: "Khá nặng, phải hoãn kế hoạch quan trọng", cap: 3, reason: "Một đợt giảm 30% sẽ làm lỡ kế hoạch quan trọng của bạn, nên chưa hợp với mức Năng động." },
      { label: "Có ảnh hưởng nhưng vẫn ổn" },
      { label: "Gần như không ảnh hưởng" },
    ],
  },
  {
    id: "b1-q-drawdown",
    kind: "willingness",
    weight: 1,
    prompt: "Danh mục của bạn giảm 20% trong 3 tháng. Bạn sẽ…",
    options: [
      { label: "Bán hết để không lỗ thêm", level: 0 },
      { label: "Bán bớt một phần", level: 1 },
      { label: "Giữ nguyên, tiếp tục kế hoạch", level: 3 },
      { label: "Mua thêm theo kế hoạch đã định", level: 4 },
    ],
  },
  {
    id: "b1-q-tradeoff",
    kind: "willingness",
    weight: 2,
    prompt: "Bạn chọn danh mục nào? (năm tốt nhất / năm tệ nhất, số liệu minh họa)",
    options: [
      { label: "+6% / +2%", level: 0 },
      { label: "+9% / −3%", level: 1 },
      { label: "+13% / −8%", level: 2 },
      { label: "+20% / −15%", level: 3 },
      { label: "+35% / −30%", level: 4 },
    ],
  },
  {
    id: "b1-q-knowledge",
    kind: "limit",
    prompt: "Bạn đã từng đầu tư sản phẩm nào?",
    options: [
      { label: "Chỉ gửi tiết kiệm", cap: 3, reason: "Mức Năng động cần kinh nghiệm với quỹ cổ phiếu; bắt đầu ở mức Tăng trưởng và nâng dần." },
      { label: "Quỹ trái phiếu hoặc vàng", cap: 3, reason: "Mức Năng động cần kinh nghiệm với quỹ cổ phiếu; bắt đầu ở mức Tăng trưởng và nâng dần." },
      { label: "Quỹ cổ phiếu hoặc ETF" },
      { label: "Tự giao dịch cổ phiếu nhiều năm" },
    ],
  },
];

/**
 * Contradiction worth pointing out: the portfolio chosen in `high` is at least `gap` levels
 * above the reaction chosen in `low`.
 */
export const RISK_NOTES = [
  {
    high: "b1-q-tradeoff",
    low: "b1-q-drawdown",
    gap: 2,
    note: "Bạn chọn danh mục có năm giảm sâu, nhưng lại định bán khi danh mục giảm 20%. Khi thị trường giảm thật, phản ứng của bạn mới quyết định kết quả, nên Rồng tính cả hai câu.",
  },
];

/** Used when a learner skips every willingness question. */
export const DEFAULT_LEVEL: Level = 2;
