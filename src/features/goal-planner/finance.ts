/**
 * Goal-planner math. Uses a nominal monthly rate (annual / 12) with contributions at the
 * end of each month — the convention behind the AMDD articles' figures
 * (5 triệu/tháng @15% → ~8 năm 4 tháng to reach 1 tỷ, ~504 triệu contributed).
 * Illustrations only: returns are assumptions, never promises.
 */
export type PlanInput = { initial: number; monthly: number; annualReturn: number };

const monthlyRate = (annual: number) => annual / 12;

export function futureValue({ initial, monthly, annualReturn }: PlanInput, months: number): number {
  const r = monthlyRate(annualReturn);
  if (r === 0) return initial + monthly * months;
  const g = Math.pow(1 + r, months);
  return initial * g + monthly * ((g - 1) / r);
}

/** Fractional months until the plan reaches `target`; Infinity if it never does. */
export function monthsToTarget(plan: PlanInput, target: number): number {
  const { initial, monthly, annualReturn } = plan;
  if (initial >= target) return 0;
  const r = monthlyRate(annualReturn);
  if (r === 0) return monthly > 0 ? (target - initial) / monthly : Infinity;
  // Solve initial·g + monthly·(g−1)/r = target for g = (1+r)^n.
  const g = (target + monthly / r) / (initial + monthly / r);
  return g > 0 && monthly + initial > 0 ? Math.log(g) / Math.log(1 + r) : Infinity;
}

export function requiredMonthly(target: number, months: number, initial: number, annualReturn: number): number {
  const r = monthlyRate(annualReturn);
  const g = Math.pow(1 + r, months);
  const gap = target - initial * g;
  if (gap <= 0) return 0;
  return r === 0 ? gap / months : (gap * r) / (g - 1);
}

/** Compound annual growth rate. */
export const cagr = (start: number, end: number, years: number) => Math.pow(end / start, 1 / years) - 1;

/** Yearly points for the planner chart: what you put in vs. what it could become. */
export function projection(plan: PlanInput, years: number) {
  return Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    contributed: plan.initial + plan.monthly * 12 * y,
    value: futureValue(plan, 12 * y),
  }));
}

export function formatDuration(months: number): string {
  if (!Number.isFinite(months)) return "không đạt được";
  const whole = Math.floor(months);
  const y = Math.floor(whole / 12);
  const m = whole % 12;
  return [y ? `${y} năm` : "", m ? `${m} tháng` : ""].filter(Boolean).join(" ") || "dưới 1 tháng";
}
