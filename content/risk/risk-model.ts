/**
 * Bài đánh giá mức độ chấp nhận rủi ro, theo "Bộ Đánh Giá Mức Độ Chấp Nhận Rủi Ro Nhà Đầu Tư"
 * (Risk Scoring Framework) phiên bản 2.3, tháng 12/2025.
 *
 * Edit this file to change the questionnaire; the app (lesson b1-risk-check), the prototype and
 * the tests all read it. Section numbers below refer to the framework document.
 *
 *  §3  7 questions in 4 parts, each option worth 1 (most cautious) to 4–5 points (boldest).
 *  §4.1 Total = sum of the 7 answers (7–30).
 *  §4.2 Total → profile bands.
 *  §4.3 Override rules ①–④.
 *  §5  The learner confirms the result: agree, one step lower, or one step higher with an
 *      explicit acknowledgement that is stored for Compliance. §5.2 special cases are flagged.
 *
 * Interpretations the document leaves open are marked "Assumption" and are easy to change here.
 */

export const FRAMEWORK = { name: "Bộ Đánh Giá Mức Độ Chấp Nhận Rủi Ro Nhà Đầu Tư", version: "2.3", date: "2025-12" } as const;

export const PROFILE_IDS = ["rat-than-trong", "than-trong", "can-bang", "kha-mao-hiem", "rat-mao-hiem"] as const;
export type ProfileId = (typeof PROFILE_IDS)[number];

export type ProfileInfo = {
  id: ProfileId;
  name: string;
  /** "Đặc điểm" (§2). */
  summary: string;
  mascot: string;
  /** "Quỹ phù hợp (ví dụ)" (§4.2). Shown as examples with a disclaimer. */
  funds: string[];
  /** Fund TYPES to study first (segment C unit ids). */
  studyUnits: string[];
};

export const PROFILES: ProfileInfo[] = [
  {
    id: "rat-than-trong", name: "Rất thận trọng", mascot: "save",
    summary: "Ưu tiên bảo toàn vốn, chấp nhận lợi nhuận thấp.",
    funds: ["DCIP"], studyUnits: ["c1-money-market", "c2-bond-funds"],
  },
  {
    id: "than-trong", name: "Thận trọng", mascot: "study",
    summary: "Ưu tiên an toàn, chấp nhận rủi ro nhỏ.",
    funds: ["DCIP", "DCBF", "DCBA + DCBF"], studyUnits: ["c2-bond-funds", "c5-balanced"],
  },
  {
    id: "can-bang", name: "Cân bằng", mascot: "grow",
    summary: "Cân bằng giữa rủi ro và lợi nhuận.",
    funds: ["DCBA", "DCBF + DCDS", "DCBA + DCDS"], studyUnits: ["c5-balanced", "c4-index-passive"],
  },
  {
    id: "kha-mao-hiem", name: "Khá mạo hiểm", mascot: "analyze",
    summary: "Chấp nhận rủi ro cao, hướng tới lợi nhuận lớn.",
    funds: ["DCDS", "DCDS + DCDE", "DCDS + DCBA"], studyUnits: ["c3-equity-funds", "c4-index-passive", "c5-balanced"],
  },
  {
    id: "rat-mao-hiem", name: "Rất mạo hiểm", mascot: "fight",
    summary: "Ưu tiên lợi nhuận tối đa, chấp nhận biến động lớn.",
    funds: ["DCDS", "DCDE"], studyUnits: ["c3-equity-funds", "c4-index-passive"],
  },
];

/** §4.2. The document starts the first band at 5, but the lowest possible total is 7. */
export const BANDS: { profile: ProfileId; min: number; max: number }[] = [
  { profile: "rat-than-trong", min: 7, max: 8 },
  { profile: "than-trong", min: 9, max: 13 },
  { profile: "can-bang", min: 14, max: 18 },
  { profile: "kha-mao-hiem", min: 19, max: 23 },
  { profile: "rat-mao-hiem", min: 24, max: 30 },
];

export const SECTIONS = {
  A: "Thời gian đầu tư",
  B: "Khả năng chấp nhận rủi ro",
  C: "Năng lực tài chính",
  D: "Kiến thức & kinh nghiệm",
} as const;
export type SectionId = keyof typeof SECTIONS;

export type RiskQuestion = {
  /** Also the challenge id in the lesson; never reuse once shipped. */
  id: string;
  /** "Câu N" in the document. */
  number: number;
  section: SectionId;
  prompt: string;
  options: { label: string; points: number }[];
};

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: "b1-q-horizon", number: 1, section: "A",
    prompt: "Bạn dự kiến đầu tư trong bao lâu?",
    options: [
      { label: "Dưới 1 năm", points: 1 },
      { label: "1 – 3 năm", points: 2 },
      { label: "3 – 5 năm", points: 3 },
      { label: "5 – 10 năm", points: 4 },
      { label: "Trên 10 năm", points: 5 },
    ],
  },
  {
    id: "b1-q-feeling", number: 2, section: "B",
    prompt: "Khi nghĩ về \"rủi ro đầu tư\", bạn liên tưởng đến điều gì?",
    options: [
      { label: "Sợ hãi, lo lắng mất tiền", points: 1 },
      { label: "Cảm giác không chắc chắn, khó chịu", points: 2 },
      { label: "Điều bình thường trong đầu tư", points: 3 },
      { label: "Cơ hội để đạt lợi nhuận cao", points: 4 },
    ],
  },
  {
    id: "b1-q-drop15", number: 3, section: "B",
    prompt: "Nếu danh mục của bạn giảm 15% trong 1 tháng, bạn sẽ làm gì?",
    options: [
      { label: "Bán hết ngay lập tức", points: 1 },
      { label: "Bán một phần để giảm rủi ro", points: 2 },
      { label: "Giữ nguyên và chờ đợi", points: 3 },
      { label: "Mua thêm vì đây là cơ hội tốt", points: 4 },
    ],
  },
  {
    id: "b1-q-volatility", number: 4, section: "B",
    prompt: "Chọn kịch bản biến động bạn cảm thấy phù hợp nhất (lợi nhuận dao động mỗi năm):",
    options: [
      { label: "Rất an toàn: khoảng ±5%", points: 1 },
      { label: "An toàn: khoảng ±7%", points: 2 },
      { label: "Cân bằng: khoảng ±12%", points: 3 },
      { label: "Tăng trưởng: khoảng ±15%", points: 4 },
      { label: "Mạo hiểm: hơn ±15%", points: 5 },
    ],
  },
  {
    id: "b1-q-income", number: 5, section: "C",
    prompt: "Thu nhập của bạn có ổn định không?",
    options: [
      { label: "Không có lương cố định", points: 1 },
      { label: "Có lương, nhưng thưởng/dự án chiếm phần lớn", points: 2 },
      { label: "Lương cố định chiếm phần lớn", points: 3 },
      { label: "Có nhiều nguồn thu nhập", points: 4 },
    ],
  },
  {
    id: "b1-q-share", number: 6, section: "C",
    prompt: "Khoản đầu tư này chiếm bao nhiêu % tổng tài sản của bạn?",
    options: [
      { label: "Trên 50%", points: 1 },
      { label: "20 – 50%", points: 2 },
      { label: "5 – 20%", points: 3 },
      { label: "Dưới 5%", points: 4 },
    ],
  },
  {
    id: "b1-q-knowledge", number: 7, section: "D",
    prompt: "Hiểu biết về đầu tư trên thị trường chứng khoán của bạn như thế nào?",
    options: [
      { label: "Chưa biết về đầu tư", points: 1 },
      { label: "Có kiến thức về đầu tư", points: 2 },
      { label: "Có kiến thức và kinh nghiệm", points: 3 },
      { label: "Rất hiểu biết và có kinh nghiệm", points: 4 },
    ],
  },
];

/** §4.3 Override rules. Thresholds are in points of the named question. */
export const OVERRIDES = {
  /** ① Time Horizon Override: Câu 1 = 1 → highest profile is Thận trọng. */
  horizon: {
    question: "b1-q-horizon", atMost: 1, maxProfile: "than-trong" as ProfileId,
    reason: "Bạn dự kiến đầu tư dưới 1 năm, nên hồ sơ tối đa là Thận trọng, bất kể tổng điểm.",
  },
  /**
   * ② Knowledge Gap: Câu 7 = 1 → recommend starting with Cân bằng and give learning material.
   * Assumption: a higher result is brought down to Cân bằng; a lower one is left as is.
   */
  knowledge: {
    question: "b1-q-knowledge", atMost: 1, startAt: "can-bang" as ProfileId,
    reason: "Bạn chưa có kinh nghiệm đầu tư, nên Rồng khuyến nghị bắt đầu ở mức Cân bằng và học thêm trước khi nhận thêm rủi ro.",
  },
  /** ③ Capacity Warning: Câu 6 ≤ 2 (over 20% of assets) and total ≥ 24 → warn and require confirmation. */
  capacity: {
    question: "b1-q-share", atMost: 2, totalAtLeast: 24,
    warning: "Khoản đầu tư này chiếm trên 20% tổng tài sản của bạn. Với hồ sơ mạo hiểm, một đợt giảm mạnh có thể ảnh hưởng lớn đến tài chính của bạn.",
  },
  /** ④ Inconsistency Check: Câu 4 ≤ 2 (≤ ±7%) but Câu 3 ≥ 4 (buy more) → ask to confirm the answers. */
  inconsistency: {
    lowQuestion: "b1-q-volatility", lowAtMost: 2, highQuestion: "b1-q-drop15", highAtLeast: 4,
    message: "Bạn chọn mức biến động chỉ khoảng ±5–7% mỗi năm, nhưng lại sẽ mua thêm khi danh mục giảm 15%. Hai câu trả lời này hơi mâu thuẫn. Bạn kiểm tra lại câu 3 và câu 4 nhé.",
  },
};

/**
 * §5.2 special cases, flagged on the confirmed profile for Compliance review.
 * Assumption: "Risk Tolerance cao" = part B ≥ 10 of 13 points; "Risk Capacity thấp" = part C ≤ 4 of 8.
 */
export const SPECIAL_CASES = {
  toleranceHighAtLeast: 10,
  capacityLowAtMost: 4,
  labels: {
    "first-time-high-risk": "Nhà đầu tư lần đầu với hồ sơ Khá mạo hiểm hoặc Rất mạo hiểm",
    "short-horizon-high-tolerance": "Thời gian đầu tư dưới 3 năm nhưng khả năng chấp nhận rủi ro cao",
    inconsistency: "Câu trả lời có dấu hiệu mâu thuẫn",
    "low-capacity-high-risk": "Năng lực tài chính thấp nhưng muốn đầu tư mạo hiểm",
    "chose-higher": "Chọn hồ sơ cao hơn kết quả đánh giá (đã xác nhận)",
  },
} as const;
export type SpecialCase = keyof typeof SPECIAL_CASES.labels;

/** §5 confirmation step. */
export const CONFIRMATION = {
  question: "Dựa trên câu trả lời của bạn, hồ sơ đầu tư phù hợp là {profile}. Bạn có đồng ý với kết quả này không?",
  agree: "Đồng ý",
  lower: "Tôi muốn ít rủi ro hơn",
  higher: "Tôi muốn nhiều rủi ro hơn",
  /** Shown as a checkbox; required for "higher" and whenever rule ③ applies. Stored with the profile. */
  acknowledgement:
    "Tôi hiểu rằng hồ sơ này có mức rủi ro cao hơn mức phù hợp với câu trả lời của tôi, giá trị khoản đầu tư có thể giảm mạnh, và tôi tự chịu trách nhiệm với lựa chọn này.",
  capacityAcknowledgement:
    "Tôi hiểu rằng khoản đầu tư này chiếm phần lớn tài sản của tôi và có thể giảm mạnh trong một số giai đoạn.",
};

export const DISCLAIMER =
  "Bộ câu hỏi chỉ mang tính tham khảo, không thay thế tư vấn đầu tư chuyên nghiệp. Nên đánh giá lại mỗi năm hoặc khi có thay đổi lớn về tài chính, mục tiêu. Hiệu suất quá khứ không đảm bảo kết quả tương lai.";
