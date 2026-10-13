/**
 * Spaced repetition (Leitner boxes), FEATURES.md 7.1 + 7.3.
 * A graded mistake puts a question in box 0, due now: it shows in "Cần ôn lại".
 * Each correct review moves it up one box and schedules it after 1, 3, 7 and 21 days;
 * a correct answer in the last box retires it. A wrong answer anywhere sends it back to box 0.
 */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 21] as const;
export const REVIEW_SESSION_SIZE = 10;
/** Ungraded or exploratory items never enter the review queue. */
export const REVIEWABLE = new Set(["select", "scenario", "match", "order", "spot", "numeric"]);

const DAY = 86_400_000;

export type ReviewState = { box: number; dueAt: Date | null; retiredAt: Date | null; lapses: number };

export function onWrong(prev: ReviewState | undefined, now: Date): ReviewState {
  return { box: 0, dueAt: now, retiredAt: null, lapses: (prev?.lapses ?? 0) + 1 };
}

/** A correct answer in a review session. */
export function onCorrectReview(prev: ReviewState, now: Date): ReviewState {
  if (prev.box >= REVIEW_INTERVAL_DAYS.length) return { ...prev, dueAt: null, retiredAt: now };
  const box = prev.box + 1;
  if (box > REVIEW_INTERVAL_DAYS.length) return { ...prev, box, dueAt: null, retiredAt: now };
  return { ...prev, box, dueAt: new Date(now.getTime() + REVIEW_INTERVAL_DAYS[box - 1] * DAY), retiredAt: null };
}

export const isDue = (s: { dueAt: Date | null; retiredAt: Date | null }, now: Date) => !s.retiredAt && !!s.dueAt && s.dueAt.getTime() <= now.getTime();
