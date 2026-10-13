import { describe, expect, it } from "vitest";
import { buildPlanCard, isShareTokenShape, newShareToken, tokenHidesAmounts, type PlanCard, type PlanCardInput } from "./model";

const goal = { kind: "first-billion", target: 1e9, monthly: 5e6, initial: 0, annualReturn: 0.15 };
const confirmed = { profile: "can-bang", finalProfile: "than-trong", frameworkVersion: "2.3", decision: "lower" };
const base: PlanCardInput = { nickname: "Lan", avatar: "grow", risk: confirmed, goals: [goal], hideAmounts: false };

/** Every string on the card except names that legitimately contain digits ("1 tỷ đầu tiên", "Quỹ đầu tư 101"). */
function amountStrings(card: PlanCard): string[] {
  const out: string[] = [card.nickname, card.mascot, card.disclaimer, card.disclaimerLong];
  if (card.profile) out.push(card.profile.name, card.profile.summary);
  if (card.ageRule) out.push(card.ageRule);
  for (const g of card.goals) out.push(...[g.target, g.monthly, g.duration].filter((s): s is string => s !== null));
  return out;
}

describe("buildPlanCard", () => {
  it("uses the final (confirmed) profile, its study fund types and the goal figures", () => {
    const card = buildPlanCard(base);
    expect(card.nickname).toBe("Lan");
    expect(card.mascot).toBe("grow");
    expect(card.profile).toEqual({ id: "than-trong", name: "Thận trọng", summary: "Ưu tiên an toàn, chấp nhận rủi ro nhỏ." });
    expect(card.studyTypes).toEqual(["Quỹ thị trường tiền tệ", "Quỹ cân bằng"]);
    expect(card.goals).toEqual([{ name: "1 tỷ đầu tiên", target: "1 tỷ", monthly: "5 triệu/tháng", duration: "8 năm 4 tháng" }]);
    expect(card.ageRule).toMatch(/100 − tuổi/);
    expect(card.disclaimer).toBe("Thông tin tham khảo, không phải khuyến nghị đầu tư.");
  });

  it("never lists fund names (no recommendation on a public card)", () => {
    const json = JSON.stringify(buildPlanCard({ ...base, risk: { ...confirmed, finalProfile: "rat-mao-hiem" } }));
    for (const fund of ["DCDS", "DCDE", "DCBA", "DCBF", "DCIP"]) expect(json).not.toContain(fund);
  });

  it("falls back to the assessed profile when the decision kept it", () => {
    expect(buildPlanCard({ ...base, risk: { ...confirmed, decision: "agree", finalProfile: null } }).profile?.id).toBe("can-bang");
  });

  it("shows no profile unless it is from the framework and confirmed", () => {
    expect(buildPlanCard({ ...base, risk: { ...confirmed, decision: null } }).profile).toBeNull();
    expect(buildPlanCard({ ...base, risk: { ...confirmed, frameworkVersion: null } }).profile).toBeNull();
    const none = buildPlanCard({ ...base, risk: undefined });
    expect(none.profile).toBeNull();
    expect(none.studyTypes).toEqual([]);
  });

  it("hide-amounts removes every number", () => {
    const shown = buildPlanCard(base);
    expect(amountStrings(shown).some((s) => /\d/.test(s))).toBe(true);
    const hidden = buildPlanCard({ ...base, hideAmounts: true, goals: [goal, { ...goal, kind: "retirement", target: 5e9 }] });
    expect(hidden.goals.map((g) => g.name)).toEqual(["1 tỷ đầu tiên", "Nghỉ hưu"]);
    for (const g of hidden.goals) expect([g.target, g.monthly, g.duration]).toEqual([null, null, null]);
    expect(hidden.ageRule).toBeNull();
    expect(amountStrings(hidden).filter((s) => /\d/.test(s))).toEqual([]);
  });

  it("caps the number of goals", () => {
    const card = buildPlanCard({ ...base, goals: Array.from({ length: 7 }, () => goal) });
    expect(card.goals).toHaveLength(5);
    expect(card.moreGoals).toBe(2);
  });
});

describe("share tokens", () => {
  const uuid = "123e4567-e89b-42d3-a456-426614174000";
  it("encodes hide-amounts as an h- prefix", () => {
    expect(newShareToken(true, uuid)).toBe(`h-${uuid}`);
    expect(newShareToken(false, uuid)).toBe(uuid);
    expect(tokenHidesAmounts(`h-${uuid}`)).toBe(true);
    expect(tokenHidesAmounts(uuid)).toBe(false);
  });
  it("validates token shape", () => {
    expect(isShareTokenShape(newShareToken(true))).toBe(true);
    expect(isShareTokenShape(newShareToken(false))).toBe(true);
    expect(isShareTokenShape("me")).toBe(false);
    expect(isShareTokenShape(`x-${uuid}`)).toBe(false);
  });
});
