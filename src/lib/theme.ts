import { cookies } from "next/headers";

/** Light is the default; dark is opt-in from Cài đặt. Kept in a cookie so the server renders the right theme with no flash. */
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_COOKIE = "theme";

export const parseTheme = (v: string | undefined): Theme => (v === "dark" ? "dark" : "light");

export async function getTheme(): Promise<Theme> {
  return parseTheme((await cookies()).get(THEME_COOKIE)?.value);
}
