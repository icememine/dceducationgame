import "server-only";
import { and, asc, desc, eq, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { findChallenge } from "@content/index";
import { getDb } from "@/db/client";
import { reviewItems } from "@/db/schema";
import { onCorrectReview, onWrong, REVIEW_SESSION_SIZE, REVIEWABLE } from "./srs";

/** Record a graded answer for spaced repetition. Mistakes always count; correct answers only move a card in review sessions. */
export async function recordReviewAnswer(userId: string, challengeId: string, lessonId: string, correct: boolean, inReview: boolean, now = new Date()) {
  const c = findChallenge(challengeId);
  if (!c || !REVIEWABLE.has(c.challenge.type)) return;
  const db = await getDb();
  const [prev] = await db.select().from(reviewItems).where(and(eq(reviewItems.userId, userId), eq(reviewItems.challengeId, challengeId)));
  if (!correct) {
    const next = onWrong(prev, now);
    await db
      .insert(reviewItems)
      .values({ userId, challengeId, lessonId, ...next, lastWrongAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: [reviewItems.userId, reviewItems.challengeId], set: { ...next, lastWrongAt: now, updatedAt: now } });
    return;
  }
  if (!inReview || !prev || prev.retiredAt) return;
  const next = onCorrectReview(prev, now);
  await db.update(reviewItems).set({ ...next, updatedAt: now }).where(and(eq(reviewItems.userId, userId), eq(reviewItems.challengeId, challengeId)));
}

/** Questions due now, oldest due first, limited to what still exists in the content. */
export async function getDueReviewIds(userId: string, limit = REVIEW_SESSION_SIZE, now = new Date()) {
  const db = await getDb();
  const rows = await db
    .select({ challengeId: reviewItems.challengeId })
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), isNull(reviewItems.retiredAt), lte(reviewItems.dueAt, now)))
    .orderBy(asc(reviewItems.dueAt))
    .limit(limit * 2);
  return rows.map((r) => r.challengeId).filter((id) => findChallenge(id)).slice(0, limit);
}

/** "Cần ôn lại": counts plus the most recent mistakes, for the profile and learn pages. */
export async function getReviewOverview(userId: string, now = new Date()) {
  const db = await getDb();
  const [counts] = await db
    .select({
      due: sql<number>`cast(count(*) filter (where ${reviewItems.retiredAt} is null and ${reviewItems.dueAt} <= ${now}) as int)`,
      learning: sql<number>`cast(count(*) filter (where ${reviewItems.retiredAt} is null) as int)`,
      retired: sql<number>`cast(count(*) filter (where ${reviewItems.retiredAt} is not null) as int)`,
    })
    .from(reviewItems)
    .where(eq(reviewItems.userId, userId));
  const recent = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), isNull(reviewItems.retiredAt), isNotNull(reviewItems.lastWrongAt)))
    .orderBy(desc(reviewItems.lastWrongAt))
    .limit(5);
  return {
    due: counts?.due ?? 0,
    learning: counts?.learning ?? 0,
    retired: counts?.retired ?? 0,
    recent: recent.flatMap((r) => {
      const loc = findChallenge(r.challengeId);
      if (!loc) return [];
      const c = loc.challenge;
      const prompt = "prompt" in c ? c.prompt : "title" in c ? c.title : c.id;
      return [{ challengeId: r.challengeId, lessonId: loc.lesson.id, lessonTitle: loc.lesson.title, prompt, box: r.box, dueAt: r.dueAt }];
    }),
  };
}
