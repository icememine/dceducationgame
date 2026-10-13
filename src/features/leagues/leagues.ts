import { DEMOTE_BOTTOM, LEAGUE_GROUP_SIZE, LEAGUES, PROMOTE_TOP } from "@/features/gamification/rules";

/**
 * Weekly league groups (FEATURES.md 6.5): learners join a group of up to 30 in their tier
 * when they first earn XP in a week. When the week ends, the top 5 move up a tier and the
 * bottom 5 move down (never below the first tier, and only in groups big enough that the
 * two zones don't overlap). Weeks run Monday–Sunday in Vietnam time.
 */
export const MAX_TIER = LEAGUES.length - 1;

/** Monday ("YYYY-MM-DD") of the week containing a Vietnam local day "YYYY-MM-DD". */
export function weekStartOf(localDay: string): string {
  const d = new Date(`${localDay}T00:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - back * 86_400_000).toISOString().slice(0, 10);
}
export const nextWeek = (weekStart: string) => new Date(new Date(`${weekStart}T00:00:00Z`).getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
/** UTC instants bounding a Vietnam week (UTC+7, no DST). */
export const weekBounds = (weekStart: string) => ({ from: new Date(`${weekStart}T00:00:00+07:00`), to: new Date(`${nextWeek(weekStart)}T00:00:00+07:00`) });

/** First group in the tier with room, else a new one. `sizes[groupNo]` = members so far. */
export function pickGroup(sizes: Map<number, number>): number {
  const nos = [...sizes.keys()].sort((a, b) => a - b);
  const open = nos.find((n) => (sizes.get(n) ?? 0) < LEAGUE_GROUP_SIZE);
  return open ?? (nos.length ? nos[nos.length - 1] + 1 : 1);
}

export type Outcome = "up" | "down" | "stay";
export type Ranked = { userId: string; xp: number; rank: number; outcome: Outcome };

/** Rank a group by weekly XP (ties broken by user id for determinism) and decide moves. */
export function settleGroup(rows: { userId: string; xp: number }[], tier: number): Ranked[] {
  const sorted = [...rows].sort((a, b) => b.xp - a.xp || a.userId.localeCompare(b.userId));
  const canDemote = tier > 0 && sorted.length > PROMOTE_TOP + DEMOTE_BOTTOM;
  return sorted.map((r, i) => {
    let outcome: Outcome = "stay";
    if (i < PROMOTE_TOP && r.xp > 0 && tier < MAX_TIER) outcome = "up";
    else if (canDemote && i >= sorted.length - DEMOTE_BOTTOM) outcome = "down";
    return { ...r, rank: i + 1, outcome };
  });
}

export const tierAfter = (tier: number, o: Outcome) => Math.min(MAX_TIER, Math.max(0, tier + (o === "up" ? 1 : o === "down" ? -1 : 0)));

/** Zone shown next to a live ranking. */
export function zoneOf(rank: number, size: number, tier: number): Outcome {
  if (rank <= PROMOTE_TOP && tier < MAX_TIER) return "up";
  if (tier > 0 && size > PROMOTE_TOP + DEMOTE_BOTTOM && rank > size - DEMOTE_BOTTOM) return "down";
  return "stay";
}
