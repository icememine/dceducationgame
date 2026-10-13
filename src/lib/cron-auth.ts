import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Shared guard for /api/cron/* jobs: `Authorization: Bearer <CRON_SECRET>`.
 * Returns a response to send back when the caller is not allowed, or null when it is.
 */
export function authorizedCron(req: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

