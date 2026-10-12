"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findLesson } from "@content/index";
import { profileInfo, scoreRisk, type ProfileInfo, type RiskChoices } from "@content/risk";
import { getDb } from "@/db/client";
import { getCompletedLessonIds, getUserState, pathStatus } from "@/db/queries";
import { challengeAttempts, lessonSessions, riskProfiles, userProgress, xpEvents } from "@/db/schema";
import { advanceStreak, lessonXp, localDay } from "@/features/gamification/engine";
import { MAX_HEARTS } from "@/features/gamification/rules";
import { grade } from "@/features/lesson-engine/grade";
import type { Answer, GradeResult } from "@/features/lesson-engine/types";
import { getUserId } from "@/lib/auth";

/** Called by the lesson page. Refuses locked lessons; replaying a done lesson = practice. */
export async function startLessonSession(lessonId: string) {
  const userId = await getUserId();
  const loc = findLesson(lessonId);
  if (!loc) throw new Error("Lesson not found");
  await getUserState(userId);
  const completed = await getCompletedLessonIds(userId);
  const status = pathStatus(loc.segment, completed).get(lessonId);
  if (status === "locked") return { error: "locked" as const };

  const db = await getDb();
  const [session] = await db
    .insert(lessonSessions)
    .values({ userId, lessonId, segmentId: loc.segment.id, isPractice: status === "done" })
    .returning();
  return { sessionId: session.id, isPractice: session.isPractice };
}

async function loadSession(sessionId: string, userId: string) {
  const db = await getDb();
  const [session] = await db.select().from(lessonSessions).where(and(eq(lessonSessions.id, sessionId), eq(lessonSessions.userId, userId)));
  if (!session) throw new Error("Session not found");
  const loc = findLesson(session.lessonId);
  if (!loc) throw new Error("Lesson no longer exists");
  return { db, session, loc };
}

export type SubmitResult = GradeResult & { hearts: number; outOfHearts: boolean };

export async function submitAnswer(sessionId: string, challengeId: string, answer: Answer): Promise<SubmitResult> {
  const userId = await getUserId();
  const { db, session, loc } = await loadSession(sessionId, userId);
  if (session.completedAt) throw new Error("Session already completed");
  const challenge = loc.lesson.challenges.find((c) => c.id === challengeId);
  if (!challenge) throw new Error("Challenge not in lesson");

  const { progress } = await getUserState(userId);
  const usesHearts = loc.segment.heartsEnabled && loc.lesson.kind !== "profile";
  if (usesHearts && !session.isPractice && progress.hearts <= 0) {
    return { correct: null, hearts: 0, outOfHearts: true };
  }

  const result = grade(challenge, answer);
  await db.insert(challengeAttempts).values({ sessionId, userId, challengeId, correct: result.correct, answer });

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
  profile?: ProfileInfo & {
    /** Profile name the learner said they are willing to take, before limits. */
    willingName: string;
    /** Why the result is lower than `willingName` (empty when it isn't). */
    reasons: string[];
    notes: string[];
  };
};

/**
 * Completion is verified from the stored attempts: every graded challenge must have a
 * correct attempt in this session (wrong ones are re-queued by the player, as in Duolingo).
 */
export async function completeLesson(sessionId: string): Promise<LessonSummary> {
  const userId = await getUserId();
  const { db, session, loc } = await loadSession(sessionId, userId);
  if (session.completedAt) throw new Error("Session already completed");

  const attempts = await db.select().from(challengeAttempts).where(eq(challengeAttempts.sessionId, sessionId));
  const graded = loc.lesson.challenges.filter((c) => !["info", "profile", "goal_planner"].includes(c.type));
  const missing = graded.filter((c) => !attempts.some((a) => a.challengeId === c.id && a.correct === true));
  if (missing.length) throw new Error(`Lesson not finished: ${missing.map((c) => c.id).join(", ")}`);
  const mistakes = attempts.filter((a) => a.correct === false).length;

  const xp = lessonXp({ baseXp: loc.lesson.xp, kind: loc.lesson.kind, mistakes, isPractice: session.isPractice });
  const perfect = mistakes === 0 && graded.length > 0;

  const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  const streak = advanceStreak({ streak: progress.streak, lastDay: progress.streakLastDay, freezes: progress.streakFreezes }, localDay(new Date()));

  await db.update(lessonSessions).set({ completedAt: new Date(), xpAwarded: xp, mistakes }).where(eq(lessonSessions.id, sessionId));
  await db
    .update(userProgress)
    .set({ xp: sql`${userProgress.xp} + ${xp}`, streak: streak.streak, streakLastDay: streak.lastDay, streakFreezes: streak.freezes })
    .where(eq(userProgress.userId, userId));
  await db.insert(xpEvents).values({ userId, amount: xp, reason: session.isPractice ? "practice" : "lesson", lessonId: loc.lesson.id, perfect });

  let profile: LessonSummary["profile"];
  if (loc.lesson.kind === "profile") {
    // Profile options are shown in authored order, so the stored choice is the option index.
    const choices: RiskChoices = {};
    for (const c of loc.lesson.challenges) {
      if (c.type !== "profile") continue;
      const last = attempts.filter((a) => a.challengeId === c.id).at(-1);
      if (last) choices[c.id] = (last.answer as Extract<Answer, { choice: number }>).choice;
    }
    const result = scoreRisk(choices);
    await db.insert(riskProfiles).values({
      userId,
      profile: result.profile,
      // Column predates the rules model; it now keeps the full explanation for audit and the profile page.
      dimensions: { willing: result.willing, reasons: result.reasons, notes: result.notes, choices },
      capped: result.reasons.length > 0,
      quizLessonId: loc.lesson.id,
    });
    profile = { ...profileInfo(result.profile), willingName: profileInfo(result.willing).name, reasons: result.reasons.map((r) => r.reason), notes: result.notes };
  }

  revalidatePath("/", "layout");
  return { xp, mistakes, perfect, streak: streak.streak, profile };
}
