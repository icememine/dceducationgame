import { describe, expect, it } from "vitest";
import { getSegment, lessonsOf, segments } from "@content/index";
import { placementItems, unlockIndexFor, PLACEMENT_MAX } from "./placement";

describe("placement test", () => {
  it("asks one graded question per unit, at most 10, from checkpoints when there are any", () => {
    for (const s of segments) {
      const items = placementItems(s);
      expect(items.length).toBe(Math.min(PLACEMENT_MAX, s.units.length));
      expect(new Set(items.map((i) => i.unitId)).size).toBe(items.length);
      for (const i of items) expect(["select", "scenario", "spot"]).toContain(i.challenge.type);
    }
    const plan = getSegment("my-plan")!;
    const money = placementItems(plan).find((i) => i.unitId === "b1-my-money")!;
    expect(money.challenge.id.startsWith("b1m-cp")).toBe(true);
  });

  it("opens lessons up to the first unit missed", () => {
    const s = getSegment("fund-types")!;
    const items = placementItems(s);
    const all = items.map((i) => ({ unitId: i.unitId, correct: true }));
    expect(unlockIndexFor(s, all)).toBe(lessonsOf(s).length);
    const firstTwo = items.map((i, k) => ({ unitId: i.unitId, correct: k < 2 }));
    expect(unlockIndexFor(s, firstTwo)).toBe(s.units[0].lessons.length + s.units[1].lessons.length);
    expect(unlockIndexFor(s, items.map((i) => ({ unitId: i.unitId, correct: false })))).toBe(0);
  });
});
