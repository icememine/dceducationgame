/**
 * Daily reminder job: GET or POST /api/cron/reminders, run every hour (e.g. Vercel Cron
 * "0 * * * *" or any scheduler). Each run reminds learners whose reminder hour equals the
 * current Vietnam hour and who have not been reminded today; returns a JSON summary.
 *
 * Environment variables:
 *   CRON_SECRET                    required. Callers send `Authorization: Bearer <CRON_SECRET>`.
 *                                  If unset, the endpoint refuses every request (503).
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY   optional. VAPID public key the browser subscribes with
 *                                  (settings page). Unset → device push shown as "not configured".
 *   VAPID_PUBLIC_KEY               optional. Same public key for the server (falls back to
 *                                  NEXT_PUBLIC_VAPID_PUBLIC_KEY).
 *   VAPID_PRIVATE_KEY              optional. VAPID private key for sending Web Push.
 *   VAPID_SUBJECT                  optional. "mailto:…" or https URL identifying the sender.
 * Without the VAPID keys reminders are still stored as in-app notifications.
 * Generate keys with: npx web-push generate-vapid-keys
 */
import { authorizedCron as authorized } from "@/lib/cron-auth";
import { runReminders } from "@/features/notifications/reminders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(req: Request) {
  const denied = authorized(req);
  if (denied) return denied;
  try {
    const summary = await runReminders(new Date());
    return Response.json({ ok: true, ...summary }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    console.error("cron reminders", e);
    return Response.json({ ok: false, error: "reminder run failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
