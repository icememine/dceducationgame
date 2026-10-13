import { ArrowDown, ArrowUp } from "lucide-react";
import { MascotIcon } from "@/components/mascot";
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
    <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
      <div className="flex items-center gap-3.5 rounded-2xl border border-hero-line bg-hero p-4 text-hero-ink">
        <MascotIcon mood="trophy" size={48} className="bg-white/10" />
        <div><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-hero-accent">Nhóm xếp hạng tuần</p><h1 className="text-xl font-bold">{league.name}</h1></div>
      </div>
      <p className="px-1 text-[13px] text-muted">
        Nhóm {board.rows.length} người · top {PROMOTE_TOP} lên hạng{board.tier > 0 ? `, ${DEMOTE_BOTTOM} người cuối xuống hạng` : ""} khi tuần kết thúc (Chủ nhật) · chỉ hiển thị biệt danh
      </p>
      {board.lastWeek && <p className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold">{OUTCOME_TEXT[board.lastWeek.outcome]}</p>}
      <ol className="flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
        {board.rows.map((r, i) => (
          <li key={r.userId} className="flex flex-col border-b border-line last:border-b-0">
            {hasDown && r.zone === "down" && board.rows[i - 1]?.zone !== "down" && <p className="bg-coral-soft py-1 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-coral-deep">Vùng xuống hạng</p>}
            <div className={cn("flex items-center gap-3 px-3.5 py-2.5", r.userId === userId && "bg-jade-soft")}>
              <span className={cn("w-6 text-center font-extrabold", r.rank <= 3 ? "text-gold-deep" : "text-muted")}>{r.rank}</span>
              <MascotIcon mood={r.avatar} size={34} tone={r.userId === userId ? "plain" : "jade"} />
              <span className="flex-1 text-sm font-semibold">{r.nickname}{r.userId === userId && " (bạn)"}</span>
              {r.zone === "up" && <ArrowUp className="h-4 w-4 text-jade-deep" aria-label="Vùng lên hạng" />}
              {r.zone === "down" && <ArrowDown className="h-4 w-4 text-coral-deep" aria-label="Vùng xuống hạng" />}
              <span className="text-sm font-bold tabular">{r.xp.toLocaleString("vi-VN")} điểm</span>
            </div>
            {r.zone === "up" && board.rows[i + 1]?.zone !== "up" && <p className="border-t border-line bg-jade-soft py-1 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-jade-deep">Vùng lên hạng</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
