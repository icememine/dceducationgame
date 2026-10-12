import "server-only";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { getSegment, lessonsOf, segments } from "@content/index";
import type { Segment } from "@content/schema";
import { localDay, regenerateHearts } from "@/features/gamification/engine";
import { questProgress } from "@/features/gamification/quests";
import { getDb } from "./client";
import { challengeAttempts, goals, lessonSessions, riskProfiles, userProgress, users, xpEvents } from "./schema";

export async function ensureUser(userId: string) {
  const db = await getDb();
  await db.insert(users).values({ id: userId }).onConflictDoNothing();
  await db.insert(userProgress).values({ userId }).onConflictDoNothing();
}

/** User + progress with hearts regenerated up to "now". */
export async function getUserState(userId: string) {
  await ensureUser(userId);
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  const regen = regenerateHearts(progress.hearts, progress.heartsUpdatedAt, new Date());
  if (regen.hearts !== progress.hearts) {
    await db.update(userProgress).set({ hearts: regen.hearts, heartsUpdatedAt: regen.lastChange }).where(eq(userProgress.userId, userId));
  }
  // A streak is only "alive" if the last lesson was today or yesterday.
  const today = localDay(new Date());
  const yesterday = localDay(new Date(Date.now() - 86_400_000));
  const streakAlive = progress.streakLastDay === today || progress.streakLastDay === yesterday;
  return {
    user,
    progress: { ...progress, hearts: regen.hearts, streak: streakAlive ? progress.streak : 0 },
    activeSegment: getSegment(user.activeSegmentId) ?? segments[0],
  };
}

export async function getCompletedLessonIds(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ lessonId: lessonSessions.lessonId })
    .from(lessonSessions)
    .where(and(eq(lessonSessions.userId, userId), isNotNull(lessonSessions.completedAt)));
  return new Set(rows.map((r) => r.lessonId));
}

export type NodeStatus = "done" | "current" | "locked";

/** Linear unlocking inside a segment, like Duolingo's path. */
export function pathStatus(segment: Segment, completed: Set<string>) {
  const ordered = lessonsOf(segment);
  const firstOpen = ordered.findIndex((l) => !completed.has(l.id));
  const status = new Map<string, NodeStatus>();
  ordered.forEach((l, i) => status.set(l.id, completed.has(l.id) ? "done" : i === firstOpen ? "current" : "locked"));
  return status;
}

export async function getSegmentProgress(userId: string) {
  const completed = await getCompletedLessonIds(userId);
  return segments.map((s) => {
    const all = lessonsOf(s);
    const done = all.filter((l) => completed.has(l.id)).length;
    return { segment: s, done, total: all.length };
  });
}

const startOfWeek = () => {
  const d = new Date();
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
};

export async function getWeeklyLeaderboard(limit = 30) {
  const db = await getDb();
  const total = sql<number>`cast(sum(${xpEvents.amount}) as int)`;
  return db
    .select({ userId: xpEvents.userId, nickname: users.nickname, avatar: users.avatar, xp: total })
    .from(xpEvents)
    .innerJoin(users, eq(users.id, xpEvents.userId))
    .where(gte(xpEvents.createdAt, startOfWeek()))
    .groupBy(xpEvents.userId, users.nickname, users.avatar)
    .orderBy(desc(total))
    .limit(limit);
}

export async function getDailyQuests(userId: string) {
  const db = await getDb();
  // Midnight in Vietnam (UTC+7, no DST).
  const since = new Date(`${localDay(new Date())}T00:00:00+07:00`);
  const [xp] = await db
    .select({
      xp: sql<number>`coalesce(cast(sum(${xpEvents.amount}) as int), 0)`,
      perfect: sql<number>`cast(count(*) filter (where ${xpEvents.perfect}) as int)`,
      lessons: sql<number>`cast(count(${xpEvents.lessonId}) as int)`,
    })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, since)));
  const scenarioIds = segments.flatMap((s) => lessonsOf(s).flatMap((l) => l.challenges.filter((c) => c.type === "scenario").map((c) => c.id)));
  const [sc] = await db
    .select({ n: sql<number>`cast(count(*) as int)` })
    .from(challengeAttempts)
    .where(
      and(
        eq(challengeAttempts.userId, userId),
        eq(challengeAttempts.correct, true),
        gte(challengeAttempts.createdAt, since),
        sql`${challengeAttempts.challengeId} in (${sql.join(scenarioIds.map((id) => sql`${id}`), sql`, `)})`,
      ),
    );
  return questProgress({ xp: xp.xp, perfectLessons: xp.perfect, lessonsCompleted: xp.lessons, scenariosCorrect: sc.n });
}

export async function getLatestProfile(userId: string) {
  const db = await getDb();
  const [row] = await db.select().from(riskProfiles).where(eq(riskProfiles.userId, userId)).orderBy(desc(riskProfiles.createdAt)).limit(1);
  return row;
}

export async function getGoals(userId: string) {
  const db = await getDb();
  return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
}
