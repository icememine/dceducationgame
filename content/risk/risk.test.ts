import { describe, expect, it } from "vitest";
import { findLesson } from "../index";
import { applyDecision, BANDS, needsAcknowledgement, RISK_QUESTIONS, scoreRisk, specialCases, type RiskChoices } from "./index";

/** Answers by points, in question order (Câu 1 … Câu 7), as the framework's scoring sheet reads. */
const pts = (...points: number[]): RiskChoices =>
  Object.fromEntries(
    RISK_QUESTIONS.map((q, i) => {
      const idx = q.options.findIndex((o) => o.points === points[i]);
      if (idx < 0) throw new Error(`Câu ${q.number}: no option worth ${points[i]}`);
      return [q.id, idx];
    }),
  );

describe("risk scoring framework v2.3 · §4", () => {
  it("adds up the 7 answers (7–30) and splits them by part", () => {
    expect(scoreRisk(pts(1, 1, 1, 1, 1, 1, 1))).toMatchObject({ total: 7, scored: "rat-than-trong" });
    const top = scoreRisk(pts(5, 4, 4, 5, 4, 4, 4));
    expect(top.total).toBe(30);
    expect(top.sections).toEqual({ A: 5, B: 13, C: 8, D: 4 });
    expect(top.profile).toBe("rat-mao-hiem");
  });

  it("maps totals to the §4.2 bands at every boundary", () => {
    const at = (total: number) => BANDS.find((b) => total >= b.min && total <= b.max)?.profile;
    expect([8, 9, 13, 14, 18, 19, 23, 24].map(at)).toEqual([
      "rat-than-trong", "than-trong", "than-trong", "can-bang", "can-bang", "kha-mao-hiem", "kha-mao-hiem", "rat-mao-hiem",
    ]);
    // A real answer set landing on 19: 4+3+3+4+2+2+1
    expect(scoreRisk(pts(4, 3, 3, 4, 2, 2, 1)).total).toBe(19);
  });

  it("① caps a horizon under 1 year at Thận trọng, with the reason", () => {
    const r = scoreRisk(pts(1, 4, 4, 5, 4, 4, 4));
    expect(r.scored).toBe("rat-mao-hiem");
    expect(r.profile).toBe("than-trong");
    expect(r.overrides.map((o) => o.rule)).toEqual(["horizon"]);
  });

  it("② starts a first-time investor at Cân bằng, but never raises a lower result", () => {
    expect(scoreRisk(pts(5, 4, 4, 5, 4, 4, 1))).toMatchObject({ scored: "rat-mao-hiem", profile: "can-bang" });
    expect(scoreRisk(pts(2, 2, 2, 2, 2, 2, 1))).toMatchObject({ profile: "than-trong", overrides: [] });
  });

  it("③ warns when over 20% of assets is in a high-risk profile, and requires acknowledgement", () => {
    const r = scoreRisk(pts(5, 4, 4, 5, 4, 2, 4));
    expect(r.total).toBe(28);
    expect(r.capacityWarning).toBeTruthy();
    expect(needsAcknowledgement(r, "agree")).toBe(true);
    expect(needsAcknowledgement(r, "lower")).toBe(false);
    expect(scoreRisk(pts(5, 4, 4, 5, 4, 3, 4)).capacityWarning).toBeUndefined();
  });

  it("④ flags low accepted volatility combined with buying the dip", () => {
    expect(scoreRisk(pts(3, 3, 4, 2, 3, 3, 2)).inconsistency).toBeTruthy();
    expect(scoreRisk(pts(3, 3, 4, 3, 3, 3, 2)).inconsistency).toBeUndefined();
  });
});

describe("risk scoring framework v2.3 · §5", () => {
  it("moves one step lower or higher, within the scale", () => {
    expect(applyDecision("can-bang", "lower")).toBe("than-trong");
    expect(applyDecision("can-bang", "higher")).toBe("kha-mao-hiem");
    expect(applyDecision("rat-than-trong", "lower")).toBe("rat-than-trong");
    expect(applyDecision("rat-mao-hiem", "higher")).toBe("rat-mao-hiem");
    expect(needsAcknowledgement(scoreRisk(pts(3, 3, 3, 3, 3, 3, 3)), "higher")).toBe(true);
  });

  it("flags the §5.2 special cases on the confirmed profile", () => {
    const choices = pts(5, 4, 4, 5, 4, 4, 1);
    const r = scoreRisk(choices); // Cân bằng after ②
    expect(specialCases(r, applyDecision(r.profile, "higher"), "higher", choices)).toEqual(["first-time-high-risk", "chose-higher"]);
    const short = pts(2, 4, 3, 4, 2, 2, 3); // < 3 years, part B = 11
    expect(specialCases(scoreRisk(short), "kha-mao-hiem", "agree", short)).toEqual(expect.arrayContaining(["short-horizon-high-tolerance", "low-capacity-high-risk"]));
  });

  it("asks exactly the framework's 7 questions in the lesson, in order", () => {
    const lesson = findLesson("b1-risk-check")!.lesson;
    expect(lesson.challenges.filter((c) => c.type === "profile").map((c) => c.id)).toEqual(RISK_QUESTIONS.map((q) => q.id));
    expect(RISK_QUESTIONS.map((q) => q.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
