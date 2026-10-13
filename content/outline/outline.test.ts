import { describe, expect, it } from "vitest";
import { findLesson } from "../index";
import { sourceById } from "../sources";
import { advancedUnits, aiScenarios, FAQ_NUMBERS, FORMATS, outline, outlineLessons, TOOLS } from "./index";

const lessons = outlineLessons();
const refOk = (r: string) => (r.startsWith("faq:") ? FAQ_NUMBERS.includes(Number(r.slice(4))) : !!sourceById(r));

describe("lesson outline", () => {
  it("orders the journey Hiểu mình → Hiểu quỹ → Quỹ DC", () => {
    expect(outline.map((s) => s.code)).toEqual(["B", "C", "A"]);
    expect(outline.map((s) => s.order)).toEqual([1, 2, 3]);
  });

  it("has unique lesson and unit codes", () => {
    const codes = lessons.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    const units = outline.flatMap((s) => s.units.map((u) => u.code));
    expect(new Set(units).size).toBe(units.length);
  });

  it("prefixes every lesson code with its unit code", () => {
    for (const l of lessons) expect(l.code.startsWith(`${l.unit}.`)).toBe(true);
  });

  it("cites only known sources and FAQ numbers that exist", () => {
    const bad = [...lessons.flatMap((l) => l.sources), ...aiScenarios.flatMap((s) => s.sources)].filter((r) => !refOk(r));
    expect(bad).toEqual([]);
  });

  it("uses known formats and tools", () => {
    for (const l of lessons) {
      for (const f of l.formats) expect(FORMATS).toHaveProperty(f);
      if (l.tool) expect(TOOLS).toHaveProperty(l.tool);
    }
  });

  it("maps every one of the 133 FAQ questions to a lesson or to Hỏi Rồng", () => {
    const covered = new Set<number>([
      ...lessons.flatMap((l) => l.sources.filter((r) => r.startsWith("faq:")).map((r) => Number(r.slice(4)))),
      ...outline.flatMap((s) => s.askRongOnly ?? []),
      // Units parked for the advanced program still cover their FAQ questions.
      ...advancedUnits.flatMap((u) => u.lessons.flatMap((l) => l.sources.filter((r) => r.startsWith("faq:")).map((r) => Number(r.slice(4))))),
    ]);
    expect(FAQ_NUMBERS.filter((n) => !covered.has(n))).toEqual([]);
  });

  it("points builtAs at lessons that really exist", () => {
    for (const l of lessons.filter((x) => x.builtAs)) expect(findLesson(l.builtAs!), l.code).toBeDefined();
  });

  it("unlocks every AI scenario after a real lesson", () => {
    const codes = new Set(lessons.map((l) => l.code));
    for (const s of aiScenarios) expect(codes.has(s.unlockAfter), s.id).toBe(true);
  });

  it("gives Hiểu mình and Hiểu quỹ the most lessons", () => {
    const count = (c: string) => lessons.filter((l) => l.stage === c).length;
    expect(count("B")).toBeGreaterThan(count("A"));
    expect(count("C")).toBeGreaterThan(30);
  });
});
