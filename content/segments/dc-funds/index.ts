import type { SegmentInput } from "../../schema";
import { unit as family } from "./a1-family";
import { unit as orders } from "./a2-orders";
import { unit as performance } from "./a4-performance";
import { unit as safety } from "./a8-safety";

/**
 * Segment A — Quỹ DC & DragonX. One file per unit, in the order of the outline
 * (content/outline/stage-a-dc-funds.ts).
 * Source: the Q&A library (content/library), merged from "Tư vấn sản phẩm hoàn chỉnh" and
 * "FAQ Tư vấn IS". Fee, tax and schedule numbers must match content/library/fund-facts.ts;
 * the content test checks the ones quoted here. Graded items follow the quiz formula:
 * context → question → 3 options → insight.
 */
export const dcFunds = {
  id: "dc-funds",
  code: "DC",
  title: "Quỹ DC & DragonX",
  subtitle: "Sản phẩm · Đặt lệnh · Phí · Hiệu suất · ETF · Tài khoản · Hạn mức · An toàn · Sở hữu",
  heartsEnabled: true,
  units: [family, orders, performance, safety],
} satisfies SegmentInput;
