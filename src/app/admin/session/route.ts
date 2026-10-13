import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminCookieValue, keyMatches } from "@/features/admin/auth";

/** /admin?key=… redirects here: a matching key sets the admin cookie, anything else is a 404. */
export function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const value = adminCookieValue();
  if (!value || !keyMatches(key)) return new NextResponse("Not Found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
