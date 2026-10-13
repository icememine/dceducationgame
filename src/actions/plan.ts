"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { ensureUser } from "@/db/queries";
import { users } from "@/db/schema";
import { newShareToken } from "@/features/plan-card/model";
import { getUserId } from "@/lib/auth";

/**
 * Share the investment-plan card at /p/[token]. A new random token replaces any old one, so an
 * earlier link stops working. Hide-amounts is encoded as the "h-" token prefix (see model.ts).
 */
export async function createPlanShare(hideAmounts: boolean) {
  const hide = z.boolean().parse(hideAmounts);
  const userId = await getUserId();
  await ensureUser(userId);
  const token = newShareToken(hide);
  const db = await getDb();
  await db.update(users).set({ planShareToken: token }).where(eq(users.id, userId));
  revalidatePath("/profile/plan");
  return { token };
}

/** Stop sharing: the public link returns 404 from now on. */
export async function revokePlanShare() {
  const userId = await getUserId();
  const db = await getDb();
  await db.update(users).set({ planShareToken: null }).where(eq(users.id, userId));
  revalidatePath("/profile/plan");
  return { ok: true as const };
}
