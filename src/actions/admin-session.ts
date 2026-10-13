"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { staffUsers } from "@/db/schema";
import { ADMIN_COOKIE, getStaff, sessionToken } from "@/features/admin/auth";
import { hashPassword, passwordProblem, SESSION_HOURS, verifyPassword } from "@/features/staff/password";
import { audit, endAllSessions, endSession, login } from "@/features/staff/server";

export type LoginState = { error?: string };

/** /admin/login. A short delay on failure slows down password guessing (plus the lockout). */
export async function adminLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const r = await login(String(form.get("username") ?? ""), String(form.get("password") ?? ""));
  if (!r.ok) {
    await new Promise((res) => setTimeout(res, 600));
    return { error: r.error };
  }
  (await cookies()).set(ADMIN_COOKIE, r.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_HOURS * 3600,
  });
  redirect(r.staff.mustChangePassword ? "/admin/account" : "/admin");
}

export async function adminLogout() {
  const token = await sessionToken();
  const staff = await getStaff();
  await endSession(token);
  if (staff) await audit(staff, "logout");
  (await cookies()).set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}

export type PasswordState = { error?: string; done?: boolean };

/** Change one's own password (required after creation or a reset). Other sessions are signed out. */
export async function changeOwnPassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const staff = await getStaff();
  if (!staff) return { error: "Phiên đăng nhập đã hết hạn" };
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "Hai lần nhập mật khẩu mới không khớp" };
  const problem = passwordProblem(next, staff.username);
  if (problem) return { error: problem };
  const db = await getDb();
  const [row] = await db.select({ hash: staffUsers.passwordHash }).from(staffUsers).where(eq(staffUsers.id, staff.id));
  if (!row || !(await verifyPassword(current, row.hash))) return { error: "Mật khẩu hiện tại không đúng" };
  if (current === next) return { error: "Mật khẩu mới phải khác mật khẩu hiện tại" };
  await db.update(staffUsers).set({ passwordHash: await hashPassword(next), mustChangePassword: false }).where(eq(staffUsers.id, staff.id));
  await endAllSessions(staff.id, await sessionToken());
  await audit(staff, "password-change", staff.username);
  return { done: true };
}
