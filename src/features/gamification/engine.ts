import {
  DEMOTE_BOTTOM,
  HEART_REFILL_MINUTES,
  LEAGUES,
  MAX_HEARTS,
  PROMOTE_TOP,
  STREAK_TIMEZONE,
  XP_CHECKPOINT,
  XP_PERFECT_BONUS,
  XP_PER_LESSON,
  XP_PRACTICE,
} from "./rules";

export function lessonXp(opts: { baseXp?: number; kind: "standard" | "profile" | "checkpoint"; mistakes: number; isPractice: boolean }) {
  if (opts.isPractice) return XP_PRACTICE;
  const base = opts.kind === "checkpoint" ? XP_CHECKPOINT : (opts.baseXp ?? XP_PER_LESSON);
  return base + (opts.mistakes === 0 && opts.kind !== "profile" ? XP_PERFECT_BONUS : 0);
}

/** Hearts regenerate one per HEART_REFILL_MINUTES since the last change. */
export function regenerateHearts(hearts: number, lastChange: Date, now: Date) {
  if (hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, lastChange: now };
  const gained = Math.floor((now.getTime() - lastChange.getTime()) / (HEART_REFILL_MINUTES * 60_000));
  if (gained <= 0) return { hearts, lastChange };
  const next = Math.min(MAX_HEARTS, hearts + gained);
  const carried = new Date(lastChange.getTime() + gained * HEART_REFILL_MINUTES * 60_000);
  return { hearts: next, lastChange: next >= MAX_HEARTS ? now : carried };
}

/** "YYYY-MM-DD" in Vietnam time. */
export function localDay(d: Date, timeZone = STREAK_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/**
 * Call when a lesson is completed. Same day → unchanged; next day → +1;
 * a gap is bridged by a streak freeze if one is available, otherwise resets to 1.
 */
export function advanceStreak(state: { streak: number; lastDay: string | null; freezes: number }, today: string) {
  if (!state.lastDay) return { streak: 1, lastDay: today, freezes: state.freezes };
  const gap = dayDiff(state.lastDay, today);
  if (gap <= 0) return state;
  if (gap === 1) return { ...state, streak: state.streak + 1, lastDay: today };
  if (gap === 2 && state.freezes > 0) return { streak: state.streak + 1, lastDay: today, freezes: state.freezes - 1 };
  return { streak: 1, lastDay: today, freezes: state.freezes };
}

/** End-of-week league movement for a learner ranked `rank` (1-based) in a group. */
export function leagueOutcome(leagueIndex: number, rank: number, groupSize: number) {
  if (rank <= PROMOTE_TOP && leagueIndex < LEAGUES.length - 1) return leagueIndex + 1;
  if (rank > groupSize - DEMOTE_BOTTOM && leagueIndex > 0 && groupSize > PROMOTE_TOP + DEMOTE_BOTTOM) return leagueIndex - 1;
  return leagueIndex;
}
