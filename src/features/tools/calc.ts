/**
 * Math behind the Công cụ calculators. Pure functions, unit-tested in calc.test.ts.
 * Every result is an illustration on stated assumptions, never a promise.
 */
import { ORDER_CALENDAR, ORDER_CUTOFF, type OpenFund } from "@content/library/fund-facts";
import { monthsToTarget } from "@/features/goal-planner/finance";

/** Gain needed to get back to the starting value after a fall of `drop` (0.3 = −30%). */
export const recoveryNeeded = (drop: number) => (drop >= 1 ? Infinity : 1 / (1 - drop) - 1);

/** One-year return of a stock/bond mix in a scenario. */
export const mixReturn = (stockWeight: number, s: { stock: number; bond: number }) => stockWeight * s.stock + (1 - stockWeight) * s.bond;

/** Career-freedom fund: how many months savings cover now, and how long until the target. */
export function runway(i: { monthlySpend: number; targetMonths: number; savings: number; monthly: number; annualReturn: number }) {
  const covered = i.monthlySpend > 0 ? i.savings / i.monthlySpend : 0;
  const target = i.monthlySpend * i.targetMonths;
  const months = monthsToTarget({ initial: i.savings, monthly: i.monthly, annualReturn: i.annualReturn }, target);
  return { covered, target, months };
}
export type RunwayBand = "act" | "build" | "safe" | "ideal";
export const runwayBand = (covered: number, b = { act: 3, safe: 6, good: 12 }): RunwayBand =>
  covered < b.act ? "act" : covered < b.safe ? "build" : covered < b.good ? "safe" : "ideal";

/** Cost of `years` of study starting in `yearsUntil` years, with costs growing `growth` a year. */
export function studyCost(i: { annualUsd: number; usdVnd: number; years: number; yearsUntil: number; growth: number }) {
  let total = 0;
  for (let y = 0; y < i.years; y++) total += i.annualUsd * i.usdVnd * Math.pow(1 + i.growth, i.yearsUntil + y);
  return total;
}

/** Same money, same gross return, two yearly fees: value after `years`. */
export function feeImpact(i: { amount: number; years: number; gross: number; feeLow: number; feeHigh: number }) {
  const at = (fee: number, y: number) => i.amount * Math.pow(1 + i.gross - fee, y);
  const series = Array.from({ length: i.years + 1 }, (_, y) => ({ year: y, low: at(i.feeLow, y), high: at(i.feeHigh, y) }));
  const last = series[i.years];
  return { series, low: last.low, high: last.high, gap: last.low - last.high };
}

/** Monthly investing (DCA) vs investing the same total at the first price. */
export function dca(prices: number[], monthly: number) {
  const units = prices.reduce((u, p) => u + monthly / p, 0);
  const invested = monthly * prices.length;
  const last = prices[prices.length - 1];
  const lumpUnits = invested / prices[0];
  return {
    invested,
    units,
    avgCost: invested / units,
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    value: units * last,
    lumpValue: lumpUnits * last,
  };
}

export type DcaPath = "up" | "dip" | "flat";
/** Illustrative NAV paths over `months` (start 10.000đ). Not fund data. */
export function dcaPrices(kind: DcaPath, months = 24): number[] {
  return Array.from({ length: months }, (_, m) => {
    const t = m / (months - 1);
    const wobble = 1 + 0.03 * Math.sin(m * 1.3);
    if (kind === "up") return Math.round(10_000 * (1 + 0.6 * t) * wobble);
    if (kind === "dip") return Math.round(10_000 * (t < 0.4 ? 1 - 0.75 * t : 0.7 + 0.6 * (t - 0.4)) * wobble);
    return Math.round(10_000 * (1 + 0.12 * Math.sin(t * Math.PI * 3)) * wobble);
  });
}

/** A stock/bond mix after one scenario year, and the trade that restores the target weights. */
export function rebalance(amount: number, stockWeight: number, s: { stock: number; bond: number }) {
  const stock = amount * stockWeight * (1 + s.stock);
  const bond = amount * (1 - stockWeight) * (1 + s.bond);
  const total = stock + bond;
  const drifted = total ? stock / total : 0;
  /** Positive: sell this much stock and buy bonds; negative: the reverse. */
  const sellStock = stock - total * stockWeight;
  return { stock, bond, total, drifted, sellStock };
}

/** Reference equity weight from age (100 − tuổi, or 120 − tuổi), clamped to 0–100%. */
export const ageRule = (age: number, base: number) => Math.min(100, Math.max(0, base - age)) / 100;

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const isWorkday = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
const prevWorkday = (d: Date) => {
  let x = addDays(d, -1);
  while (!isWorkday(x)) x = addDays(x, -1);
  return x;
};
const addWorkdays = (d: Date, n: number) => {
  let x = d;
  for (let k = 0; k < n; ) {
    x = addDays(x, 1);
    if (isWorkday(x)) k++;
  }
  return x;
};

/**
 * Order lifecycle for an open fund: an order placed at `at` trades at the first trading day T
 * whose previous working day's cut-off (14:30) has not passed. Proceeds of a sale arrive
 * `cashDays` working days after T. Public holidays are ignored.
 */
export function orderTimeline(fund: OpenFund, at: Date) {
  const cal = ORDER_CALENDAR[fund];
  if (!cal) return undefined;
  const cutoffPassed = (day: Date) => {
    const c = new Date(day.getFullYear(), day.getMonth(), day.getDate(), ORDER_CUTOFF.hour, ORDER_CUTOFF.minute);
    return at.getTime() >= c.getTime();
  };
  let t = addDays(at, 1);
  for (let guard = 0; guard < 30; guard++, t = addDays(t, 1)) {
    if (!cal.weekdays.includes(t.getDay())) continue;
    if (!cutoffPassed(prevWorkday(t))) break;
  }
  const cutoffDay = prevWorkday(t);
  return { tradeDate: t, cutoffDay, cashDate: addWorkdays(t, cal.cashDays), cashDays: cal.cashDays };
}
