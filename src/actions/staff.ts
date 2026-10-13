"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client";
import { staffUsers } from "@/db/schema";
import { assertStaff } from "@/features/admin/auth";
import { hashPassword, temporaryPassword, validUsername } from "@/features/staff/password";
import { isRole, ROLES } from "@/features/staff/roles";
import { audit, endAllSessions } from "@/features/staff/server";

export type StaffState = { error?: string; created?: { username: string; password: string }; reset?: { username: string; password: string }; saved?: boolean };

/** Admin creates an account; the temporary password is shown once and must be changed at first sign-in. */
export async function createStaff(_prev: StaffState, form: FormData): Promise<StaffState> {
  const me = await assertStaff("staff");
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const displayName = String(form.get("displayName") ?? "").trim().slice(0, 60);
  const role = form.get("role");
  if (!validUsername(username)) return { error: "Tên đăng nhập: 3–32 ký tự, chữ thường, số, dấu chấm hoặc gạch ngang" };
  if (!displayName) return { error: "Hãy nhập họ tên" };
  if (!isRole(role)) return { error: "Vai trò không hợp lệ" };
  const db = await getDb();
  const password = temporaryPassword();
  const [row] = await db.insert(staffUsers).values({ username, displayName, role, passwordHash: await hashPassword(password), mustChangePassword: true }).onConflictDoNothing().returning();
  if (!row) return { error: "Tên đăng nhập đã tồn tại" };
  await audit(me, "staff-create", username, { role, displayName });
  revalidatePath("/admin/staff");
  return { created: { username, password } };
}

async function activeAdmins(excludeId?: number) {
  const db = await getDb();
  const [r] = await db.select({ n: count() }).from(staffUsers).where(and(eq(staffUsers.role, "admin"), eq(staffUsers.active, true), excludeId ? ne(staffUsers.id, excludeId) : undefined));
  return r.n;
}

/** Change name, role or active status. Role changes and deactivation sign the person out everywhere. */
export async function updateStaff(_prev: StaffState, form: FormData): Promise<StaffState> {
  const me = await assertStaff("staff");
  const id = Number(form.get("id"));
  const role = form.get("role");
  const active = form.get("active") === "on";
  const displayName = String(form.get("displayName") ?? "").trim().slice(0, 60);
  if (!Number.isInteger(id) || !isRole(role) || !displayName) return { error: "Thiếu thông tin" };
  const db = await getDb();
  const [before] = await db.select().from(staffUsers).where(eq(staffUsers.id, id));
  if (!before) return { error: "Không tìm thấy tài khoản" };
  const losesAdmin = before.role === "admin" && before.active && (role !== "admin" || !active);
  if (losesAdmin && (await activeAdmins(id)) === 0) return { error: "Phải còn ít nhất một quản trị viên đang hoạt động" };
  if (id === me.id && !active) return { error: "Không thể tự vô hiệu hoá tài khoản của mình" };
  await db.update(staffUsers).set({ role, active, displayName }).where(eq(staffUsers.id, id));
  if (before.role !== role || before.active !== active) await endAllSessions(id);
  await audit(me, "staff-update", before.username, {
    ...(before.role !== role && { role: `${ROLES[before.role as keyof typeof ROLES]?.label ?? before.role} → ${ROLES[role].label}` }),
    ...(before.active !== active && { active }),
    ...(before.displayName !== displayName && { displayName }),
  });
  revalidatePath("/admin/staff");
  return { saved: true };
}

/** New temporary password (shown once); signs the person out and requires a change at next sign-in. */
export async function resetStaffPassword(_prev: StaffState, form: FormData): Promise<StaffState> {
  const me = await assertStaff("staff");
  const id = Number(form.get("id"));
  const db = await getDb();
  const [user] = await db.select().from(staffUsers).where(eq(staffUsers.id, id));
  if (!user) return { error: "Không tìm thấy tài khoản" };
  const password = temporaryPassword();
  await db.update(staffUsers).set({ passwordHash: await hashPassword(password), mustChangePassword: true }).where(eq(staffUsers.id, id));
  await endAllSessions(id);
  await audit(me, "staff-reset", user.username);
  return { reset: { username: user.username, password } };
}
