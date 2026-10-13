import type { GoalKind } from "../schema";

/**
 * Starting points for the "Lập kế hoạch mục tiêu" tool, taken from the AMDD articles.
 * Amounts in đồng; returns are illustrative assumptions, never promises.
 */
export type PlannerPreset = {
  kind: GoalKind;
  label: string;
  target: number;
  monthly: number;
  initial: number;
  annualReturn: number;
  /** One line explaining where the numbers come from (shown under the result). */
  note: string;
  sourceId: string;
};

export const PLANNER_PRESETS: PlannerPreset[] = [
  {
    kind: "first-billion", label: "1 tỷ đầu tiên", target: 1_000_000_000, monthly: 5_000_000, initial: 0, annualReturn: 0.15,
    note: "5 triệu/tháng, giả định 15%/năm: khoảng 8 năm 4 tháng, vốn góp khoảng 504 triệu.", sourceId: "amdd-first-billion",
  },
  {
    kind: "education", label: "Du học cho con", target: 4_200_000_000, monthly: 18_000_000, initial: 0, annualReturn: 0.13,
    note: "4,2 tỷ cho 4 năm đại học; bắt đầu khi con 8 tuổi cần khoảng 18 triệu/tháng, giả định 13%/năm.", sourceId: "amdd-suitcase",
  },
  {
    kind: "emergency", label: "Tự do sự nghiệp", target: 180_000_000, monthly: 5_000_000, initial: 0, annualReturn: 0.15,
    note: "12 tháng chi tiêu × 15 triệu = 180 triệu; góp 5 triệu/tháng mất khoảng 2,5 năm.", sourceId: "amdd-career-fund",
  },
  {
    kind: "retirement", label: "Nghỉ hưu", target: 3_000_000_000, monthly: 5_000_000, initial: 0, annualReturn: 0.12,
    note: "Mục tiêu minh họa. Càng gần ngày nghỉ hưu, càng nên giảm tài sản biến động mạnh.", sourceId: "amdd-age-60",
  },
];

/** "25 hay 45 tuổi": two people contribute the same amount until 60, starting 20 years apart. */
export const START_EARLY = {
  early: { name: "An", startAge: 25 },
  late: { name: "Bình", startAge: 45 },
  endAge: 60,
  monthly: 2_000_000,
  annualReturn: 0.12,
  sourceId: "amdd-age-60",
};

/** "Quỹ tự do sự nghiệp": months of spending you could live on without income. */
export const RUNWAY = {
  monthlySpend: 15_000_000,
  targetMonths: 12,
  monthly: 5_000_000,
  annualReturn: 0.15,
  /** Under 3 months: act now; 6–12: relatively safe; 12–18: ideal. */
  bands: { act: 3, safe: 6, good: 12, ideal: 18 },
  sourceId: "amdd-career-fund",
};

/** "Chi phí du học": HSBC estimate quoted in the article, 4 years ≈ 4,2 tỷ at today's rate. */
export const EDU_COST = {
  annualUsd: 40_000,
  years: 4,
  totalVnd: 4_200_000_000,
  /** The article's own conversion: 4,2 tỷ ÷ (40.000 USD × 4). */
  usdVnd: 4_200_000_000 / (40_000 * 4),
  childAge: 8,
  startAge: 18,
  annualReturn: 0.13,
  sourceId: "amdd-suitcase",
};

/** Three market scenarios from the balanced-fund article (one year, illustration). */
export const MARKET_SCENARIOS = [
  { id: "up", label: "Tăng mạnh", stock: 0.25, bond: 0.03 },
  { id: "flat", label: "Đi ngang", stock: 0.05, bond: 0.06 },
  { id: "down", label: "Sụt giảm", stock: -0.3, bond: 0.05 },
] as const;
export const MARKET_SCENARIOS_SOURCE = "w5-balanced";

/** Typical yearly management-cost ranges in Vietnam, from the active vs passive article. */
export const FEE_RANGES = {
  passive: { min: 0.005, max: 0.008 },
  active: { min: 0.015, max: 0.025 },
  sourceId: "w5-active-passive",
};

/** "100 − tuổi": reference equity weight; 120 − tuổi for people who accept more risk. */
export const AGE_RULE = { base: 100, bold: 120, sourceId: "amdd-no-timing" };
