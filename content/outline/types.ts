/**
 * The detailed lesson program (the PLAN). `content/segments/*` holds lessons that are
 * already written and playable; every outline lesson that has one points to it via
 * `builtAs`. Writers pick the next outline lesson, write it into a segment file, and
 * set `builtAs`.
 */

/** How a lesson teaches. One lesson usually mixes 2–3 formats. */
export const FORMATS = {
  story: "Câu chuyện",
  concept: "Thẻ kiến thức",
  quiz: "Câu hỏi nhanh",
  calc: "Tính nhanh",
  estimate: "Đoán số",
  sim: "Mô phỏng",
  game: "Trò chơi dữ liệu",
  scenario: "Tình huống",
  decision: "Ra quyết định",
  case: "Hồ sơ hỗ trợ",
  spot: "Tìm lỗi sai",
  reflect: "Tự đánh giá · cam kết",
  ai: "Luyện cùng AI",
  checkpoint: "Kiểm tra",
} as const;
export type Format = keyof typeof FORMATS;

/** Interactive tools reused across lessons (see docs/FEATURES.md §Công cụ). */
export const TOOLS = {
  planner: "Lập kế hoạch mục tiêu",
  compound: "Máy tính lãi kép",
  "dca-sim": "Mô phỏng DCA và đầu tư một lần",
  "timing-game": "Trò chơi Nhà tiên tri (chọn ngày mua)",
  "reaction-sim": "Mô phỏng ba phản ứng khi quỹ giảm",
  runway: "Máy tính quỹ tự do sự nghiệp",
  "edu-cost": "Ước tính chi phí du học",
  "age-rule": "Phân bổ theo quy tắc 100 − tuổi",
  sandbox: "Danh mục thử nghiệm",
  drawdown: "Máy tính hồi phục sau sụt giảm",
  rebalance: "Mô phỏng tái cân bằng",
  "bond-seesaw": "Bập bênh lãi suất – giá trái phiếu",
  "fee-impact": "Tác động của phí theo thời gian",
  "order-flow": "Vòng đời một lệnh quỹ mở",
  "month-heatmap": "Bản đồ lợi nhuận theo tháng",
  "income-split": "Chia thu nhập thành các ngăn",
} as const;
export type ToolId = keyof typeof TOOLS;

/**
 * A source reference: a source id from content/sources.ts, or "faq:N" for question N of
 * the FAQ document (numbered 1–135; 17 and 20 do not exist).
 */
export type SourceRef = string;

export type OutlineLesson = {
  /** Stable code, e.g. "B4.2". */
  code: string;
  title: string;
  /** What the learner can do afterwards. */
  goal: string;
  formats: Format[];
  sources: SourceRef[];
  /** The concrete numbers and claims the lesson must teach, as stated in the source. */
  facts?: string[];
  tool?: ToolId;
  /** Id of the playable lesson in content/segments, when it exists. */
  builtAs?: string;
};

export type OutlineUnit = {
  code: string;
  title: string;
  /** Why this unit exists for the investor (one sentence). */
  why: string;
  mascot: string;
  lessons: OutlineLesson[];
};

export type OutlineStage = {
  /** Matches the segment id in content/segments. */
  segmentId: string;
  code: "A" | "B" | "C";
  /** Position on the recommended journey (1 = first). */
  order: number;
  title: string;
  subtitle: string;
  role: string;
  units: OutlineUnit[];
  /**
   * FAQ questions with no teaching value (addresses, careers, one-off product admin).
   * They are answered by Hỏi Rồng / the help centre instead of a lesson.
   */
  askRongOnly?: number[];
};

export type AiScenario = {
  id: string;
  title: string;
  /** Who the AI plays. */
  persona: string;
  /** The opening line the AI says. */
  opener: string;
  /** What a good response does. */
  goodResponse: string[];
  /** Red flags the coach must catch. */
  redFlags: string[];
  sources: SourceRef[];
  unlockAfter: string;
  mode: "investor" | "staff";
};
