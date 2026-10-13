import { describe, expect, it } from "vitest";
import { AGE_RULE, EDU_COST, MARKET_SCENARIOS, RUNWAY } from "@content/tools/presets";
import { requiredMonthly } from "@/features/goal-planner/finance";
import { ageRule, dca, dcaPrices, feeImpact, mixReturn, orderTimeline, rebalance, recoveryNeeded, runway, runwayBand, studyCost } from "./calc";

const scenario = (id: string) => MARKET_SCENARIOS.find((s) => s.id === id)!;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("Công cụ calculators", () => {
  it("reproduces the balanced-fund article's scenario table and recovery figures", () => {
    expect(mixReturn(0.5, scenario("up"))).toBeCloseTo(0.14);
    expect(mixReturn(0.5, scenario("flat"))).toBeCloseTo(0.055);
    expect(mixReturn(0.5, scenario("down"))).toBeCloseTo(-0.125);
    expect(recoveryNeeded(0.3)).toBeCloseTo(0.43, 2);
    expect(recoveryNeeded(0.125)).toBeCloseTo(0.14, 2);
  });

  it("reproduces the career-fund article: 180 triệu in ~3,8 / 2,5 / 1,4 years at 3 / 5 / 10 triệu", () => {
    const years = (monthly: number) => runway({ ...RUNWAY, savings: 0, monthly }).months / 12;
    expect(runway({ ...RUNWAY, savings: 0, monthly: 5e6 }).target).toBe(180_000_000);
    expect(years(3e6)).toBeCloseTo(3.8, 1);
    expect(years(5e6)).toBeCloseTo(2.5, 1);
    expect(years(10e6)).toBeCloseTo(1.4, 1);
    expect([runwayBand(2), runwayBand(4), runwayBand(8), runwayBand(14)]).toEqual(["act", "build", "safe", "ideal"]);
  });

  it("reproduces the study-abroad article: 4,2 tỷ, about 18 triệu/tháng from age 8", () => {
    const total = studyCost({ ...EDU_COST, yearsUntil: 0, growth: 0 });
    expect(total).toBeCloseTo(EDU_COST.totalVnd);
    const monthly = requiredMonthly(total, (EDU_COST.startAge - EDU_COST.childAge) * 12, 0, EDU_COST.annualReturn);
    expect(Math.abs(monthly / 1e6 - 18)).toBeLessThan(1);
    expect(studyCost({ ...EDU_COST, yearsUntil: 10, growth: 0.05 })).toBeGreaterThan(total);
  });

  it("computes fee drag and DCA averages", () => {
    const f = feeImpact({ amount: 100, years: 1, gross: 0.12, feeLow: 0.005, feeHigh: 0.02 });
    expect(f.gap).toBeCloseTo(1.5);
    const d = dca([10, 5, 10], 100);
    expect(d.units).toBeCloseTo(40);
    expect(d.avgCost).toBeCloseTo(7.5); // below the average price (8,33): more units bought when cheap
    expect(d.lumpValue).toBeCloseTo(300);
    expect(dcaPrices("dip")).toHaveLength(24);
  });

  it("rebalances a drifted 60/40 mix back to target", () => {
    const r = rebalance(100, 0.6, scenario("up"));
    expect(r.drifted).toBeGreaterThan(0.6);
    expect(r.stock - r.sellStock).toBeCloseTo(r.total * 0.6);
    expect(ageRule(30, AGE_RULE.base)).toBe(0.7);
    expect(ageRule(10, AGE_RULE.bold)).toBe(1);
  });

  it("dates an order like the lessons do (cut-off 14:30 on T-1, cash T+n)", () => {
    // Monday 10:00 sell DCDS → trades Tuesday, cash Thursday (a3-missing-units case).
    const mon = orderTimeline("DCDS", new Date(2026, 9, 12, 10, 0))!;
    expect([ymd(mon.tradeDate), ymd(mon.cashDate)]).toEqual(["2026-10-13", "2026-10-15"]);
    // Tuesday 15:00 misses Wednesday's cut-off.
    expect(ymd(orderTimeline("DCDS", new Date(2026, 9, 13, 15, 0))!.tradeDate)).toBe("2026-10-15");
    // Saturday → Tuesday (Monday's cut-off was Friday 14:30).
    expect(ymd(orderTimeline("DCDE", new Date(2026, 9, 17, 9, 0))!.tradeDate)).toBe("2026-10-20");
    // DCBF trades Wed/Fri and pays T+5; Tuesday 15:00 → Friday, cash next Friday.
    const bf = orderTimeline("DCBF", new Date(2026, 9, 13, 15, 0))!;
    expect([ymd(bf.tradeDate), ymd(bf.cashDate)]).toEqual(["2026-10-16", "2026-10-23"]);
    expect(ymd(orderTimeline("DCIP", new Date(2026, 9, 12, 10, 0))!.cashDate)).toBe("2026-10-13");
    expect(orderTimeline("DCBA", new Date())).toBeUndefined();
  });
});
