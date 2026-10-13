/**
 * "Bản kế hoạch đầu tư" (FEATURES.md 8.4): the pure card model shared by the private page,
 * the public page /p/[token] and the SVG image. No database or React here, so it is unit-tested.
 *
 * What a PUBLIC card may show: nickname + mascot, the confirmed risk profile (name + summary),
 * the fund TYPES to study for that profile, saved goals and general reference frames from
 * content. It never shows PROFILES[].funds (fund names per profile) — on a shareable card that
 * would read as a product recommendation.
 */
import { getSegment } from "@content/index";
import { profileInfo } from "@content/risk";
import { AGE_RULE } from "@content/tools/presets";
import { formatDuration, monthsToTarget } from "@/features/goal-planner/finance";
import { formatVnd } from "@/lib/utils";

/** Same labels as the profile page. */
export const GOAL_NAME: Record<string, string> = {
  "first-billion": "1 tỷ đầu tiên",
  education: "Du học cho con",
  retirement: "Nghỉ hưu",
  emergency: "Quỹ dự phòng",
  custom: "Mục tiêu riêng",
};

export const PLAN_DISCLAIMER = "Thông tin tham khảo, không phải khuyến nghị đầu tư.";
/** Text of src/components/disclaimer.tsx, for the SVG (which cannot render the component). Keep in sync. */
export const DISCLAIMER_TEXT =
  "Nội dung mang tính giáo dục, không phải khuyến nghị đầu tư. Lợi nhuận minh họa là giả định, kết quả quá khứ không bảo đảm kết quả tương lai. Vui lòng đọc bản cáo bạch trước khi đầu tư.";

export const MAX_GOALS = 5;

/**
 * Hide-amounts flag. The schema has only users.planShareToken (no separate setting), so the
 * choice is encoded in the token itself: tokens starting with "h-" hide every amount on the
 * public card and image ("h-<uuid>"), plain "<uuid>" tokens show them.
 */
export const HIDE_PREFIX = "h-";
export const tokenHidesAmounts = (token: string) => token.startsWith(HIDE_PREFIX);
export const newShareToken = (hideAmounts: boolean, uuid: string = crypto.randomUUID()) => `${hideAmounts ? HIDE_PREFIX : ""}${uuid}`;
/** Shape check before hitting the database (uuid v4 text, optional "h-"). */
export const isShareTokenShape = (token: string) => /^(h-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);

export type PlanRiskInput = {
  profile: string;
  finalProfile: string | null;
  frameworkVersion: string | null;
  decision: string | null;
} | null | undefined;

export type PlanGoalInput = { kind: string; target: number; monthly: number; initial: number; annualReturn: number };

export type PlanCardInput = {
  nickname: string;
  avatar: string;
  risk: PlanRiskInput;
  goals: PlanGoalInput[];
  hideAmounts: boolean;
};

export type PlanCardGoal = {
  name: string;
  /** null when amounts are hidden. */
  target: string | null;
  monthly: string | null;
  duration: string | null;
};

export type PlanCard = {
  nickname: string;
  mascot: string;
  profile: { id: string; name: string; summary: string } | null;
  /** Fund types to study (segment C unit titles), not funds. */
  studyTypes: string[];
  goals: PlanCardGoal[];
  /** How many saved goals were left off the card (MAX_GOALS). */
  moreGoals: number;
  /** General "100 − tuổi" reference frame (not personalised); null when amounts are hidden. */
  ageRule: string | null;
  hideAmounts: boolean;
  disclaimer: string;
  disclaimerLong: string;
};

/** "Phần 2 · Quỹ thị trường tiền tệ" → "Quỹ thị trường tiền tệ". */
const stripPart = (title: string) => title.replace(/^Phần\s+\d+\s*·\s*/, "");

export function unitTitle(id: string): string {
  const unit = getSegment("fund-types")?.units.find((u) => u.id === id);
  return unit ? stripPart(unit.title) : id;
}

export function buildPlanCard({ nickname, avatar, risk, goals, hideAmounts }: PlanCardInput): PlanCard {
  // Only a confirmed result from the framework counts (same rule as the profile page).
  const confirmed = risk?.frameworkVersion && risk.decision ? risk : undefined;
  const info = confirmed ? profileInfo(confirmed.finalProfile ?? confirmed.profile) : undefined;

  return {
    nickname: nickname.trim() || "Nhà đầu tư",
    mascot: avatar,
    profile: info ? { id: info.id, name: info.name, summary: info.summary } : null,
    studyTypes: info ? info.studyUnits.map(unitTitle) : [],
    goals: goals.slice(0, MAX_GOALS).map((g) => ({
      name: GOAL_NAME[g.kind] ?? "Mục tiêu riêng",
      target: hideAmounts ? null : formatVnd(g.target),
      monthly: hideAmounts ? null : `${formatVnd(g.monthly)}/tháng`,
      duration: hideAmounts ? null : formatDuration(monthsToTarget(g, g.target)),
    })),
    moreGoals: Math.max(0, goals.length - MAX_GOALS),
    ageRule: hideAmounts
      ? null
      : `Khung tham khảo chung, không theo hồ sơ riêng: tỷ trọng cổ phiếu khoảng ${AGE_RULE.base} − tuổi, hoặc ${AGE_RULE.bold} − tuổi với người chịu được biến động.`,
    hideAmounts,
    disclaimer: PLAN_DISCLAIMER,
    disclaimerLong: DISCLAIMER_TEXT,
  };
}
