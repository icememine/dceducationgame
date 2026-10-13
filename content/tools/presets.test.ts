import { PROFILE_IDS } from "../risk/risk-model";
import { AGE_RULE_BY_PROFILE } from "./presets";
import { describe, expect, it } from "vitest";
import { futureValue, monthsToTarget, requiredMonthly } from "@/features/goal-planner/finance";
import { sourceById } from "../sources";
import { PLANNER_PRESETS, START_EARLY } from "./presets";

const preset = (kind: string) => PLANNER_PRESETS.find((p) => p.kind === kind)!;

describe("planner presets match the numbers their notes quote", () => {
  it("1 tỷ đầu tiên: 5 triệu/tháng @15% ≈ 8 năm 4 tháng, ~504 triệu góp", () => {
    const p = preset("first-billion");
    const m = monthsToTarget(p, p.target);
    expect(Math.floor(m)).toBe(100);
    expect(Math.round((p.monthly * m) / 1e6)).toBeGreaterThan(495);
    expect(Math.round((p.monthly * m) / 1e6)).toBeLessThan(510);
  });

  it("Du học: 4,2 tỷ in 10 years @13% needs about 18 triệu/tháng", () => {
    const p = preset("education");
    // The article's "khoảng 18 triệu" uses a slightly different compounding convention; ours gives ~17,2.
    expect(Math.abs(requiredMonthly(p.target, 120, 0, p.annualReturn) / 1e6 - 18)).toBeLessThan(1);
  });

  it("Tự do sự nghiệp: 180 triệu with 5 triệu/tháng @15% takes about 2,5 năm", () => {
    const p = preset("emergency");
    expect(monthsToTarget(p, p.target) / 12).toBeCloseTo(2.5, 0);
  });

  it("cites published sources only, and the early starter always ends ahead", () => {
    for (const p of PLANNER_PRESETS) {
      const src = sourceById(p.sourceId);
      expect(src, p.kind).toBeDefined();
      expect(src && "internal" in src, p.kind).toBeFalsy();
    }
    const v = (start: number) => futureValue({ initial: 0, monthly: START_EARLY.monthly, annualReturn: START_EARLY.annualReturn }, (START_EARLY.endAge - start) * 12);
    expect(v(START_EARLY.early.startAge)).toBeGreaterThan(5 * v(START_EARLY.late.startAge));
  });

  it("links every risk profile to an age-rule variant", () => {
    expect(Object.keys(AGE_RULE_BY_PROFILE).sort()).toEqual([...PROFILE_IDS].sort());
  });
});
