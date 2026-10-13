import "server-only";
import { and, eq, gte, inArray, lt, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { leagueMemberships, leagueWeeks, userProgress, users, xpEvents } from "@/db/schema";
import { localDay } from "@/features/gamification/engine";
import { LEAGUES } from "@/features/gamification/rules";
import { notify } from "@/features/notifications/notify";
import { pickGroup, settleGroup, tierAfter, weekBounds, weekStartOf, zoneOf, type Outcome } from "./leagues";

export const currentWeek = (now = new Date()) => weekStartOf(localDay(now));

async function weeklyXp(userIds: string[], weekStart: string) {
  if (!userIds.length) return new Map<string, number>();
  const db = await getDb();
  const { from, to } = weekBounds(weekStart);
  const rows = await db
    .select({ userId: xpEvents.userId, xp: sql<number>`cast(sum(${xpEvents.amount}) as int)` })
    .from(xpEvents)
    .where(and(inArray(xpEvents.userId, userIds), gte(xpEvents.createdAt, from), lt(xpEvents.createdAt, to)))
    .groupBy(xpEvents.userId);
  return new Map(rows.map((r) => [r.userId, r.xp]));
}

/**
 * Apply promotions and demotions for every finished week that has groups and isn't settled yet.
 * Idempotent (league_weeks records settled weeks); called lazily and by /api/cron/leagues.
 */
export async function settlePendingWeeks(now = new Date()) {
  const db = await getDb();
  const settled = (await db.select({ w: leagueWeeks.weekStart }).from(leagueWeeks)).map((r) => r.w);
  const pending = await db
    .selectDistinct({ w: leagueMemberships.weekStart })
    .from(leagueMemberships)
    .where(and(lt(leagueMemberships.weekStart, currentWeek(now)), settled.length ? notInArray(leagueMemberships.weekStart, settled) : undefined));
  const results: { weekStart: string; outcomes: { userId: string; outcome: Outcome }[] }[] = [];
  for (const { w } of pending.sort((a, b) => a.w.localeCompare(b.w))) {
    // Claim the week first so two concurrent settlements can't both apply it.
    const claimed = await db.insert(leagueWeeks).values({ weekStart: w }).onConflictDoNothing().returning();
    if (!claimed.length) continue;
    const members = await db.select().from(leagueMemberships).where(eq(leagueMemberships.weekStart, w));
    const xp = await weeklyXp(members.map((m) => m.userId), w);
    const groups = new Map<string, typeof members>();
    for (const m of members) groups.set(`${m.tier}:${m.groupNo}`, [...(groups.get(`${m.tier}:${m.groupNo}`) ?? []), m]);
    const outcomes: { userId: string; outcome: Outcome }[] = [];
    for (const g of groups.values()) {
      const tier = g[0].tier;
      for (const r of settleGroup(g.map((m) => ({ userId: m.userId, xp: xp.get(m.userId) ?? 0 })), tier)) {
        await db.update(leagueMemberships).set({ outcome: r.outcome, rank: r.rank }).where(and(eq(leagueMemberships.userId, r.userId), eq(leagueMemberships.weekStart, w)));
        await db.update(userProgress).set({ leagueIndex: tierAfter(tier, r.outcome) }).where(eq(userProgress.userId, r.userId));
        outcomes.push({ userId: r.userId, outcome: r.outcome });
        const name = LEAGUES[tierAfter(tier, r.outcome)].name;
        const title = r.outcome === "up" ? `Lên ${name}!` : r.outcome === "down" ? `Tuần này bạn ở ${name}` : `Giữ vững ${name}`;
        await notify(r.userId, { kind: "league", title, body: `Hạng ${r.rank} trong nhóm tuần trước.`, href: "/leaderboard" });
      }
    }
    results.push({ weekStart: w, outcomes });
  }
  return results;
}

/** Join this week's group for the learner's tier (first group with room), after settling past weeks. */
export async function ensureMembership(userId: string, now = new Date()) {
  const db = await getDb();
  const week = currentWeek(now);
  const [mine] = await db.select().from(leagueMemberships).where(and(eq(leagueMemberships.userId, userId), eq(leagueMemberships.weekStart, week)));
  if (mine) return mine;
  await settlePendingWeeks(now);
  const [p] = await db.select({ tier: userProgress.leagueIndex }).from(userProgress).where(eq(userProgress.userId, userId));
  const tier = p?.tier ?? 0;
  const sizes = await db
    .select({ groupNo: leagueMemberships.groupNo, n: sql<number>`cast(count(*) as int)` })
    .from(leagueMemberships)
    .where(and(eq(leagueMemberships.weekStart, week), eq(leagueMemberships.tier, tier)))
    .groupBy(leagueMemberships.groupNo);
  const groupNo = pickGroup(new Map(sizes.map((s) => [s.groupNo, s.n])));
  const [row] = await db.insert(leagueMemberships).values({ userId, weekStart: week, tier, groupNo }).onConflictDoNothing().returning();
  return row ?? (await db.select().from(leagueMemberships).where(and(eq(leagueMemberships.userId, userId), eq(leagueMemberships.weekStart, week))))[0];
}

/** The learner's group this week, ranked by weekly XP, with promotion/demotion zones. */
export async function getGroupBoard(userId: string, now = new Date()) {
  const me = await ensureMembership(userId, now);
  const db = await getDb();
  const members = await db
    .select({ userId: leagueMemberships.userId, nickname: users.nickname, avatar: users.avatar })
    .from(leagueMemberships)
    .innerJoin(users, eq(users.id, leagueMemberships.userId))
    .where(and(eq(leagueMemberships.weekStart, me.weekStart), eq(leagueMemberships.tier, me.tier), eq(leagueMemberships.groupNo, me.groupNo)));
  const xp = await weeklyXp(members.map((m) => m.userId), me.weekStart);
  const ranked = members
    .map((m) => ({ ...m, xp: xp.get(m.userId) ?? 0 }))
    .sort((a, b) => b.xp - a.xp || a.userId.localeCompare(b.userId))
    .map((m, i, all) => ({ ...m, rank: i + 1, zone: zoneOf(i + 1, all.length, me.tier) }));
  const [last] = await db
    .select()
    .from(leagueMemberships)
    .where(and(eq(leagueMemberships.userId, userId), lt(leagueMemberships.weekStart, me.weekStart)))
    .orderBy(sql`${leagueMemberships.weekStart} desc`)
    .limit(1);
  return { tier: me.tier, weekStart: me.weekStart, rows: ranked, lastWeek: last?.outcome ? { outcome: last.outcome as Outcome, rank: last.rank } : undefined };
}
