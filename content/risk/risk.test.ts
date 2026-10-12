import { describe, expect, it } from "vitest";
import { findLesson } from "../index";
import { RISK_QUESTIONS, scoreRisk, type RiskChoices } from "./index";

/** Choice by option label, so tests read like the questionnaire. */
const answers = (byLabel: Record<string, string>): RiskChoices =>
  Object.fromEntries(
    Object.entries(byLabel).map(([id, label]) => {
      const i = RISK_QUESTIONS.find((q) => q.id === id)!.options.findIndex((o) => o.label === label);
      if (i < 0) throw new Error(`${id}: no option "${label}"`);
      return [id, i];
    }),
  );

const comfortable = {
  "b1-q-horizon": "5 – 10 năm",
  "b1-q-emergency": "3 – 6 tháng",
  "b1-q-income-share": "Có ảnh hưởng nhưng vẫn ổn",
  "b1-q-drawdown": "Giữ nguyên, tiếp tục kế hoạch",
  "b1-q-knowledge": "Chỉ gửi tiết kiệm",
};

describe("risk self-check", () => {
  it("gives Tăng trưởng to someone who picks +20% / −15% and keeps the plan (the reported bug)", () => {
    const r = scoreRisk(answers({ ...comfortable, "b1-q-tradeoff": "+20% / −15%" }));
    expect(r).toMatchObject({ profile: "tang-truong", willing: "tang-truong", reasons: [], notes: [] });
  });

  it("maps each portfolio choice to its own profile when it is the only willingness answer", () => {
    const expected = ["bao-toan", "than-trong", "can-bang", "tang-truong", "nang-dong"];
    const portfolios = RISK_QUESTIONS.find((q) => q.id === "b1-q-tradeoff")!.options;
    portfolios.forEach((o, i) => {
      const { "b1-q-drawdown": _skip, ...rest } = { ...comfortable, "b1-q-knowledge": "Quỹ cổ phiếu hoặc ETF" };
      const r = scoreRisk(answers({ ...rest, "b1-q-tradeoff": o.label }));
      expect(r.willing, o.label).toBe(expected[i]);
    });
  });

  it("explains every limit that lowers the result", () => {
    const r = scoreRisk(answers({ ...comfortable, "b1-q-horizon": "1 – 3 năm", "b1-q-tradeoff": "+20% / −15%" }));
    expect(r.profile).toBe("than-trong");
    expect(r.willing).toBe("tang-truong");
    expect(r.reasons.map((x) => x.questionId)).toEqual(["b1-q-horizon"]);
    expect(r.reasons[0].reason).toMatch(/1–3 năm/);
  });

  it("never lowers a beginner below Tăng trưởng for lack of experience alone", () => {
    const r = scoreRisk(answers({ ...comfortable, "b1-q-drawdown": "Mua thêm theo kế hoạch đã định", "b1-q-tradeoff": "+35% / −30%" }));
    expect(r.profile).toBe("tang-truong");
    expect(r.reasons).toHaveLength(1);
  });

  it("points out contradictory answers", () => {
    const r = scoreRisk(answers({ ...comfortable, "b1-q-drawdown": "Bán bớt một phần", "b1-q-tradeoff": "+20% / −15%" }));
    expect(r.profile).toBe("can-bang");
    expect(r.notes).toHaveLength(1);
  });

  it("is monotonic: a bolder portfolio choice never gives a lower result", () => {
    const n = RISK_QUESTIONS.find((q) => q.id === "b1-q-tradeoff")!.options.length;
    const levels = Array.from({ length: n }, (_, i) => scoreRisk({ ...answers(comfortable), "b1-q-tradeoff": i }).willing);
    const order = ["bao-toan", "than-trong", "can-bang", "tang-truong", "nang-dong"];
    for (let i = 1; i < n; i++) expect(order.indexOf(levels[i])).toBeGreaterThanOrEqual(order.indexOf(levels[i - 1]));
  });

  it("gives every limiting answer a reason, and the lesson asks exactly these questions", () => {
    for (const q of RISK_QUESTIONS) for (const o of q.options) if (o.cap !== undefined) expect(o.reason, `${q.id}: ${o.label}`).toBeTruthy();
    const lesson = findLesson("b1-risk-check")!.lesson;
    expect(lesson.challenges.filter((c) => c.type === "profile").map((c) => c.id)).toEqual(RISK_QUESTIONS.map((q) => q.id));
  });
});
