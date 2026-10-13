import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { placements } from "@/db/schema";

/** Highest unlock index the learner reached by placement in a segment (0 if never tested). */
export async function getPlacementUnlock(userId: string, segmentId: string) {
  const db = await getDb();
  const rows = await db.select({ unlockIndex: placements.unlockIndex }).from(placements).where(and(eq(placements.userId, userId), eq(placements.segmentId, segmentId))).orderBy(desc(placements.unlockIndex)).limit(1);
  return rows[0]?.unlockIndex ?? 0;
}

export async function getLatestPlacement(userId: string, segmentId: string) {
  const db = await getDb();
  const [row] = await db.select().from(placements).where(and(eq(placements.userId, userId), eq(placements.segmentId, segmentId))).orderBy(desc(placements.createdAt)).limit(1);
  return row;
}
