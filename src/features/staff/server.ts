import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, count, eq, gt, gte, lt } from "drizzle-orm";
import { getDb } from "@/db/client";
import { staffAudit, staffSessions, staffUsers } from "@/db/schema";
import { hashPassword, LOCKOUT, SESSION_HOURS, verifyPassword } from "./password";
import type { Role } from "./roles";

export type Staff = { id: number; username: string; displayName: string; role: Role; mustChangePassword: boolean };

/**
 * Bootstrap login: ADMIN_USERNAME + ADMIN_PASSWORD (or, outside production, the test login in
 * docs/ADMIN_TEST.md). The first successful sign-in with it creates that person as an admin
 * account; from then on the account's own (hashed) password is what counts.
 */
export function bootstrapCredentials(): { username: string; password: string } | undefined {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (username && password) return { username: username.toLowerCase(), password };
  return process.env.NODE_ENV === "production" ? undefined : { username: "admin", password: "rong-admin-2026" };
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function audit(who: { id: number | null; username: string }, action: string, target?: string | null, detail: Record<string, unknown> = {}) {
  const db = await getDb();
  await db.insert(staffAudit).values({ staffId: who.id, username: who.username, action, target: target ?? null, detail });
}

export async function staffCount() {
  const db = await getDb();
  const [r] = await db.select({ n: count() }).from(staffUsers).where(eq(staffUsers.active, true));
  return r.n;
}

/** /admin exists when there is a bootstrap login or at least one active account. */
export async function adminAreaEnabled() {
  return !!bootstrapCredentials() || (await staffCount()) > 0;
}

export async function staffForToken(token: string | undefined): Promise<Staff | null> {
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: staffUsers.id, username: staffUsers.username, displayName: staffUsers.displayName, role: staffUsers.role, mustChangePassword: staffUsers.mustChangePassword })
    .from(staffSessions)
    .innerJoin(staffUsers, eq(staffUsers.id, staffSessions.staffId))
    .where(and(eq(staffSessions.tokenHash, sha(token)), gt(staffSessions.expiresAt, new Date()), eq(staffUsers.active, true)));
  return row ? { ...row, role: row.role as Role } : null;
}

async function failedRecently(username: string, now: Date) {
  const db = await getDb();
  const since = new Date(now.getTime() - LOCKOUT.minutes * 60_000);
  const [r] = await db.select({ n: count() }).from(staffAudit).where(and(eq(staffAudit.username, username), eq(staffAudit.action, "login-failed"), gte(staffAudit.createdAt, since)));
  return r.n;
}

export type LoginResult = { ok: true; token: string; staff: Staff } | { ok: false; error: string };

/** Check credentials (with lockout), bootstrap the first admin if needed, open a session. */
export async function login(rawUsername: string, password: string, now = new Date()): Promise<LoginResult> {
  const username = rawUsername.trim().toLowerCase();
  const db = await getDb();
  if ((await failedRecently(username, now)) >= LOCKOUT.attempts) {
    await audit({ id: null, username }, "login-locked");
    return { ok: false, error: `Tài khoản tạm khoá sau ${LOCKOUT.attempts} lần sai. Thử lại sau ${LOCKOUT.minutes} phút.` };
  }
  let [user] = await db.select().from(staffUsers).where(eq(staffUsers.username, username));
  const boot = bootstrapCredentials();
  if (!user && boot && username === boot.username && password === boot.password) {
    [user] = await db
      .insert(staffUsers)
      .values({ username, displayName: "Quản trị viên", role: "admin", passwordHash: await hashPassword(password), mustChangePassword: false })
      .onConflictDoNothing()
      .returning();
    if (user) await audit({ id: user.id, username }, "staff-bootstrap", username, { role: "admin" });
    else [user] = await db.select().from(staffUsers).where(eq(staffUsers.username, username));
  }
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    await audit({ id: user?.id ?? null, username }, "login-failed", null, user && !user.active ? { reason: "inactive" } : {});
    return { ok: false, error: "Sai tên đăng nhập hoặc mật khẩu" };
  }
  const token = randomBytes(32).toString("base64url");
  await db.insert(staffSessions).values({ tokenHash: sha(token), staffId: user.id, expiresAt: new Date(now.getTime() + SESSION_HOURS * 3_600_000) });
  await db.update(staffUsers).set({ lastLoginAt: now }).where(eq(staffUsers.id, user.id));
  // Housekeeping: drop expired sessions.
  await db.delete(staffSessions).where(lt(staffSessions.expiresAt, now));
  await audit({ id: user.id, username }, "login");
  return { ok: true, token, staff: { id: user.id, username, displayName: user.displayName, role: user.role as Role, mustChangePassword: user.mustChangePassword } };
}

export async function endSession(token: string | undefined) {
  if (!token) return;
  const db = await getDb();
  await db.delete(staffSessions).where(eq(staffSessions.tokenHash, sha(token)));
}

/** Sign a person out everywhere (deactivation, role change, password reset). */
export async function endAllSessions(staffId: number, keepToken?: string) {
  const db = await getDb();
  const sessions = await db.select({ t: staffSessions.tokenHash }).from(staffSessions).where(eq(staffSessions.staffId, staffId));
  for (const s of sessions) if (!keepToken || s.t !== sha(keepToken)) await db.delete(staffSessions).where(eq(staffSessions.tokenHash, s.t));
}
