/**
 * Reminder rules: pure functions, no I/O (see rules.test.ts).
 *
 * Tone: Rồng DC speaks to "bạn", encourages learning only. Reminders never mention buying,
 * selling or any fund, and never push the learner to invest.
 */
import { STREAK_TIMEZONE } from "@/features/gamification/rules";

export const REMINDER_HOURS = { min: 6, max: 22 } as const;

/** Where reminders send the learner. Review sessions start from the learning path for now. */
export const LEARN_HREF = "/learn";
export const REVIEW_HREF = "/review";

export type ReminderKind = "streak_risk" | "review_due" | "study_nudge";

export interface ReminderInput {
  /** The learner finished a lesson today (Vietnam day). */
  studiedToday: boolean;
  /** Current live streak in days (0 if broken). */
  streak: number;
  /** review_items with dueAt <= now and retiredAt null. */
  reviewDue: number;
}

export interface ReminderMessage {
  kind: ReminderKind;
  title: string;
  body: string;
  href: string;
  /** Mascot pose for the in-app card. */
  mascot: "fight" | "study";
}

/**
 * Decide today's reminder, or null when there is nothing worth saying
 * (already studied today and no review due).
 * Priority: streak at risk → review due → plain study nudge.
 */
export function decideReminder({ studiedToday, streak, reviewDue }: ReminderInput): ReminderMessage | null {
  const due = Math.max(0, Math.floor(reviewDue));
  if (studiedToday && due === 0) return null;

  if (!studiedToday && streak > 0) {
    return {
      kind: "streak_risk",
      title: `Giữ chuỗi ${streak} ngày nhé!`,
      body:
        due > 0
          ? `Rồng đang giữ lửa cho bạn. Ôn ${due} câu hoặc học một bài 5 phút là chuỗi ${streak} ngày vẫn cháy.`
          : `Rồng đang giữ lửa cho bạn. Chỉ cần một bài 5 phút hôm nay là chuỗi ${streak} ngày vẫn cháy.`,
      href: due > 0 ? REVIEW_HREF : LEARN_HREF,
      mascot: "fight",
    };
  }

  if (due > 0) {
    return {
      kind: "review_due",
      title: `${due} câu cần ôn lại`,
      body: "Ôn lại lúc này giúp bạn nhớ lâu hơn. Vài phút thôi, Rồng đợi bạn!",
      href: REVIEW_HREF,
      mascot: "study",
    };
  }

  return {
    kind: "study_nudge",
    title: "Đến giờ học cùng Rồng rồi!",
    body: "Một bài 5 phút hôm nay, thêm một kiến thức đầu tư vững vàng cho bạn.",
    href: LEARN_HREF,
    mascot: "study",
  };
}

/** Hour 0–23 in Vietnam time. */
export function vietnamHour(d: Date, timeZone = STREAK_TIMEZONE): number {
  const h = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(d);
  return Number(h) % 24;
}

export function isValidReminderHour(h: number): boolean {
  return Number.isInteger(h) && h >= REMINDER_HOURS.min && h <= REMINDER_HOURS.max;
}

/** Words that must never appear in a reminder (no fund marketing). Used by tests. */
export const FORBIDDEN_REMINDER_WORDS = ["mua", "bán", "quỹ", "chứng chỉ", "đầu tư ngay", "lợi nhuận"];

/**
 * Market-drop nudge (FEATURES.md 9.3) — SIMULATOR ONLY. The app has no market data, so this is
 * triggered by staff from /admin/market-sim to rehearse the message, never by a real index move.
 * Every message is labelled "Mô phỏng" and points to the lesson on staying with the plan; it
 * never suggests buying or selling.
 */
export const MARKET_DROP_LESSON = "b2r-drop-20";
export const MARKET_DROP_OPTIONS = [10, 15, 20, 30] as const;

export function marketDropNudge(dropPct: number): { kind: "market_drop"; title: string; body: string; href: string; mascot: string } {
  const pct = Math.round(Math.abs(dropPct));
  return {
    kind: "market_drop",
    title: `[Mô phỏng] Thị trường giảm ${pct}%: bạn sẽ làm gì?`,
    body: "Đây là tình huống luyện tập, không phải tin thị trường thật. Ôn lại kế hoạch và thời gian đến ngày cần tiền trước khi quyết định.",
    href: `/lesson/${MARKET_DROP_LESSON}`,
    mascot: "sad",
  };
}
