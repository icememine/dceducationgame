import { describe, expect, it } from "vitest";
import { FORBIDDEN_REMINDER_WORDS, decideReminder, isValidReminderHour, vietnamHour } from "./rules";

describe("decideReminder", () => {
  it("skips when already studied and nothing is due", () => {
    expect(decideReminder({ studiedToday: true, streak: 5, reviewDue: 0 })).toBeNull();
    expect(decideReminder({ studiedToday: true, streak: 0, reviewDue: 0 })).toBeNull();
  });

  it("warns about a streak at risk first", () => {
    const m = decideReminder({ studiedToday: false, streak: 7, reviewDue: 0 })!;
    expect(m.kind).toBe("streak_risk");
    expect(m.title).toContain("Giữ chuỗi 7 ngày");
    expect(m.mascot).toBe("fight");
  });

  it("mentions due reviews inside the streak message", () => {
    const m = decideReminder({ studiedToday: false, streak: 3, reviewDue: 4 })!;
    expect(m.kind).toBe("streak_risk");
    expect(m.body).toContain("4 câu");
  });

  it("asks for review when studied today but questions are due", () => {
    const m = decideReminder({ studiedToday: true, streak: 3, reviewDue: 2 })!;
    expect(m.kind).toBe("review_due");
    expect(m.title).toBe("2 câu cần ôn lại");
  });

  it("asks for review when there is no streak and questions are due", () => {
    expect(decideReminder({ studiedToday: false, streak: 0, reviewDue: 1 })!.kind).toBe("review_due");
  });

  it("falls back to a plain nudge", () => {
    expect(decideReminder({ studiedToday: false, streak: 0, reviewDue: 0 })!.kind).toBe("study_nudge");
  });

  it("never markets funds or trading", () => {
    const cases = [
      { studiedToday: false, streak: 9, reviewDue: 0 },
      { studiedToday: false, streak: 9, reviewDue: 3 },
      { studiedToday: true, streak: 9, reviewDue: 3 },
      { studiedToday: false, streak: 0, reviewDue: 0 },
    ];
    for (const c of cases) {
      const m = decideReminder(c)!;
      const text = `${m.title} ${m.body}`.toLowerCase();
      for (const w of FORBIDDEN_REMINDER_WORDS) expect(text).not.toMatch(new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, "u"));
      expect(text).toContain("bạn");
    }
  });
});

describe("vietnamHour", () => {
  it("is UTC+7", () => {
    expect(vietnamHour(new Date("2026-10-13T13:30:00Z"))).toBe(20);
    expect(vietnamHour(new Date("2026-10-13T17:00:00Z"))).toBe(0);
    expect(vietnamHour(new Date("2026-10-12T23:59:00Z"))).toBe(6);
  });
});

describe("isValidReminderHour", () => {
  it("accepts 6–22 only", () => {
    expect(isValidReminderHour(6)).toBe(true);
    expect(isValidReminderHour(22)).toBe(true);
    expect(isValidReminderHour(5)).toBe(false);
    expect(isValidReminderHour(23)).toBe(false);
    expect(isValidReminderHour(7.5)).toBe(false);
  });
});
