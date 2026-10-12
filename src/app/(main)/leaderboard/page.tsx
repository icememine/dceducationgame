import { Mascot } from "@/components/mascot";
import { getUserState, getWeeklyLeaderboard } from "@/db/queries";
import { LEAGUES, PROMOTE_TOP } from "@/features/gamification/rules";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const userId = await getUserId();
  const [{ progress }, rows] = await Promise.all([getUserState(userId), getWeeklyLeaderboard()]);
  const league = LEAGUES[progress.leagueIndex];
  // Skeleton: one global board. Production: groups of LEAGUE_GROUP_SIZE per league, reset weekly by a cron job.
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <Mascot mood="trophy" size={96} />
      <h1 className="text-2xl font-extrabold">{league.name}</h1>
      <p className="text-sm text-muted">Top {PROMOTE_TOP} lên hạng mỗi tuần · chỉ hiển thị biệt danh</p>
      <ol className="flex w-full flex-col gap-1">
        {rows.length === 0 && <li className="p-6 text-center text-muted">Chưa có ai ghi điểm tuần này. Hãy là người đầu tiên!</li>}
        {rows.map((r, i) => (
          <li key={r.userId} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", r.userId === userId && "bg-jade-soft")}>
            <span className={cn("w-6 text-center font-extrabold", i < 3 ? "text-gold-deep" : "text-muted")}>{i + 1}</span>
            <Mascot mood={r.avatar} size={40} />
            <span className="flex-1 font-bold">{r.nickname}{r.userId === userId && " (bạn)"}</span>
            <span className="font-extrabold">{r.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
