import { describe, expect, it } from "vitest";
import { isDue, onCorrectReview, onWrong, REVIEW_INTERVAL_DAYS } from "./srs";

const now = new Date("2026-10-13T03:00:00Z");
const days = (a: Date | null) => (a ? Math.round((a.getTime() - now.getTime()) / 86_400_000) : null);

describe("spaced repetition", () => {
  it("puts a mistake in box 0, due now", () => {
    const s = onWrong(undefined, now);
    expect(s).toMatchObject({ box: 0, lapses: 1 });
    expect(isDue(s, now)).toBe(true);
  });

  it("climbs 1 → 3 → 7 → 21 days, then retires", () => {
    let s = onWrong(undefined, now);
    const gaps: (number | null)[] = [];
    for (let i = 0; i < REVIEW_INTERVAL_DAYS.length; i++) {
      s = onCorrectReview(s, now);
      gaps.push(days(s.dueAt));
    }
    expect(gaps).toEqual([1, 3, 7, 21]);
    s = onCorrectReview(s, now);
    expect(s.retiredAt).not.toBeNull();
    expect(isDue(s, new Date(now.getTime() + 999 * 86_400_000))).toBe(false);
  });

  it("sends a lapse back to box 0 and counts it", () => {
    const s = onWrong(onCorrectReview(onCorrectReview(onWrong(undefined, now), now), now), now);
    expect(s).toMatchObject({ box: 0, lapses: 2 });
  });
});
