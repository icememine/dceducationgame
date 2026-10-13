import { ArrowDown, ArrowUp } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { DEMOTE_BOTTOM, LEAGUES, PROMOTE_TOP } from "@/features/gamification/rules";
import { getGroupBoard } from "@/features/leagues/queries";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

const OUTCOME_TEXT = { up: "Tuần trước bạn đã lên hạng!", down: "Tuần trước bạn xuống hạng. Tuần này lấy lại nhé!", stay: "Tuần trước bạn giữ hạng." } as const;

/** Weekly league: the learner's group of up to 30 in their tier, with promotion and demotion zones. */
export default async function LeaderboardPage() {
  const userId = await getUserId();
  const board = await getGroupBoard(userId);
  const league = LEAGUES[board.tier];
  const hasDown = board.rows.some((r) => r.zone === "down");
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <Mascot mood="trophy" size={96} />
      <h1 className="text-2xl font-extrabold">{league.name}</h1>
      <p className="text-center text-sm text-muted">
        Nhóm {board.rows.length} người · top {PROMOTE_TOP} lên hạng{board.tier > 0 ? `, ${DEMOTE_BOTTOM} người cuối xuống hạng` : ""} khi tuần kết thúc (Chủ nhật) · chỉ hiển thị biệt danh
      </p>
      {board.lastWeek && <p className="rounded-xl bg-sunken px-3 py-2 text-sm font-bold">{OUTCOME_TEXT[board.lastWeek.outcome]}</p>}
      <ol className="flex w-full flex-col gap-1">
        {board.rows.map((r, i) => (
          <li key={r.userId} className="flex flex-col">
            {hasDown && r.zone === "down" && board.rows[i - 1]?.zone !== "down" && <p className="my-1 text-center text-xs font-extrabold uppercase text-coral-deep">Vùng xuống hạng</p>}
            <div className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", r.userId === userId && "bg-jade-soft")}>
              <span className={cn("w-6 text-center font-extrabold", r.rank <= 3 ? "text-gold-deep" : "text-muted")}>{r.rank}</span>
              <Mascot mood={r.avatar} size={40} />
              <span className="flex-1 font-bold">{r.nickname}{r.userId === userId && " (bạn)"}</span>
              {r.zone === "up" && <ArrowUp className="h-4 w-4 text-jade-deep" aria-label="Vùng lên hạng" />}
              {r.zone === "down" && <ArrowDown className="h-4 w-4 text-coral-deep" aria-label="Vùng xuống hạng" />}
              <span className="font-extrabold">{r.xp} XP</span>
            </div>
            {r.zone === "up" && board.rows[i + 1]?.zone !== "up" && <p className="my-1 text-center text-xs font-extrabold uppercase text-jade-deep">Vùng lên hạng</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
