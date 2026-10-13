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
    <div className="flex flex-col gap-3.5 px-5 pb-8 pt-4">
      <section className="flex flex-col gap-3.5 rounded-2xl border border-hero-line bg-hero p-[18px] text-hero-ink">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-hero-accent">Thử thách tháng {Number(m)}/{y}</span>
          <p className="text-[13px] text-hero-muted">Hoàn thành mỗi thử thách để nhận một huy hiệu tháng.</p>
        </div>
        <ul className="flex flex-col gap-3">
          {monthly.map((c) => (
            <li key={c.id} className="flex flex-col gap-1.5 text-sm">
              <span className="flex justify-between gap-2"><span className="font-semibold">{c.title}</span><span className="text-hero-muted tabular">{c.done ? "Đã đạt" : `${c.value}/${c.target}`}</span></span>
              <span className="h-1.5 overflow-hidden rounded-full bg-white/15"><i className="block h-full rounded-full bg-hero-accent" style={{ width: `${(c.value / c.target) * 100}%` }} /></span>
            </li>
          ))}
        </ul>
      </section>
      <h2 className="mt-2 px-1 text-[17px] font-bold">Nhiệm vụ hôm nay</h2>
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {quests.map((q) => {
          const Icon = ICONS[q.icon];
          return (
            <li key={q.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade-soft text-jade"><Icon className="h-5 w-5" /></span>
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="flex justify-between gap-2 text-sm"><span className="font-semibold">{q.title}</span><span className="text-muted tabular">{q.value} / {q.target}</span></span>
                <span className="h-1.5 overflow-hidden rounded-full bg-line"><i className="block h-full rounded-full bg-jade" style={{ width: `${(q.value / q.target) * 100}%` }} /></span>
              </div>
              <Gift className={cn("h-6 w-6 shrink-0", q.done ? "text-gold" : "text-locked-deep")} aria-label={q.done ? "Đã nhận thưởng" : undefined} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
