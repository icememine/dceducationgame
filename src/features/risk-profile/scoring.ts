import type { RiskDimension } from "@content/schema";

export type ProfileAnswer = { dimension: RiskDimension; score: number; max: number };

export const PROFILES = ["bao-toan", "than-trong", "can-bang", "tang-truong", "nang-dong"] as const;
export type ProfileId = (typeof PROFILES)[number];

export type ProfileInfo = {
  id: ProfileId;
  name: string;
  summary: string;
  mascot: string;
  /** Fund TYPES to study first (segment C unit ids). Education, not a recommendation. */
  studyUnits: string[];
  /** DC funds whose fact sheets are most relevant to read. Shown with a disclaimer. */
  relevantFunds: string[];
};

export const PROFILE_INFO: Record<ProfileId, ProfileInfo> = {
  "bao-toan": {
    id: "bao-toan", name: "Bảo toàn", mascot: "save",
    summary: "Ưu tiên giữ vốn và thanh khoản, chấp nhận lợi nhuận thấp hơn.",
    studyUnits: ["c1-money-market", "c2-bond-funds"], relevantFunds: ["DCIP", "DCBF"],
  },
  "than-trong": {
    id: "than-trong", name: "Thận trọng", mascot: "study",
    summary: "Chấp nhận biến động nhỏ để có thu nhập ổn định hơn tiền gửi.",
    studyUnits: ["c2-bond-funds", "c5-balanced"], relevantFunds: ["DCBF", "DCIP", "DCBA"],
  },
  "can-bang": {
    id: "can-bang", name: "Cân bằng", mascot: "grow",
    summary: "Cân bằng giữa tăng trưởng và kiểm soát biến động.",
    studyUnits: ["c5-balanced", "c4-index-passive"], relevantFunds: ["DCBA", "DCBF", "DCDE"],
  },
  "tang-truong": {
    id: "tang-truong", name: "Tăng trưởng", mascot: "analyze",
    summary: "Mục tiêu dài hạn, chịu được những đợt giảm đáng kể.",
    studyUnits: ["c3-equity-funds", "c4-index-passive", "c5-balanced"], relevantFunds: ["DCDE", "DCDS", "DCBA"],
  },
  "nang-dong": {
    id: "nang-dong", name: "Năng động", mascot: "fight",
    summary: "Chấp nhận biến động lớn để tìm tăng trưởng vốn dài hạn.",
    studyUnits: ["c3-equity-funds", "c4-index-passive"], relevantFunds: ["DCDS", "DCDE", "ETF"],
  },
};

export type ProfileResult = {
  profile: ProfileId;
  /** 0–100 per dimension (absent if the learner skipped every item for it). */
  dimensions: Partial<Record<RiskDimension, number>>;
  /** True when capacity/horizon pulled the result below what willingness alone suggested. */
  capped: boolean;
};

const band = (pct: number): number => (pct < 20 ? 0 : pct < 40 ? 1 : pct < 60 ? 2 : pct < 80 ? 3 : 4);

/**
 * Willingness (tolerance + knowledge) sets the starting band; ability (capacity + horizon)
 * caps it. Someone who loves risk but needs the money next year is not "Năng động".
 */
export function scoreProfile(answers: ProfileAnswer[]): ProfileResult {
  const dims: Partial<Record<RiskDimension, number>> = {};
  for (const d of ["capacity", "tolerance", "horizon", "knowledge"] as const) {
    const items = answers.filter((a) => a.dimension === d);
    const max = items.reduce((s, a) => s + a.max, 0);
    if (max > 0) dims[d] = Math.round((items.reduce((s, a) => s + a.score, 0) / max) * 100);
  }
  const avg = (...xs: (number | undefined)[]) => {
    const v = xs.filter((x): x is number => x !== undefined);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 50;
  };
  const willingness = band(avg(dims.tolerance, dims.tolerance, dims.knowledge));
  const ability = band(Math.min(dims.capacity ?? 100, dims.horizon ?? 100));
  const final = Math.min(willingness, ability);
  return { profile: PROFILES[final], dimensions: dims, capped: ability < willingness };
}
