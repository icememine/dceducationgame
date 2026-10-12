import { describe, expect, it } from "vitest";
import { cagr, formatDuration, futureValue, monthsToTarget, requiredMonthly } from "./finance";

describe("goal planner finance", () => {
  it("matches the '1 tỷ đầu tiên' article: 5tr/month @15% ≈ 8y4m, ~504tr contributed", () => {
    const months = monthsToTarget({ initial: 0, monthly: 5_000_000, annualReturn: 0.15 }, 1_000_000_000);
    expect(months).toBeGreaterThan(100);
    expect(months).toBeLessThan(101);
    expect(formatDuration(months)).toBe("8 năm 4 tháng");
    expect(months * 5).toBeCloseTo(504, 0); // triệu đồng contributed
  });

  it("10tr/month @15% reaches 1 tỷ in roughly 5.5 years", () => {
    const months = monthsToTarget({ initial: 0, monthly: 10_000_000, annualReturn: 0.15 }, 1_000_000_000);
    expect(months / 12).toBeGreaterThan(5.3);
    expect(months / 12).toBeLessThan(5.6);
  });

  it("doubling in 5 years needs ~14.9%/year (FAQ câu 21)", () => {
    expect(cagr(1, 2, 5) * 100).toBeCloseTo(14.87, 1);
  });

  it("requiredMonthly inverts futureValue", () => {
    const pmt = requiredMonthly(4_200_000_000, 120, 0, 0.13);
    expect(futureValue({ initial: 0, monthly: pmt, annualReturn: 0.13 }, 120)).toBeCloseTo(4_200_000_000, -3);
    // AMDD "chiếc vali": ~18 triệu/tháng for 10 years at 13%.
    expect(pmt / 1e6).toBeGreaterThan(17);
    expect(pmt / 1e6).toBeLessThan(19);
  });

  it("handles zero return and unreachable targets", () => {
    expect(monthsToTarget({ initial: 0, monthly: 1, annualReturn: 0 }, 12)).toBe(12);
    expect(monthsToTarget({ initial: 0, monthly: 0, annualReturn: 0.1 }, 12)).toBe(Infinity);
  });
});
