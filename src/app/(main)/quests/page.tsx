import { Gift, MessageCircle, Target, Zap } from "lucide-react";
import { getDailyQuests } from "@/db/queries";
import { monthlyProgress } from "@/features/badges/badges";
import { getMonthStats } from "@/features/badges/sync";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ICONS = { bolt: Zap, target: Target, chat: MessageCircle } as const;

export default async function QuestsPage() {
  const userId = await getUserId();
  const [quests, { month, stats }] = await Promise.all([getDailyQuests(userId), getMonthStats(userId)]);
  const monthly = monthlyProgress(month, stats);
  const [y, m] = month.split("-");
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-violet p-4 text-white">
        <span className="self-start rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold">Thử thách tháng {Number(m)}/{y}</span>
        <p className="text-sm font-semibold opacity-90">Hoàn thành mỗi thử thách để nhận một huy hiệu tháng.</p>
        <ul className="flex flex-col gap-2">
          {monthly.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 text-sm font-bold">
              <span className="flex justify-between"><span>{c.title}</span><span>{c.done ? "Đã đạt" : `${c.value}/${c.target}`}</span></span>
              <span className="h-2.5 overflow-hidden rounded-full bg-white/25"><i className="block h-full rounded-full bg-white" style={{ width: `${(c.value / c.target) * 100}%` }} /></span>
            </li>
          ))}
        </ul>
      </div>
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted">Nhiệm vụ hôm nay</h3>
      <ul className="flex flex-col divide-y-2 divide-line rounded-2xl border-2 border-line">
        {quests.map((q) => {
          const Icon = ICONS[q.icon];
          return (
            <li key={q.id} className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-white"><Icon className="h-5 w-5" /></span>
              <div className="flex flex-1 flex-col gap-1.5 font-bold">
                {q.title}
                <span className="relative h-4 overflow-hidden rounded-full bg-locked">
                  <i className="block h-full rounded-full bg-gold" style={{ width: `${(q.value / q.target) * 100}%` }} />
                  <span className="absolute inset-0 text-center text-[11px] leading-4">{q.value} / {q.target}</span>
                </span>
              </div>
              <Gift className={cn("h-7 w-7", q.done ? "text-gold-deep" : "text-locked-deep")} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
