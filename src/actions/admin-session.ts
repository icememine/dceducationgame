"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminCookieValue, credentialsMatch } from "@/features/admin/auth";

export type LoginState = { error?: string };

/** /admin/login form. A short delay on failure slows down password guessing. */
export async function adminLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const value = adminCookieValue();
  if (!value || !credentialsMatch(username, password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Sai tên đăng nhập hoặc mật khẩu" };
  }
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}
