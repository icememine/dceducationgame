import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BANDS, OVERRIDES, PROFILES, RISK_QUESTIONS, scoreRisk, type RiskChoices } from "./index";

// The standalone prototype can't import TS, so it carries a JS copy of the scorer between markers.
const src = readFileSync("prototype/src/app1.js", "utf8");
const body = src.slice(src.indexOf("/* risk-score:start"), src.indexOf("/* risk-score:end */"));
const protoScore = new Function(`${body}; return scoreRiskModel;`)() as (model: unknown, choices: RiskChoices) => unknown;

describe("prototype risk scorer", () => {
  it("agrees with content/risk on every possible set of answers", () => {
    const model = { questions: RISK_QUESTIONS, bands: BANDS, overrides: OVERRIDES, profiles: PROFILES };
    let checked = 0;
    const walk = (i: number, choices: RiskChoices) => {
      if (i === RISK_QUESTIONS.length) {
        expect(protoScore(model, choices)).toEqual(scoreRisk(choices));
        checked++;
        return;
      }
      RISK_QUESTIONS[i].options.forEach((_, j) => walk(i + 1, { ...choices, [RISK_QUESTIONS[i].id]: j }));
    };
    walk(0, {});
    expect(checked).toBe(5 * 4 * 4 * 5 * 4 * 4 * 4);
  });
});
