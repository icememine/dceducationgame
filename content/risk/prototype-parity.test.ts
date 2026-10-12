import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_LEVEL, PROFILE_IDS, RISK_NOTES, RISK_QUESTIONS, scoreRisk, type RiskChoices } from "./index";

// The standalone prototype can't import TS, so it carries a JS copy of the scorer between markers.
const src = readFileSync("prototype/src/app1.js", "utf8");
const body = src.slice(src.indexOf("/* risk-score:start"), src.indexOf("/* risk-score:end */"));
const protoScore = new Function(`${body}; return scoreRiskModel;`)() as (
  model: unknown,
  choices: RiskChoices,
) => { final: number; willing: number; reasons: { reason: string }[]; notes: string[] };

describe("prototype risk scorer", () => {
  it("agrees with content/risk on every possible set of answers", () => {
    const model = { questions: RISK_QUESTIONS, notes: RISK_NOTES, defaultLevel: DEFAULT_LEVEL };
    let checked = 0;
    const walk = (i: number, choices: RiskChoices) => {
      if (i === RISK_QUESTIONS.length) {
        const a = scoreRisk(choices);
        const b = protoScore(model, choices);
        expect([PROFILE_IDS[b.final], PROFILE_IDS[b.willing], b.reasons.map((r) => r.reason), b.notes]).toEqual([a.profile, a.willing, a.reasons.map((r) => r.reason), a.notes]);
        checked++;
        return;
      }
      RISK_QUESTIONS[i].options.forEach((_, j) => walk(i + 1, { ...choices, [RISK_QUESTIONS[i].id]: j }));
    };
    walk(0, {});
    expect(checked).toBeGreaterThan(1000);
  });
});
