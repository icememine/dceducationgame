import { describe, expect, it } from "vitest";
import { dropAt, monthPrices, scoreTiming, simulateReactions, TIMING_DAYS, TIMING_ROUNDS } from "./sims";

describe("reaction simulation", () => {
  it("ranks the three habits the way the DCDS data does: keep > pause > sell", () => {
    const keep = simulateReactions(["keep", "keep", "keep"]).value;
    const pause = simulateReactions(["pause", "pause", "pause"]).value;
    const sell = simulateReactions(["sell", "sell", "sell"]).value;
    expect(keep).toBeGreaterThan(pause);
    expect(pause).toBeGreaterThan(sell);
    expect(simulateReactions(["keep", "keep", "keep"]).invested).toBe(1_200_000_000);
  });

  it("shows real drawdowns at each decision point", () => {
    for (const i of [0, 1, 2]) expect(dropAt(i)).toBeGreaterThan(0.08);
  });
});

describe("timing game", () => {
  it("is deterministic and the perfect timer gains only a few percent", () => {
    expect(monthPrices(2)).toEqual(monthPrices(2));
    expect(monthPrices(0)).toHaveLength(TIMING_DAYS);
    const s = scoreTiming(Array(TIMING_ROUNDS).fill(0));
    expect(s.vsDayOne).toBe(0);
    expect(s.oracleVsDayOne).toBeGreaterThan(0);
    expect(s.oracleVsDayOne).toBeLessThan(0.08);
  });
});
