import "server-only";
import { and, count, eq, inArray, isNull, lte, ne, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { reviewItems, userProgress, users } from "@/db/schema";
import { localDay } from "@/features/gamification/engine";
import { notify } from "./notify";
import { decideReminder, vietnamHour, type ReminderKind } from "./rules";

export interface ReminderRunSummary {
  day: string;
  hour: number;
  candidates: number;
  sent: Record<ReminderKind, number>;
  skipped: number;
  pushed: number;
  errors: number;
}

/**
 * Daily reminder job (called by /api/cron/reminders, ideally every hour on the hour).
 * Picks learners whose reminder hour is the current Vietnam hour and who were not reminded
 * today, claims each one by setting last_reminded_day first (so overlapping runs never
 * double-send), then decides the message with the pure rules.
 */
export async function runReminders(now = new Date()): Promise<ReminderRunSummary> {
  const db = await getDb();
  const today = localDay(now);
  const yesterday = localDay(new Date(now.getTime() - 86_400_000));
  const hour = vietnamHour(now);
  const summary: ReminderRunSummary = {
    day: today,
    hour,
    candidates: 0,
    sent: { streak_risk: 0, review_due: 0, study_nudge: 0 },
    skipped: 0,
    pushed: 0,
    errors: 0,
  };

  const notToday = or(isNull(users.lastRemindedDay), ne(users.lastRemindedDay, today));
  const rows = await db
    .select({ id: users.id, streak: userProgress.streak, lastDay: userProgress.streakLastDay })
    .from(users)
    .leftJoin(userProgress, eq(userProgress.userId, users.id))
    .where(and(eq(users.reminderEnabled, true), eq(users.reminderHour, hour), notToday));
  summary.candidates = rows.length;
  if (rows.length === 0) return summary;

  const dueRows = await db
    .select({ userId: reviewItems.userId, n: count() })
    .from(reviewItems)
    .where(and(inArray(reviewItems.userId, rows.map((r) => r.id)), lte(reviewItems.dueAt, now), isNull(reviewItems.retiredAt)))
    .groupBy(reviewItems.userId);
  const due = new Map(dueRows.map((r) => [r.userId, Number(r.n)]));

  for (const r of rows) {
    try {
      const claimed = await db
        .update(users)
        .set({ lastRemindedDay: today })
        .where(and(eq(users.id, r.id), notToday))
        .returning({ id: users.id });
      if (claimed.length === 0) continue;

      const studiedToday = r.lastDay === today;
      const streak = r.lastDay === today || r.lastDay === yesterday ? (r.streak ?? 0) : 0;
      const msg = decideReminder({ studiedToday, streak, reviewDue: due.get(r.id) ?? 0 });
      if (!msg) {
        summary.skipped++;
        continue;
      }
      const res = await notify(r.id, { kind: msg.kind, title: msg.title, body: msg.body, href: msg.href, mascot: msg.mascot });
      summary.sent[msg.kind]++;
      summary.pushed += res.pushed;
    } catch (e) {
      summary.errors++;
      console.error("reminder", r.id, e);
    }
  }

  // FEATURES 9.3 "Khi thị trường giảm": once a market-data source exists (e.g. a daily
  // VN-Index close), check for a sharp fall here and call notify(userId, { kind: "market_drop",
  // mascot: "sad", href: <B2.4 / B5.6 lesson> }) with a calm, learning-only message
  // (no buy/sell prompt). Not built: there is no market data in the app yet.
  return summary;
}
