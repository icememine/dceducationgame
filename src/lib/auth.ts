import "server-only";
import { cookies } from "next/headers";

/**
 * Auth adapter. The rest of the app only calls `getUserId()`.
 *
 *  - "dev"  : anonymous learner id in a cookie set by middleware. Good for demos and
 *             for "try before you sign up" in production too.
 *  - "oidc" : DragonX SSO (OpenID Connect). Not implemented in the skeleton — plug in
 *             Auth.js or Clerk here; map the OIDC `sub` to users.id and, with consent,
 *             store the DragonX customer ref in users.dragonx_ref.
 */
export const USER_COOKIE = "dc_uid";

export async function getUserId(): Promise<string> {
  const mode = process.env.AUTH_MODE ?? "dev";
  if (mode === "dev") {
    const id = (await cookies()).get(USER_COOKIE)?.value;
    if (!id) throw new Error("Missing learner cookie — is middleware running?");
    return id;
  }
  throw new Error(`AUTH_MODE "${mode}" is not implemented yet (see docs/ARCHITECTURE.md §Auth)`);
}
