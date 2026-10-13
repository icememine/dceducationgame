/**
 * Weekly league settlement: GET or POST /api/cron/leagues, run shortly after Sunday midnight
 * (Vietnam time), e.g. "5 17 * * 0" in UTC. Promotes the top 5 and demotes the bottom 5 of
 * every group for each finished week not settled yet. Idempotent; the app also settles
 * lazily when a learner first earns XP in a new week. Needs CRON_SECRET (see /api/cron/reminders).
 */
import { settlePendingWeeks } from "@/features/leagues/queries";
import { authorizedCron } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(req: Request) {
  const denied = authorizedCron(req);
  if (denied) return denied;
  try {
    const weeks = await settlePendingWeeks(new Date());
    return Response.json({ ok: true, weeks: weeks.map((w) => ({ weekStart: w.weekStart, learners: w.outcomes.length })) }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    console.error("cron leagues", e);
    return Response.json({ ok: false, error: "league settlement failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
