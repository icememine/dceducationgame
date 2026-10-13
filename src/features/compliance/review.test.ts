import { describe, expect, it } from "vitest";
import { applyDecision, RISK_QUESTIONS, scoreRisk, specialCases } from "@content/risk";
import { aiFlagLabel, parseStatus, riskAudit, toCsv, vnDayEnd, vnDayStart, type RiskRow } from "./review";

const choices = Object.fromEntries(RISK_QUESTIONS.map((q) => [q.id, q.options.length - 1]));
choices["b1-q-knowledge"] = 0; // no investing knowledge → rule ② applies
const result = scoreRisk(choices);
const row = (over: Partial<RiskRow> = {}): RiskRow => ({
  id: 7, userId: "anon-1234567890abcdef", nickname: "Rồng Thử", profile: result.profile, finalProfile: null, decision: null,
  frameworkVersion: "2.3", dimensions: { ...result, choices }, flags: [], acknowledgedAt: null, confirmedAt: null, createdAt: new Date("2026-10-13T03:00:00Z"), ...over,
});

describe("compliance review", () => {
  it("explains a risk confirmation in plain words, with every answer", () => {
    const final = applyDecision(result.profile, "higher");
    const a = riskAudit(row({ decision: "higher", finalProfile: final, acknowledgedAt: new Date(), flags: specialCases(result, final, "higher", choices) }));
    expect(a.decision).toBe("Chọn cao hơn");
    expect(a.acknowledged).toBe(true);
    expect(a.overrides.length).toBeGreaterThan(0);
    expect(a.flags.map((f) => f.id)).toContain("chose-higher");
    expect(a.attention).toBe(true);
    expect(a.answers).toHaveLength(RISK_QUESTIONS.length);
    expect(a.answers.every((x) => x.answer !== "—")).toBe(true);
    expect(a.learnerRef).toBe("90abcdef");
  });

  it("marks unconfirmed results without calling them a problem", () => {
    const a = riskAudit(row());
    expect(a.decision).toBe("Chưa xác nhận");
    expect(a.flags.map((f) => f.id)).toEqual(["unconfirmed"]);
    expect(a.attention).toBe(false);
  });

  it("parses filters and writes Excel-safe CSV", () => {
    expect(parseStatus("ok")).toBe("ok");
    expect(parseStatus("nope")).toBe("todo");
    expect(vnDayStart("2026-10-13")?.toISOString()).toBe("2026-10-12T17:00:00.000Z");
    expect(vnDayEnd("2026-10-13")?.toISOString()).toBe("2026-10-13T17:00:00.000Z");
    expect(vnDayStart("13/10/2026")).toBeUndefined();
    expect(toCsv(["a", "b"], [['x,"y"', 1], [null, "dòng\nmới"]])).toBe('\uFEFFa,b\r\n"x,""y""",1\r\n,"dòng\nmới"\r\n');
    expect(aiFlagLabel("promise")).toMatch(/hứa hẹn/);
    expect(aiFlagLabel("new-flag")).toBe("new-flag");
  });
});
