import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Staff-only area (/admin). Access is a shared secret in ADMIN_TOKEN: visiting
 * /admin?key=<token> stores a hash of it in an httpOnly cookie scoped to /admin.
 * Without ADMIN_TOKEN the whole area answers 404.
 */
export const ADMIN_COOKIE = "dc_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const adminToken = () => process.env.ADMIN_TOKEN || undefined;

const digest = (token: string) => createHash("sha256").update(`dc-admin:${token}`).digest();

/** Cookie value for the configured token (a hash, so the token itself never sits in the browser). */
export function adminCookieValue(): string | undefined {
  const token = adminToken();
  return token ? digest(token).toString("hex") : undefined;
}

/** Constant-time check of a key typed by staff against ADMIN_TOKEN. */
export function keyMatches(key: string | null | undefined): boolean {
  const token = adminToken();
  if (!token || !key) return false;
  return timingSafeEqual(digest(key), digest(token));
}

function cookieMatches(value: string | undefined): boolean {
  const expected = adminCookieValue();
  if (!expected || !value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function isAdmin(): Promise<boolean> {
  if (!adminToken()) return false;
  return cookieMatches((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** For pages: 404 unless ADMIN_TOKEN is set and the cookie matches. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) notFound();
}

/** For server actions: throws unless the caller is staff. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Không có quyền truy cập khu vực quản trị");
}
