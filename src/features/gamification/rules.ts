/**
 * Game-economy constants in one place so product can tune them without hunting
 * through actions. Investor-specific choices vs. Duolingo:
 *  - No paywall / Pro tier: hearts refill over time or by practising, never by paying.
 *  - Self-assessment lessons (segment B profile) never cost hearts.
 *  - Leaderboards show nicknames only (investors are customers, not colleagues).
 */
export const MAX_HEARTS = 5;
export const HEART_REFILL_MINUTES = 240;
export const XP_PER_LESSON = 15;
export const XP_PERFECT_BONUS = 5;
export const XP_PRACTICE = 5;
export const XP_CHECKPOINT = 30;
export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20] as const;
/** Streaks follow the investor's calendar day in Vietnam, not UTC. */
export const STREAK_TIMEZONE = "Asia/Ho_Chi_Minh";

export const LEAGUES = [
  { id: "dong", name: "Hạng Đồng" },
  { id: "bac", name: "Hạng Bạc" },
  { id: "vang", name: "Hạng Vàng" },
  { id: "ngoc-bich", name: "Hạng Ngọc Bích" },
  { id: "lam-ngoc", name: "Hạng Lam Ngọc" },
  { id: "kim-cuong", name: "Hạng Kim Cương" },
] as const;
export const LEAGUE_GROUP_SIZE = 30;
export const PROMOTE_TOP = 5;
export const DEMOTE_BOTTOM = 5;
