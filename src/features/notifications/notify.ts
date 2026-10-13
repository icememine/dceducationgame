import "server-only";
import { getDb } from "@/db/client";
import { notifications } from "@/db/schema";
import { sendPush } from "./push";

export interface NotifyInput {
  /** e.g. "streak_risk" | "review_due" | "study_nudge" | "badge" | "league" | "market_drop". */
  kind: string;
  title: string;
  body: string;
  href?: string | null;
  /** Mascot pose for the push icon (see components/mascot). Defaults to "celebrate". */
  mascot?: string;
}

/**
 * Insert an in-app notification and best-effort send it as Web Push.
 * Push failures never throw; the in-app row is the source of truth.
 * Called by reminders, badges and league results.
 */
export async function notify(userId: string, input: NotifyInput): Promise<{ id: number; pushed: number }> {
  const db = await getDb();
  const [row] = await db
    .insert(notifications)
    .values({ userId, kind: input.kind, title: input.title, body: input.body, href: input.href ?? null })
    .returning({ id: notifications.id });
  let pushed = 0;
  try {
    const r = await sendPush(userId, {
      title: input.title,
      body: input.body,
      href: input.href,
      icon: `/mascot/${input.mascot ?? "celebrate"}.png`,
      tag: input.kind,
    });
    pushed = r.sent;
  } catch (e) {
    console.error("notify push", e);
  }
  return { id: row.id, pushed };
}
