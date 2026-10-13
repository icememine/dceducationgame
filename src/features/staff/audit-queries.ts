import "server-only";
import { and, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import { staffAudit } from "@/db/schema";

export type AuditFilters = { username?: string; action?: string; from?: Date; to?: Date; limit?: number };

export async function listAudit(f: AuditFilters) {
  const db = await getDb();
  const where: (SQL | undefined)[] = [
    f.username ? eq(staffAudit.username, f.username) : undefined,
    f.action ? eq(staffAudit.action, f.action) : undefined,
    f.from ? gte(staffAudit.createdAt, f.from) : undefined,
    f.to ? lt(staffAudit.createdAt, f.to) : undefined,
  ];
  return db.select().from(staffAudit).where(and(...where)).orderBy(desc(staffAudit.createdAt), desc(staffAudit.id)).limit(f.limit ?? 200);
}

export async function auditUsernames() {
  const db = await getDb();
  return (await db.selectDistinct({ u: staffAudit.username }).from(staffAudit).orderBy(staffAudit.username)).map((r) => r.u);
}
