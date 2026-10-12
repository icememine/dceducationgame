"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { applyDecision, needsAcknowledgement, specialCases, type RiskChoices, type RiskResult } from "@content/risk";
import { getDb } from "@/db/client";
import { riskProfiles } from "@/db/schema";
import { getUserId } from "@/lib/auth";

const input = z.object({
  riskId: z.number().int().positive(),
  decision: z.enum(["agree", "lower", "higher"]),
  acknowledged: z.boolean(),
});

/**
 * Framework §5: the learner agrees with the assessed profile, moves one step lower, or one step
 * higher with an explicit acknowledgement. The decision, acknowledgement time and §5.2 special
 * cases are stored with the assessment for Compliance. A result can be confirmed once.
 */
export async function confirmRiskProfile(raw: z.input<typeof input>) {
  const { riskId, decision, acknowledged } = input.parse(raw);
  const userId = await getUserId();
  const db = await getDb();
  const [row] = await db.select().from(riskProfiles).where(and(eq(riskProfiles.id, riskId), eq(riskProfiles.userId, userId)));
  if (!row) return { error: "not-found" as const };
  if (row.decision) return { error: "already-confirmed" as const };

  const { choices, ...result } = row.dimensions as RiskResult & { choices: RiskChoices };
  if (needsAcknowledgement(result, decision) && !acknowledged) return { error: "acknowledgement-required" as const };

  const final = applyDecision(result.profile, decision);
  const flags = specialCases(result, final, decision, choices);
  const now = new Date();
  await db
    .update(riskProfiles)
    .set({ decision, finalProfile: final, flags, confirmedAt: now, acknowledgedAt: acknowledged ? now : null })
    .where(and(eq(riskProfiles.id, riskId), isNull(riskProfiles.decision)));
  revalidatePath("/profile");
  return { finalProfile: final, flags };
}
