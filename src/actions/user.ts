"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSegment } from "@content/index";
import { goalKind } from "@content/schema";
import { getDb } from "@/db/client";
import { ensureUser } from "@/db/queries";
import { goals, users } from "@/db/schema";
import { DAILY_GOAL_OPTIONS } from "@/features/gamification/rules";
import { getUserId } from "@/lib/auth";

const onboardingInput = z.object({
  nickname: z.string().trim().min(1).max(24),
  dailyGoalMinutes: z.number().refine((n) => (DAILY_GOAL_OPTIONS as readonly number[]).includes(n)),
  segmentId: z.string().refine((id) => !!getSegment(id)),
});

export async function completeOnboarding(input: z.input<typeof onboardingInput>) {
  const data = onboardingInput.parse(input);
  const userId = await getUserId();
  await ensureUser(userId);
  const db = await getDb();
  await db
    .update(users)
    .set({ nickname: data.nickname, dailyGoalMinutes: data.dailyGoalMinutes, activeSegmentId: data.segmentId, onboardedAt: new Date() })
    .where(eq(users.id, userId));
  // Learners who already know something can test out of what they know (placement test).
  redirect(data.segmentId === "my-plan" ? "/learn" : `/placement/${data.segmentId}`);
}

export async function setActiveSegment(segmentId: string) {
  if (!getSegment(segmentId)) throw new Error("Unknown segment");
  const userId = await getUserId();
  await ensureUser(userId);
  const db = await getDb();
  await db.update(users).set({ activeSegmentId: segmentId }).where(eq(users.id, userId));
  revalidatePath("/", "layout");
  redirect("/learn");
}

const goalInput = z.object({
  kind: goalKind,
  target: z.number().positive().max(1e12),
  monthly: z.number().nonnegative().max(1e10),
  initial: z.number().nonnegative().max(1e12),
  annualReturn: z.number().min(0).max(0.3),
});

export async function saveGoal(input: z.input<typeof goalInput>) {
  const data = goalInput.parse(input);
  const userId = await getUserId();
  await ensureUser(userId);
  const db = await getDb();
  await db.insert(goals).values({ userId, ...data });
  revalidatePath("/profile");
}
