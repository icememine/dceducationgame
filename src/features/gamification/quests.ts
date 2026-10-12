/** Daily quests, evaluated from today's activity counters (see db table `daily_activity`). */
export type DailyActivity = { xp: number; perfectLessons: number; scenariosCorrect: number; lessonsCompleted: number };

export const DAILY_QUESTS = [
  { id: "xp-20", title: "Kiếm 20 XP", icon: "bolt", target: 20, metric: (a: DailyActivity) => a.xp },
  { id: "perfect-1", title: "Hoàn thành 1 bài không sai câu nào", icon: "target", target: 1, metric: (a: DailyActivity) => a.perfectLessons },
  { id: "scenario-1", title: "Xử lý đúng 1 tình huống", icon: "chat", target: 1, metric: (a: DailyActivity) => a.scenariosCorrect },
] as const;

export function questProgress(a: DailyActivity) {
  return DAILY_QUESTS.map((q) => {
    const value = Math.min(q.target, q.metric(a));
    return { id: q.id, title: q.title, icon: q.icon, value, target: q.target, done: value >= q.target };
  });
}
