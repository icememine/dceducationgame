import { describe, expect, it } from "vitest";
import { pickGroup, settleGroup, tierAfter, weekBounds, weekStartOf, zoneOf, MAX_TIER } from "./leagues";

describe("league groups", () => {
  it("uses Monday weeks in Vietnam time", () => {
    expect(weekStartOf("2026-10-13")).toBe("2026-10-12"); // Tuesday → Monday
    expect(weekStartOf("2026-10-18")).toBe("2026-10-12"); // Sunday → same week
    expect(weekStartOf("2026-10-19")).toBe("2026-10-19");
    expect(weekBounds("2026-10-12").from.toISOString()).toBe("2026-10-11T17:00:00.000Z");
  });

  it("fills groups of 30 before opening a new one", () => {
    expect(pickGroup(new Map())).toBe(1);
    expect(pickGroup(new Map([[1, 29]]))).toBe(1);
    expect(pickGroup(new Map([[1, 30]]))).toBe(2);
    expect(pickGroup(new Map([[1, 30], [2, 12]]))).toBe(2);
  });

  it("promotes the top 5 with XP and demotes the bottom 5 in big enough groups", () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ userId: `u${String(i).padStart(2, "0")}`, xp: 120 - i * 10 }));
    const r = settleGroup(rows, 2);
    expect(r.filter((x) => x.outcome === "up").map((x) => x.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(r.filter((x) => x.outcome === "down").map((x) => x.rank)).toEqual([8, 9, 10, 11, 12]);
    expect(settleGroup(rows.slice(0, 6), 2).some((x) => x.outcome === "down")).toBe(false);
    expect(settleGroup(rows, 0).some((x) => x.outcome === "down")).toBe(false);
    expect(settleGroup(rows, MAX_TIER).some((x) => x.outcome === "up")).toBe(false);
    expect(settleGroup([{ userId: "a", xp: 0 }], 1)[0].outcome).toBe("stay");
    expect([tierAfter(0, "down"), tierAfter(MAX_TIER, "up"), tierAfter(2, "up")]).toEqual([0, MAX_TIER, 3]);
    expect([zoneOf(3, 20, 1), zoneOf(18, 20, 1), zoneOf(10, 20, 1)]).toEqual(["up", "down", "stay"]);
  });
});
