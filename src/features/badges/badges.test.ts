import { describe, expect, it } from "vitest";
import { badgeInfo, BADGES, earnedBadgeIds, monthlyProgress, monthOf, type BadgeStats } from "./badges";

const none: BadgeStats = { lessonsCompleted: 0, perfectLessons: 0, checkpointsCompleted: 0, streak: 0, goalsSaved: 0, riskConfirmed: false, segmentsCompleted: [], scamLessonDone: false, reviewRetired: 0, promoted: false };

describe("badges", () => {
  it("earns nothing at the start and each badge from its own milestone", () => {
    expect(earnedBadgeIds(none)).toEqual([]);
    expect(earnedBadgeIds({ ...none, lessonsCompleted: 1, streak: 7 })).toEqual(["first-lesson", "streak-7"]);
    expect(earnedBadgeIds({ ...none, segmentsCompleted: ["fund-types"] })).toEqual(["stage-fund-types"]);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  it("tracks monthly challenges and names their badges", () => {
    const p = monthlyProgress("2026-10", { lessons: 25, xp: 120, activeDays: 15 });
    expect(p.map((x) => x.done)).toEqual([true, true, false]);
    expect(p[0]).toMatchObject({ value: 20, badgeId: "monthly:2026-10:lessons" });
    expect(monthOf("2026-10-13")).toBe("2026-10");
    expect(badgeInfo("monthly:2026-10:days")?.title).toBe("Thử thách tháng 10/2026");
    expect(badgeInfo("nope")).toBeUndefined();
  });
});
