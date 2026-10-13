import type { SegmentInput } from "../../schema";
import { unit as risk } from "./b1-know-yourself";
import { unit as money } from "./b1-my-money";
import { unit as goals } from "./b2-set-goals";
import { unit as compound } from "./b4-compound";
import { unit as discipline } from "./b3-discipline";
import { unit as market } from "./b6-market";
import { unit as allocation } from "./b7-allocation";

/**
 * Segment B — Hiểu mình. One file per unit, in the order of the outline
 * (content/outline/stage-b-know-yourself.ts), except that the risk assessment comes first:
 * it personalises everything after it. Unit ids are historical; lesson ids are what
 * progress rows reference, so never change those.
 *
 * Graded items follow the quiz formula (docs/QUIZ_FORMULA.md). The risk assessment follows
 * the Risk Scoring Framework v2.3 (content/risk).
 */
export const myPlan = {
  id: "my-plan",
  code: "TÔI",
  title: "Hiểu mình",
  subtitle: "Khẩu vị rủi ro · Tiền của tôi · Mục tiêu · Lãi kép · Kỷ luật · Thị trường · Phân bổ",
  heartsEnabled: false,
  units: [risk, money, goals, compound, discipline, market, allocation],
} satisfies SegmentInput;
