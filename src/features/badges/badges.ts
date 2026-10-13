/**
 * Badges (FEATURES.md 6.6) and monthly challenges (6.4). Pure rules over a learner's stats;
 * src/features/badges/sync.ts gathers the stats and stores newly earned badges.
 * No badge rewards trading: they celebrate learning, planning and safe habits only.
 */
export type BadgeStats = {
  lessonsCompleted: number;
  perfectLessons: number;
  checkpointsCompleted: number;
  streak: number;
  goalsSaved: number;
  riskConfirmed: boolean;
  /** Segment ids whose every lesson is completed. */
  segmentsCompleted: string[];
  /** Completed the scam-call lesson (Quỹ DC › An toàn). */
  scamLessonDone: boolean;
  reviewRetired: number;
  promoted: boolean;
};

export type Badge = { id: string; title: string; description: string; mascot: string; earned: (s: BadgeStats) => boolean };

export const BADGES: Badge[] = [
  { id: "first-lesson", title: "Bước đầu tiên", description: "Hoàn thành bài học đầu tiên", mascot: "explore", earned: (s) => s.lessonsCompleted >= 1 },
  { id: "risk-confirmed", title: "Hiểu khẩu vị", description: "Xác nhận hồ sơ khẩu vị rủi ro", mascot: "analyze", earned: (s) => s.riskConfirmed },
  { id: "first-goal", title: "Có mục tiêu", description: "Lưu mục tiêu đầu tiên", mascot: "save", earned: (s) => s.goalsSaved >= 1 },
  { id: "streak-7", title: "Bảy ngày bền bỉ", description: "Giữ chuỗi học 7 ngày", mascot: "fight", earned: (s) => s.streak >= 7 },
  { id: "streak-30", title: "Một tháng kỷ luật", description: "Giữ chuỗi học 30 ngày", mascot: "fight", earned: (s) => s.streak >= 30 },
  { id: "first-checkpoint", title: "Qua bài kiểm tra", description: "Hoàn thành bài kiểm tra đầu tiên", mascot: "trophy", earned: (s) => s.checkpointsCompleted >= 1 },
  { id: "perfect-10", title: "Mười bài không sai", description: "10 bài học không sai câu nào", mascot: "celebrate", earned: (s) => s.perfectLessons >= 10 },
  { id: "scam-shield", title: "Lá chắn lừa đảo", description: "Học cách xử lý cuộc gọi và đường dẫn giả mạo", mascot: "fight", earned: (s) => s.scamLessonDone },
  { id: "memory-10", title: "Nhớ lâu", description: "Ôn thuộc hẳn 10 câu từng sai", mascot: "study", earned: (s) => s.reviewRetired >= 10 },
  { id: "promoted", title: "Lên hạng", description: "Được thăng hạng trong giải đấu tuần", mascot: "trophy", earned: (s) => s.promoted },
  { id: "stage-my-plan", title: "Hiểu mình", description: "Hoàn thành chặng Hiểu mình", mascot: "grow", earned: (s) => s.segmentsCompleted.includes("my-plan") },
  { id: "stage-fund-types", title: "Hiểu quỹ", description: "Hoàn thành chặng Hiểu quỹ", mascot: "study", earned: (s) => s.segmentsCompleted.includes("fund-types") },
  { id: "stage-dc-funds", title: "Nhà đầu tư DC hiểu biết", description: "Hoàn thành chặng Quỹ DC & DragonX", mascot: "trophy", earned: (s) => s.segmentsCompleted.includes("dc-funds") },
];

export const earnedBadgeIds = (s: BadgeStats) => BADGES.filter((b) => b.earned(s)).map((b) => b.id);

/** Monthly challenges: the same three every month, counted in Vietnam's calendar month. */
export type MonthStats = { lessons: number; xp: number; activeDays: number };
export const MONTHLY_CHALLENGES = [
  { id: "lessons", title: "Hoàn thành 20 bài học", target: 20, metric: (m: MonthStats) => m.lessons },
  { id: "days", title: "Học ít nhất 15 ngày", target: 15, metric: (m: MonthStats) => m.activeDays },
  { id: "xp", title: "Kiếm 500 XP", target: 500, metric: (m: MonthStats) => m.xp },
] as const;

/** "YYYY-MM" for a Vietnam local day "YYYY-MM-DD". */
export const monthOf = (localDay: string) => localDay.slice(0, 7);
export const monthlyBadgeId = (month: string, challengeId: string) => `monthly:${month}:${challengeId}`;

export function monthlyProgress(month: string, m: MonthStats) {
  return MONTHLY_CHALLENGES.map((c) => {
    const value = Math.min(c.target, c.metric(m));
    return { id: c.id, badgeId: monthlyBadgeId(month, c.id), title: c.title, value, target: c.target, done: value >= c.target };
  });
}

/** Display info for any stored badge id, including monthly ones. */
export function badgeInfo(id: string): { title: string; description: string; mascot: string } | undefined {
  const b = BADGES.find((x) => x.id === id);
  if (b) return b;
  const m = /^monthly:(\d{4})-(\d{2}):(\w+)$/.exec(id);
  const c = m && MONTHLY_CHALLENGES.find((x) => x.id === m[3]);
  if (!m || !c) return undefined;
  return { title: `Thử thách tháng ${Number(m[2])}/${m[1]}`, description: c.title, mascot: "gift" };
}
