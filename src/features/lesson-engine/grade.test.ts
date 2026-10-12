import { describe, expect, it } from "vitest";
import { findLesson, segments } from "@content/index";
import type { Challenge } from "@content/schema";
import { grade, parseLocaleNumber, toClientChallenge } from "./grade";
import { permutation } from "./shuffle";

const challenge = (lessonId: string, id: string) => {
  const c = findLesson(lessonId)!.lesson.challenges.find((x) => x.id === id);
  if (!c) throw new Error(id);
  return c;
};

describe("lesson engine", () => {
  it("never sends answer keys or explanations to the client", () => {
    for (const s of segments)
      for (const u of s.units)
        for (const l of u.lessons)
          for (const c of l.challenges) {
            const json = JSON.stringify(toClientChallenge(c));
            expect(json).not.toMatch(/"(answer|pairs|explain|score|tolerance)":/);
          }
  });

  it("shuffles select options and maps the shown position back", () => {
    const c = challenge("a1-ccq-nav", "a1-nav-def") as Extract<Challenge, { type: "select" }>;
    const client = toClientChallenge(c) as { options: string[] };
    const shownCorrect = client.options.indexOf(c.options[c.answer]);
    expect(shownCorrect).not.toBe(-1);
    expect(grade(c, { type: "select", choice: shownCorrect }).correct).toBe(true);
    expect(grade(c, { type: "select", choice: (shownCorrect + 1) % c.options.length }).correct).toBe(false);
  });

  it("grades match and order against shuffled positions", () => {
    const m = challenge("a1-ccq-nav", "a1-terms-match") as Extract<Challenge, { type: "match" }>;
    const permM = permutation(m.right.length, m.id);
    const shownPairs = m.pairs.map((orig) => permM.indexOf(orig));
    expect(grade(m, { type: "match", pairs: shownPairs }).correct).toBe(true);

    const o = challenge("a5-stay-safe", "a5-bad-link") as Extract<Challenge, { type: "order" }>;
    const permO = permutation(o.items.length, o.id);
    const shownOrder = o.items.map((_, orig) => permO.indexOf(orig));
    expect(grade(o, { type: "order", order: shownOrder }).correct).toBe(true);
    expect(grade(o, { type: "order", order: [...shownOrder].reverse() }).correct).toBe(false);
  });

  it("grades numeric answers with tolerance and records profile scores", () => {
    const n = challenge("a4-returns", "a4-double-5y");
    expect(grade(n, { type: "numeric", value: 14.87 }).correct).toBe(true);
    expect(grade(n, { type: "numeric", value: 20 }).correct).toBe(false);

    const p = challenge("b1-risk-check", "b1-q-horizon");
    expect(grade(p, { type: "profile", choice: 4 })).toMatchObject({ correct: null, profileScore: { dimension: "horizon", score: 4, max: 4 } });
  });

  it("parses Vietnamese number formats", () => {
    expect(parseLocaleNumber("126,05")).toBe(126.05);
    expect(parseLocaleNumber("23.700")).toBe(23700);
    expect(parseLocaleNumber("1.000.000")).toBe(1000000);
    expect(parseLocaleNumber("14.9")).toBe(14.9);
  });
});
