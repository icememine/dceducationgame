import "server-only";
import { and, desc, eq, gte, ilike, inArray, isNull, lt, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import { aiMessages, complianceReviews as cr, riskProfiles, users } from "@/db/schema";
import type { ReviewOutcome, StatusFilter } from "./review";

/** Read side for /admin/ai-review and /admin/risk-audit, plus the append-only review write. */

const latest = (kind: "ai" | "risk") =>
  getDb().then((db) =>
    db
      .selectDistinctOn([cr.targetId], { targetId: cr.targetId, outcome: cr.outcome, note: cr.note, reviewer: cr.reviewer, reviewedAt: cr.createdAt })
      .from(cr)
      .where(eq(cr.kind, kind))
      .orderBy(cr.targetId, desc(cr.createdAt), desc(cr.id))
      .as("latest"),
  );

const statusWhere = (col: SQL | unknown, status: StatusFilter): SQL | undefined =>
  status === "all" ? undefined : status === "todo" ? sql`${col} is null` : sql`${col} = ${status}`;

export type AiFilters = { status: StatusFilter; flag: string; from?: Date; to?: Date; q?: string; limit?: number };

/** AI answers, newest first. flag: "any" (at least one guardrail flag), "none", "all" or a flag id. */
export async function listAiMessages(f: AiFilters) {
  const db = await getDb();
  const l = await latest("ai");
  const where = and(
    f.flag === "any" ? sql`jsonb_array_length(${aiMessages.flags}) > 0` : f.flag === "none" ? sql`jsonb_array_length(${aiMessages.flags}) = 0` : f.flag === "all" ? undefined : sql`${aiMessages.flags} @> ${JSON.stringify([f.flag])}::jsonb`,
    statusWhere(l.outcome, f.status),
    f.from ? gte(aiMessages.createdAt, f.from) : undefined,
    f.to ? lt(aiMessages.createdAt, f.to) : undefined,
    f.q ? or(ilike(aiMessages.question, `%${f.q}%`), ilike(aiMessages.answer, `%${f.q}%`)) : undefined,
  );
  const rows = await db
    .select({
      id: aiMessages.id, userId: aiMessages.userId, nickname: users.nickname, surface: aiMessages.surface, question: aiMessages.question, answer: aiMessages.answer,
      mode: aiMessages.mode, model: aiMessages.model, flags: aiMessages.flags, createdAt: aiMessages.createdAt,
      outcome: l.outcome, note: l.note, reviewer: l.reviewer, reviewedAt: l.reviewedAt,
    })
    .from(aiMessages)
    .innerJoin(users, eq(users.id, aiMessages.userId))
    .leftJoin(l, eq(l.targetId, aiMessages.id))
    .where(where)
    .orderBy(desc(aiMessages.createdAt))
    .limit(f.limit ?? 100);
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(aiMessages).leftJoin(l, eq(l.targetId, aiMessages.id)).where(where);
  return { rows, total: n };
}

export type RiskFilters = { status: StatusFilter; view: string; from?: Date; to?: Date; limit?: number };

/** Needs a human look: §5.2 special cases, a capacity warning (③) or a higher choice. */
const attentionSql = sql`(jsonb_array_length(${riskProfiles.flags}) > 0 or ${riskProfiles.dimensions}->>'capacityWarning' is not null or ${riskProfiles.decision} = 'higher')`;

/** Risk-check results, newest first. view: "attention" | "confirmed" | "unconfirmed" | "all" | a §5.2 flag id. */
export async function listRiskProfiles(f: RiskFilters) {
  const db = await getDb();
  const l = await latest("risk");
  const where = and(
    f.view === "attention" ? attentionSql : f.view === "confirmed" ? sql`${riskProfiles.decision} is not null` : f.view === "unconfirmed" ? isNull(riskProfiles.decision) : f.view === "all" ? undefined : sql`${riskProfiles.flags} @> ${JSON.stringify([f.view])}::jsonb`,
    statusWhere(l.outcome, f.status),
    f.from ? gte(riskProfiles.createdAt, f.from) : undefined,
    f.to ? lt(riskProfiles.createdAt, f.to) : undefined,
  );
  const rows = await db
    .select({
      id: riskProfiles.id, userId: riskProfiles.userId, nickname: users.nickname, profile: riskProfiles.profile, finalProfile: riskProfiles.finalProfile,
      decision: riskProfiles.decision, frameworkVersion: riskProfiles.frameworkVersion, dimensions: riskProfiles.dimensions, flags: riskProfiles.flags,
      acknowledgedAt: riskProfiles.acknowledgedAt, confirmedAt: riskProfiles.confirmedAt, createdAt: riskProfiles.createdAt,
      outcome: l.outcome, note: l.note, reviewer: l.reviewer, reviewedAt: l.reviewedAt,
    })
    .from(riskProfiles)
    .innerJoin(users, eq(users.id, riskProfiles.userId))
    .leftJoin(l, eq(l.targetId, riskProfiles.id))
    .where(where)
    .orderBy(desc(riskProfiles.createdAt))
    .limit(f.limit ?? 100);
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(riskProfiles).leftJoin(l, eq(l.targetId, riskProfiles.id)).where(where);
  return { rows, total: n };
}

/** Full review history for the listed targets, newest first. */
export async function reviewHistory(kind: "ai" | "risk", ids: number[]) {
  if (!ids.length) return new Map<number, { outcome: string; note: string; reviewer: string; createdAt: Date }[]>();
  const db = await getDb();
  const rows = await db.select().from(cr).where(and(eq(cr.kind, kind), inArray(cr.targetId, ids))).orderBy(desc(cr.createdAt), desc(cr.id));
  const out = new Map<number, typeof rows>();
  for (const r of rows) out.set(r.targetId, [...(out.get(r.targetId) ?? []), r]);
  return out;
}

export async function addReview(kind: "ai" | "risk", targetId: number, outcome: ReviewOutcome, note: string, reviewer: string) {
  const db = await getDb();
  const table = kind === "ai" ? aiMessages : riskProfiles;
  const [exists] = await db.select({ id: table.id }).from(table).where(eq(table.id, targetId));
  if (!exists) throw new Error("Không tìm thấy bản ghi");
  await db.insert(cr).values({ kind, targetId, outcome, note: note.trim().slice(0, 2000), reviewer });
}

/** Open work for the admin home page. */
export async function complianceCounts() {
  const db = await getDb();
  const [la, lr] = await Promise.all([latest("ai"), latest("risk")]);
  const [ai] = await db.select({ n: sql<number>`count(*)::int` }).from(aiMessages).leftJoin(la, eq(la.targetId, aiMessages.id)).where(and(sql`jsonb_array_length(${aiMessages.flags}) > 0`, sql`${la.outcome} is null`));
  const [risk] = await db.select({ n: sql<number>`count(*)::int` }).from(riskProfiles).leftJoin(lr, eq(lr.targetId, riskProfiles.id)).where(and(attentionSql, sql`${lr.outcome} is null`));
  return { aiFlagged: ai.n, riskAttention: risk.n };
}
