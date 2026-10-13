import "server-only";
import { eq, inArray } from "drizzle-orm";
import webpush from "web-push";
import { getDb } from "@/db/client";
import { pushSubscriptions } from "@/db/schema";

/**
 * Web Push delivery. Works only when VAPID_PUBLIC_KEY (or NEXT_PUBLIC_VAPID_PUBLIC_KEY),
 * VAPID_PRIVATE_KEY and VAPID_SUBJECT are set; otherwise it is a no-op and in-app
 * notifications carry on alone.
 */
export interface PushPayload {
  title: string;
  body: string;
  href?: string | null;
  icon?: string;
  tag?: string;
}

function vapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  return publicKey && privateKey && subject ? { publicKey, privateKey, subject } : null;
}

export function pushConfigured(): boolean {
  return vapid() !== null;
}

/** Sends to every subscription of the user; deletes subscriptions the push service says are gone. */
export async function sendPush(userId: string, payload: PushPayload): Promise<{ sent: number; removed: number; failed: number }> {
  const keys = vapid();
  const result = { sent: 0, removed: 0, failed: 0 };
  if (!keys) return result;
  const db = await getDb();
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  if (subs.length === 0) return result;

  const body = JSON.stringify({ icon: "/mascot/celebrate.png", ...payload, href: payload.href ?? "/notifications" });
  const gone: number[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
          vapidDetails: keys,
          TTL: 60 * 60 * 12,
        });
        result.sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(s.id);
        else {
          result.failed++;
          console.error("push", status ?? e);
        }
      }
    }),
  );
  if (gone.length) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, gone));
    result.removed = gone.length;
  }
  return result;
}
