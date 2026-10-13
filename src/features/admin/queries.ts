import "server-only";
import { and, eq, inArray, isNotNull, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { challengeAttempts as ca, lessonSessions as ls } from "@/db/schema";
import type { FirstTryRow, FunnelInputRow, TotalsRow, WrongAnswerRow } from "./stats";

/** Read-only SQL for /admin/analytics. Joining to content and sorting happens in stats.ts. */

const onlyIds = (ids?: string[]) => (ids ? inArray(ca.challengeId, ids.length ? ids : [""]) : undefined);

/** Graded attempts (correct is not null) and distinct learners per challenge. */
export async function attemptTotals(ids?: string[]): Promise<TotalsRow[]> {
  const db = await getDb();
  return db
    .select({
      challengeId: ca.challengeId,
      attempts: sql<number>`count(*)::int`,
      learners: sql<number>`count(distinct ${ca.userId})::int`,
    })
    .from(ca)
    .where(and(isNotNull(ca.correct), onlyIds(ids)))
    .groupBy(ca.challengeId);
}

/** First graded attempt per learner per challenge, counted per challenge. */
export async function firstTries(ids?: string[]): Promise<FirstTryRow[]> {
  const db = await getDb();
  const first = db
    .selectDistinctOn([ca.userId, ca.challengeId], { challengeId: ca.challengeId, correct: ca.correct })
    .from(ca)
    .where(and(isNotNull(ca.correct), onlyIds(ids)))
    .orderBy(ca.userId, ca.challengeId, ca.createdAt, ca.id)
    .as("first");
  return db
    .select({
      challengeId: first.challengeId,
      tries: sql<number>`count(*)::int`,
      correct: sql<number>`(count(*) filter (where ${first.correct}))::int`,
    })
    .from(first)
    .groupBy(first.challengeId);
}

/** Wrong answers grouped by the stored answer (jsonb), per challenge. */
export async function wrongAnswers(ids?: string[]): Promise<WrongAnswerRow[]> {
  const db = await getDb();
  return db
    .select({ challengeId: ca.challengeId, answer: ca.answer, n: sql<number>`count(*)::int` })
    .from(ca)
    .where(and(eq(ca.correct, false), onlyIds(ids)))
    .groupBy(ca.challengeId, ca.answer);
}

/** Lesson funnel; review and placement sessions mix many lessons, so they are left out. */
export async function lessonFunnel(): Promise<FunnelInputRow[]> {
  const db = await getDb();
  return db
    .select({
      lessonId: ls.lessonId,
      started: sql<number>`count(*)::int`,
      completed: sql<number>`count(${ls.completedAt})::int`,
      avgMistakes: sql<number | null>`(avg(${ls.mistakes}) filter (where ${ls.completedAt} is not null))::float8`,
    })
    .from(ls)
    .where(notInArray(ls.kind, ["placement", "review"]))
    .groupBy(ls.lessonId);
}
