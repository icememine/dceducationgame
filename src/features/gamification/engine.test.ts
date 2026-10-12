import { describe, expect, it } from "vitest";
import { advanceStreak, leagueOutcome, lessonXp, localDay, regenerateHearts } from "./engine";

describe("gamification", () => {
  it("awards a perfect bonus only on graded lessons", () => {
    expect(lessonXp({ kind: "standard", mistakes: 0, isPractice: false })).toBe(20);
    expect(lessonXp({ kind: "standard", mistakes: 2, isPractice: false })).toBe(15);
    expect(lessonXp({ kind: "profile", baseXp: 20, mistakes: 0, isPractice: false })).toBe(20);
    expect(lessonXp({ kind: "checkpoint", mistakes: 0, isPractice: true })).toBe(5);
  });

  it("regenerates hearts over time and caps at max", () => {
    const t0 = new Date("2026-10-12T00:00:00Z");
    expect(regenerateHearts(2, t0, new Date("2026-10-12T04:30:00Z")).hearts).toBe(3);
    expect(regenerateHearts(2, t0, new Date("2026-10-14T00:00:00Z")).hearts).toBe(5);
  });

  it("uses Vietnam calendar days for streaks", () => {
    // 18:00 UTC is already the next day in Hanoi (UTC+7).
    expect(localDay(new Date("2026-10-12T18:00:00Z"))).toBe("2026-10-13");
  });

  it("advances, freezes and resets streaks", () => {
    const s = { streak: 7, lastDay: "2026-10-11", freezes: 1 };
    expect(advanceStreak(s, "2026-10-11").streak).toBe(7);
    expect(advanceStreak(s, "2026-10-12").streak).toBe(8);
    expect(advanceStreak(s, "2026-10-13")).toEqual({ streak: 8, lastDay: "2026-10-13", freezes: 0 });
    expect(advanceStreak({ ...s, freezes: 0 }, "2026-10-13").streak).toBe(1);
  });

  it("promotes top 5 and demotes bottom 5", () => {
    expect(leagueOutcome(2, 3, 30)).toBe(3);
    expect(leagueOutcome(2, 28, 30)).toBe(1);
    expect(leagueOutcome(2, 15, 30)).toBe(2);
    expect(leagueOutcome(0, 30, 30)).toBe(0);
  });
});
