import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Password hashing (scrypt, per-password salt) and the password policy.
 * Stored format: "scrypt$N$r$p$<salt b64>$<hash b64>", so parameters can be raised later.
 */
const N = 16384, R = 8, P = 1, KEYLEN = 64;
export const PASSWORD_MIN = 10;
/** Failed logins allowed per username in the window before the account is briefly locked. */
export const LOCKOUT = { attempts: 5, minutes: 15 } as const;
export const SESSION_HOURS = 12;

const scrypt = (pw: string, salt: Buffer, n: number, r: number, p: number) =>
  new Promise<Buffer>((res, rej) => scryptCb(pw.normalize("NFC"), salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 } satisfies ScryptOptions, (e, k) => (e ? rej(e) : res(k))));

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scrypt(pw, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Returns a Vietnamese error message, or null when the password is acceptable. */
export function passwordProblem(pw: string, username?: string): string | null {
  if (pw.length < PASSWORD_MIN) return `Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự`;
  if (username && pw.toLowerCase().includes(username.toLowerCase())) return "Mật khẩu không được chứa tên đăng nhập";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "Mật khẩu cần có cả chữ và số";
  return null;
}

/** Temporary password for new accounts and resets (shown once; the person must change it). */
export function temporaryPassword(): string {
  const words = randomBytes(9).toString("base64url").replace(/[-_]/g, "x");
  return `${words.slice(0, 4)}-${words.slice(4, 8)}-${words.slice(8, 12)}${(randomBytes(1)[0] % 90) + 10}`;
}

/** Usernames: lowercase letters, digits, dot, dash, 3–32 characters. */
export const validUsername = (u: string) => /^[a-z0-9][a-z0-9.-]{2,31}$/.test(u);
