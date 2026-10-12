import { NextResponse, type NextRequest } from "next/server";

const USER_COOKIE = "dc_uid";

/** Dev auth: give every visitor a stable anonymous learner id. */
export function middleware(req: NextRequest) {
  if ((process.env.AUTH_MODE ?? "dev") !== "dev" || req.cookies.has(USER_COOKIE)) return NextResponse.next();
  const id = `anon-${crypto.randomUUID()}`;
  // Make the cookie visible to this same request's server components too.
  req.cookies.set(USER_COOKIE, id);
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.cookies.set(USER_COOKIE, id, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}

export const config = { matcher: ["/((?!_next|mascot|favicon.ico|.*\\..*).*)"] };
