import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

/**
 * Staff-only area (/admin): sign in at /admin/login with ADMIN_USERNAME + ADMIN_PASSWORD.
 * A hash of the credentials is kept in an httpOnly cookie scoped to /admin, so changing the
 * password signs everyone out. Production without both variables: the whole area is 404.
 * Development (NODE_ENV !== "production") falls back to the test login in docs/ADMIN_TEST.md.
 */
export const ADMIN_COOKIE = "dc_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const DEV_ADMIN = { username: "admin", password: "rong-admin-2026" } as const;

export function adminCredentials(): { username: string; password: string } | undefined {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (username && password) return { username, password };
  return process.env.NODE_ENV === "production" ? undefined : DEV_ADMIN;
}

/** True when the admin area is switched on (credentials configured, or dev). */
export const adminEnabled = () => !!adminCredentials();

const digest = (s: string) => createHash("sha256").update(`dc-admin:${s}`).digest();

/** Cookie value for the configured login (a hash; the password never sits in the browser). */
export function adminCookieValue(): string | undefined {
  const c = adminCredentials();
  return c ? digest(`${c.username}\n${c.password}`).toString("hex") : undefined;
}

/** Constant-time check of a typed username + password. */
export function credentialsMatch(username: string, password: string): boolean {
  const c = adminCredentials();
  if (!c) return false;
  const userOk = timingSafeEqual(digest(username), digest(c.username));
  const passOk = timingSafeEqual(digest(password), digest(c.password));
  return userOk && passOk;
}

function cookieMatches(value: string | undefined): boolean {
  const expected = adminCookieValue();
  if (!expected || !value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  return cookieMatches((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** For pages: 404 when the area is off, the login page when not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!adminEnabled()) notFound();
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For server actions: throws unless the caller is staff. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Không có quyền truy cập khu vực quản trị");
}
