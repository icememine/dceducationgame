import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getGoals, getLatestProfile } from "@/db/queries";
import { users } from "@/db/schema";
import { buildPlanCard, isShareTokenShape, tokenHidesAmounts, type PlanCard } from "./model";

async function cardFor(user: { id: string; nickname: string; avatar: string }, hideAmounts: boolean): Promise<PlanCard> {
  const [risk, goals] = await Promise.all([getLatestProfile(user.id), getGoals(user.id)]);
  return buildPlanCard({ nickname: user.nickname, avatar: user.avatar, risk, goals, hideAmounts });
}

/** Public lookup: the card for a share token, or null. The user id never leaves this function. */
export async function getPlanCardByToken(token: string): Promise<PlanCard | null> {
  if (!isShareTokenShape(token)) return null;
  const db = await getDb();
  const [user] = await db
    .select({ id: users.id, nickname: users.nickname, avatar: users.avatar })
    .from(users)
    .where(eq(users.planShareToken, token));
  return user ? cardFor(user, tokenHidesAmounts(token)) : null;
}

/** The learner's own card plus their current share token (null = not shared). */
export async function getOwnPlan(userId: string, hideAmounts?: boolean) {
  const db = await getDb();
  const [user] = await db
    .select({ id: users.id, nickname: users.nickname, avatar: users.avatar, token: users.planShareToken })
    .from(users)
    .where(eq(users.id, userId));
  if (!user) return null;
  const hide = hideAmounts ?? (user.token ? tokenHidesAmounts(user.token) : false);
  return { token: user.token, card: await cardFor(user, hide) };
}
