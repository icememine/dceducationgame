"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { ensureUser } from "@/db/queries";
import { notifications, pushSubscriptions, users } from "@/db/schema";
import { REMINDER_HOURS } from "@/features/notifications/rules";
import { getUserId } from "@/lib/auth";

export async function markAllNotificationsRead() {
  const userId = await getUserId();
  const db = await getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  revalidatePath("/", "layout");
}

/** Mark one notification read and go to its link (only in-app paths are followed). */
export async function openNotification(id: number) {
  const userId = await getUserId();
  const db = await getDb();
  const [row] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning({ href: notifications.href });
  revalidatePath("/", "layout");
  const href = row?.href;
  redirect(href && href.startsWith("/") && !href.startsWith("//") ? href : "/notifications");
}

const reminderInput = z.object({
  enabled: z.boolean(),
  hour: z.number().int().min(REMINDER_HOURS.min).max(REMINDER_HOURS.max),
});

export async function saveReminderSettings(input: z.input<typeof reminderInput>) {
  const data = reminderInput.parse(input);
  const userId = await getUserId();
  await ensureUser(userId);
  const db = await getDb();
  await db.update(users).set({ reminderEnabled: data.enabled, reminderHour: data.hour }).where(eq(users.id, userId));
  revalidatePath("/profile/settings");
  return { ok: true as const };
}

const subscriptionInput = z.object({
  endpoint: z.string().url().max(2000).refine((u) => u.startsWith("https://"), "https only"),
  keys: z.object({ p256dh: z.string().min(1).max(500), auth: z.string().min(1).max(500) }),
});

/** Store this browser's Web Push subscription (re-subscribing moves the endpoint to this learner). */
export async function savePushSubscription(input: z.input<typeof subscriptionInput>) {
  const data = subscriptionInput.parse(input);
  const userId = await getUserId();
  await ensureUser(userId);
  const db = await getDb();
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint: data.endpoint, p256dh: data.keys.p256dh, auth: data.keys.auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId, p256dh: data.keys.p256dh, auth: data.keys.auth },
    });
  return { ok: true as const };
}

export async function removePushSubscription(endpoint: string) {
  const userId = await getUserId();
  const db = await getDb();
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, String(endpoint).slice(0, 2000))));
  return { ok: true as const };
}
