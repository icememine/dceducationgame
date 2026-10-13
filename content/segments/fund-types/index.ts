import type { SegmentInput } from "../../schema";
import { unit as fund101 } from "./c0-fund-101";
import { unit as moneyMarket } from "./c1-money-market";
import { unit as equity } from "./c3-equity-funds";
import { unit as index } from "./c4-index-passive";
import { unit as activePassive } from "./c6-active-passive";
import { unit as balanced } from "./c5-balanced";
import { unit as portfolio } from "./c8-portfolio";

/**
 * Segment C — Hiểu quỹ. One file per unit, in the order of the outline
 * (content/outline/stage-c-know-funds.ts). Sources: the Week 5 articles (MMF, index fund,
 * active vs passive, bond, balanced), the Q&A library and the fund facts.
 * The bond-fund unit is parked for the advanced program (content/advanced/bond-funds.ts).
 * Graded items follow the quiz formula (docs/QUIZ_FORMULA.md).
 */
export const fundTypes = {
  id: "fund-types",
  code: "LOẠI",
  title: "Hiểu quỹ",
  subtitle: "Quỹ 101 · Tiền tệ · Cổ phiếu · Chỉ số · Chủ động/thụ động · Cân bằng · Danh mục",
  heartsEnabled: true,
  units: [fund101, moneyMarket, equity, index, activePassive, balanced, portfolio],
} satisfies SegmentInput;
