"use server";

import { isNotNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { ensureUser } from "@/db/queries";
import { users } from "@/db/schema";
import { assertAdmin } from "@/features/admin/auth";
import { notify } from "@/features/notifications/notify";
import { MARKET_DROP_OPTIONS, marketDropNudge } from "@/features/notifications/rules";
import { getUserId } from "@/lib/auth";

export type SimState = { sent?: number; error?: string };

/**
 * Market-drop simulator (FEATURES.md 9.3, simulation only): sends the labelled "[Mô phỏng]"
 * nudge either to the learner in this browser (to preview it) or to every onboarded learner
 * (for a drill). No market data is read; nothing here reflects a real index move.
 */
export async function sendMarketDropSim(_prev: SimState, form: FormData): Promise<SimState> {
  await assertAdmin();
  const drop = Number(form.get("drop"));
  if (!(MARKET_DROP_OPTIONS as readonly number[]).includes(drop)) return { error: "Mức giảm không hợp lệ" };
  const audience = form.get("audience") === "all" ? "all" : "me";
  const message = marketDropNudge(drop);
  let ids: string[];
  if (audience === "me") {
    const me = await getUserId();
    await ensureUser(me);
    ids = [me];
  } else {
    const db = await getDb();
    ids = (await db.select({ id: users.id }).from(users).where(isNotNull(users.onboardedAt))).map((u) => u.id);
  }
  for (const id of ids) await notify(id, message);
  return { sent: ids.length };
}
