import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { can, type Permission } from "@/features/staff/roles";
import { adminAreaEnabled, staffForToken, type Staff } from "@/features/staff/server";

/**
 * Staff-only area (/admin): personal accounts with roles (src/features/staff). The session cookie
 * holds a random token scoped to /admin; the database keeps only its hash, so signing out,
 * deactivating an account or resetting a password ends access at once.
 * Production with no bootstrap login and no accounts: the whole area is 404.
 */
export const ADMIN_COOKIE = "dc_admin";

export async function sessionToken() {
  return (await cookies()).get(ADMIN_COOKIE)?.value;
}

export async function getStaff(): Promise<Staff | null> {
  return staffForToken(await sessionToken());
}

/**
 * For pages: 404 when /admin is off, the login page when signed out, the password page when a
 * new password is required, and back to /admin (with a notice) when the role lacks permission.
 */
export async function requireStaff(perm?: Permission, opts: { allowPasswordChange?: boolean } = {}): Promise<Staff> {
  if (!(await adminAreaEnabled())) notFound();
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword && !opts.allowPasswordChange) redirect("/admin/account");
  if (perm && !can(staff.role, perm)) redirect("/admin?denied=1");
  return staff;
}

/** For server actions and export routes: throws unless signed in with the permission. */
export async function assertStaff(perm?: Permission): Promise<Staff> {
  const staff = await getStaff();
  if (!staff || staff.mustChangePassword || (perm && !can(staff.role, perm))) throw new Error("Không có quyền thực hiện thao tác này");
  return staff;
}
