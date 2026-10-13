import "server-only";
import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { findLesson, lessonsOf, segments } from "@content/index";
import { getDb } from "@/db/client";
import { getCompletedLessonIds, getGoals, getLatestProfile, getUserState } from "@/db/queries";
import { leagueMemberships, reviewItems, userBadges, xpEvents } from "@/db/schema";
import { localDay } from "@/features/gamification/engine";
import { notify } from "@/features/notifications/notify";
import { badgeInfo, earnedBadgeIds, monthlyProgress, monthOf, type BadgeStats, type MonthStats } from "./badges";

export async function getBadgeStats(userId: string): Promise<BadgeStats> {
  const db = await getDb();
  const [{ progress }, completed, goals, risk] = await Promise.all([getUserState(userId), getCompletedLessonIds(userId), getGoals(userId), getLatestProfile(userId)]);
  const [perfect] = await db.select({ n: sql<number>`cast(count(*) as int)` }).from(xpEvents).where(and(eq(xpEvents.userId, userId), eq(xpEvents.perfect, true)));
  const [retired] = await db.select({ n: sql<number>`cast(count(*) as int)` }).from(reviewItems).where(and(eq(reviewItems.userId, userId), isNotNull(reviewItems.retiredAt)));
  const [up] = await db.select({ n: sql<number>`cast(count(*) as int)` }).from(leagueMemberships).where(and(eq(leagueMemberships.userId, userId), eq(leagueMemberships.outcome, "up")));
  const ids = [...completed];
  return {
    lessonsCompleted: ids.filter((id) => findLesson(id)).length,
    perfectLessons: perfect?.n ?? 0,
    checkpointsCompleted: ids.filter((id) => findLesson(id)?.lesson.kind === "checkpoint").length,
    streak: progress.streak,
    goalsSaved: goals.length,
    riskConfirmed: !!(risk?.frameworkVersion && risk.decision),
    segmentsCompleted: segments.filter((s) => lessonsOf(s).every((l) => completed.has(l.id))).map((s) => s.id),
    scamLessonDone: completed.has("a8s-fake-calls"),
    reviewRetired: retired?.n ?? 0,
    promoted: (up?.n ?? 0) > 0,
  };
}

/** This calendar month in Vietnam: lessons finished, XP, and days with any activity. */
export async function getMonthStats(userId: string, now = new Date()): Promise<{ month: string; stats: MonthStats }> {
  const month = monthOf(localDay(now));
  const since = new Date(`${month}-01T00:00:00+07:00`);
  const db = await getDb();
  const [row] = await db
    .select({
      xp: sql<number>`coalesce(cast(sum(${xpEvents.amount}) as int), 0)`,
      lessons: sql<number>`cast(count(*) filter (where ${xpEvents.reason} = 'lesson') as int)`,
      days: sql<number>`cast(count(distinct cast(${xpEvents.createdAt} + interval '7 hours' as date)) as int)`,
    })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, since)));
  return { month, stats: { xp: row?.xp ?? 0, lessons: row?.lessons ?? 0, activeDays: row?.days ?? 0 } };
}

/** Store any newly earned badge (incl. this month's challenges) and return the new ids. */
export async function syncBadges(userId: string): Promise<string[]> {
  const [stats, { month, stats: m }] = await Promise.all([getBadgeStats(userId), getMonthStats(userId)]);
  const ids = [...earnedBadgeIds(stats), ...monthlyProgress(month, m).filter((c) => c.done).map((c) => c.badgeId)];
  if (!ids.length) return [];
  const db = await getDb();
  const inserted = await db
    .insert(userBadges)
    .values(ids.map((badgeId) => ({ userId, badgeId })))
    .onConflictDoNothing()
    .returning({ badgeId: userBadges.badgeId });
  for (const { badgeId } of inserted) {
    const b = badgeInfo(badgeId);
    if (b) await notify(userId, { kind: "badge", title: `Huy hiệu mới: ${b.title}`, body: b.description, href: "/profile" });
  }
  return inserted.map((r) => r.badgeId);
}

export async function getUserBadges(userId: string) {
  const db = await getDb();
  return db.select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(userBadges.earnedAt);
}
