"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findChallenge, findLesson, getSegment, lessonsOf } from "@content/index";
import type { Lesson } from "@content/schema";
import { FRAMEWORK, scoreRisk, type RiskChoices, type RiskResult } from "@content/risk";
import { getDb } from "@/db/client";
import { getPathStatus, getUserState } from "@/db/queries";
import { challengeAttempts, lessonSessions, placements, riskProfiles, userProgress, xpEvents } from "@/db/schema";
import { syncBadges } from "@/features/badges/sync";
import { advanceStreak, lessonXp, localDay } from "@/features/gamification/engine";
import { MAX_HEARTS, XP_PRACTICE } from "@/features/gamification/rules";
import { ensureMembership } from "@/features/leagues/queries";
import { placementItems, unlockIndexFor } from "@/features/placement/placement";
import { getDueReviewIds, recordReviewAnswer } from "@/features/review/queries";
import { REVIEW_SESSION_SIZE } from "@/features/review/srs";
import { grade } from "@/features/lesson-engine/grade";
import type { Answer, GradeResult } from "@/features/lesson-engine/types";
import { getUserId } from "@/lib/auth";

/** Called by the lesson page. Refuses locked lessons; replaying a done lesson = practice. */
export async function startLessonSession(lessonId: string) {
  const userId = await getUserId();
  const loc = findLesson(lessonId);
  if (!loc) throw new Error("Lesson not found");
  await getUserState(userId);
  const status = (await getPathStatus(userId, loc.segment)).get(lessonId);
  if (status === "locked") return { error: "locked" as const };

  const db = await getDb();
  const [session] = await db
    .insert(lessonSessions)
    .values({ userId, lessonId, segmentId: loc.segment.id, isPractice: status === "done" })
    .returning();
  return { sessionId: session.id, isPractice: session.isPractice };
}

const REVIEW_LESSON_ID = "__review__";
const PLACEMENT_LESSON_ID = "__placement__";

/** Spaced-repetition session over questions the learner has due (they come from many lessons). */
export async function startReviewSession(challengeIds: string[]) {
  const userId = await getUserId();
  await getUserState(userId);
  const due = new Set(await getDueReviewIds(userId, REVIEW_SESSION_SIZE * 5));
  const items = challengeIds.filter((id) => due.has(id)).slice(0, REVIEW_SESSION_SIZE);
  if (!items.length) return { error: "nothing-due" as const };
  const db = await getDb();
  const [session] = await db
    .insert(lessonSessions)
    .values({ userId, lessonId: REVIEW_LESSON_ID, segmentId: "review", kind: "review", isPractice: true, items })
    .returning();
  return { sessionId: session.id, isPractice: true };
}

/** Placement test for a segment: one question per unit, answered once. */
export async function startPlacementSession(segmentId: string) {
  const userId = await getUserId();
  const segment = getSegment(segmentId);
  if (!segment) throw new Error("Segment not found");
  await getUserState(userId);
  const db = await getDb();
  const [session] = await db
    .insert(lessonSessions)
    .values({ userId, lessonId: PLACEMENT_LESSON_ID, segmentId, kind: "placement", items: placementItems(segment).map((i) => i.challenge.id) })
    .returning();
  return { sessionId: session.id, isPractice: false };
}

/** A review/placement session plays its stored questions as one virtual lesson. */
function virtualLesson(id: string, title: string, items: string[]): Lesson {
  const challenges = items.flatMap((cid) => {
    const c = findChallenge(cid);
    return c ? [c.challenge] : [];
  });
  return { id, title, kind: "standard", xp: XP_PRACTICE, minutes: 3, challenges };
}

async function loadSession(sessionId: string, userId: string) {
  const db = await getDb();
  const [session] = await db.select().from(lessonSessions).where(and(eq(lessonSessions.id, sessionId), eq(lessonSessions.userId, userId)));
  if (!session) throw new Error("Session not found");
  if (session.kind === "review" || session.kind === "placement") {
    const items = (session.items as string[] | null) ?? [];
    const lesson = virtualLesson(session.lessonId, session.kind === "review" ? "Ôn tập" : "Kiểm tra xếp lớp", items);
    // Review = practice: hearts can only come back. Placement never touches hearts.
    return { db, session, lesson, usesHearts: session.kind === "review" };
  }
  const loc = findLesson(session.lessonId);
  if (!loc) throw new Error("Lesson no longer exists");
  return { db, session, lesson: loc.lesson, usesHearts: loc.segment.heartsEnabled && loc.lesson.kind !== "profile" };
}

export type SubmitResult = GradeResult & { hearts: number; outOfHearts: boolean };

export async function submitAnswer(sessionId: string, challengeId: string, answer: Answer): Promise<SubmitResult> {
  const userId = await getUserId();
  const { db, session, lesson, usesHearts } = await loadSession(sessionId, userId);
  if (session.completedAt) throw new Error("Session already completed");
  const challenge = lesson.challenges.find((c) => c.id === challengeId);
  if (!challenge) throw new Error("Challenge not in lesson");

  const { progress } = await getUserState(userId);
  if (usesHearts && !session.isPractice && progress.hearts <= 0) {
    return { correct: null, hearts: 0, outOfHearts: true };
  }

  const result = grade(challenge, answer);
  await db.insert(challengeAttempts).values({ sessionId, userId, challengeId, correct: result.correct, answer });
  // Spaced repetition: mistakes enter "Cần ôn lại"; correct answers in a review session move the card on.
  if (result.correct !== null && session.kind !== "placement") {
    await recordReviewAnswer(userId, challengeId, findChallenge(challengeId)?.lesson.id ?? session.lessonId, result.correct, session.kind === "review");
  }

  let hearts = progress.hearts;
  if (usesHearts && result.correct === false && !session.isPractice) hearts = Math.max(0, hearts - 1);
  // Practising an old lesson earns hearts back (the clone's mechanic, kept; no paid refill).
  if (usesHearts && result.correct === true && session.isPractice) hearts = Math.min(MAX_HEARTS, hearts + 1);
  if (hearts !== progress.hearts) {
    await db.update(userProgress).set({ hearts, heartsUpdatedAt: new Date() }).where(eq(userProgress.userId, userId));
  }
  return { ...result, hearts, outOfHearts: usesHearts && hearts === 0 && result.correct === false };
}

export type LessonSummary = {
  xp: number;
  mistakes: number;
  perfect: boolean;
  streak: number;
  /** Risk self-check result, to be confirmed by the learner (framework §5) via confirmRiskProfile. */
  profile?: { riskId: number; result: RiskResult };
  /** Placement test outcome: lessons opened up to (not including) `unlockIndex`'s successors. */
  placement?: { segmentId: string; score: number; total: number; unlockIndex: number; nextLessonId?: string; nextLessonTitle?: string };
  /** Badges earned by this session (shown once on the summary). */
  newBadges: string[];
};

const UNGRADED = ["info", "profile", "goal_planner", "estimate", "reaction_sim", "timing_game"];

/**
 * Completion is verified from the stored attempts: every graded challenge must have a
 * correct attempt in this session (wrong ones are re-queued by the player, as in Duolingo).
 */
export async function completeLesson(sessionId: string): Promise<LessonSummary> {
  const userId = await getUserId();
  const { db, session, lesson } = await loadSession(sessionId, userId);
  if (session.completedAt) throw new Error("Session already completed");

  const attempts = await db.select().from(challengeAttempts).where(eq(challengeAttempts.sessionId, sessionId));
  const graded = lesson.challenges.filter((c) => !UNGRADED.includes(c.type));
  const isPlacement = session.kind === "placement";
  // Placement questions are answered once; every other session must end with each graded item answered correctly.
  const missing = graded.filter((c) => !attempts.some((a) => a.challengeId === c.id && (isPlacement || a.correct === true)));
  if (missing.length) throw new Error(`Lesson not finished: ${missing.map((c) => c.id).join(", ")}`);
  const mistakes = attempts.filter((a) => a.correct === false).length;

  const xp = isPlacement ? XP_PRACTICE : lessonXp({ baseXp: lesson.xp, kind: lesson.kind, mistakes, isPractice: session.isPractice });
  const perfect = mistakes === 0 && graded.length > 0;

  const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  const streak = advanceStreak({ streak: progress.streak, lastDay: progress.streakLastDay, freezes: progress.streakFreezes }, localDay(new Date()));

  await db.update(lessonSessions).set({ completedAt: new Date(), xpAwarded: xp, mistakes }).where(eq(lessonSessions.id, sessionId));
  await db
    .update(userProgress)
    .set({ xp: sql`${userProgress.xp} + ${xp}`, streak: streak.streak, streakLastDay: streak.lastDay, streakFreezes: streak.freezes })
    .where(eq(userProgress.userId, userId));
  const reason = session.kind === "lesson" ? (session.isPractice ? "practice" : "lesson") : session.kind;
  await db.insert(xpEvents).values({ userId, amount: xp, reason, lessonId: session.kind === "lesson" ? lesson.id : null, perfect: session.kind === "lesson" && perfect });

  let profile: LessonSummary["profile"];
  if (lesson.kind === "profile") {
    // Profile options are shown in authored order, so the stored choice is the option index.
    const choices: RiskChoices = {};
    for (const c of lesson.challenges) {
      if (c.type !== "profile") continue;
      const last = attempts.filter((a) => a.challengeId === c.id).at(-1);
      if (last) choices[c.id] = (last.answer as Extract<Answer, { choice: number }>).choice;
    }
    const result = scoreRisk(choices);
    const [row] = await db
      .insert(riskProfiles)
      .values({
        userId,
        profile: result.profile,
        // Full scoring trail (answers, totals, overrides) for audit; the column name predates the framework.
        dimensions: { ...result, choices },
        capped: result.overrides.length > 0,
        quizLessonId: lesson.id,
        frameworkVersion: FRAMEWORK.version,
      })
      .returning({ id: riskProfiles.id });
    profile = { riskId: row.id, result };
  }

  let placement: LessonSummary["placement"];
  if (isPlacement) {
    const segment = getSegment(session.segmentId)!;
    // First answer per question decides the unit.
    const results = graded.map((c) => ({ unitId: findChallenge(c.id)!.unit.id, correct: attempts.find((a) => a.challengeId === c.id)?.correct === true }));
    const unlockIndex = unlockIndexFor(segment, results);
    await db.insert(placements).values({ userId, segmentId: segment.id, unlockIndex, score: results.filter((r) => r.correct).length, total: results.length, results });
    const next = lessonsOf(segment)[unlockIndex];
    placement = { segmentId: segment.id, score: results.filter((r) => r.correct).length, total: results.length, unlockIndex, nextLessonId: next?.id, nextLessonTitle: next?.title };
  }

  await ensureMembership(userId);
  const newBadges = await syncBadges(userId);
  revalidatePath("/", "layout");
  return { xp, mistakes, perfect, streak: streak.streak, profile, placement, newBadges };
}
