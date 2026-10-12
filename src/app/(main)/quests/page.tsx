import { Gift, MessageCircle, Target, Zap } from "lucide-react";
import { getDailyQuests } from "@/db/queries";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ICONS = { bolt: Zap, target: Target, chat: MessageCircle } as const;

export default async function QuestsPage() {
  const quests = await getDailyQuests(await getUserId());
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-2xl bg-violet p-4 text-white">
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold">Tháng này</span>
        <h2 className="mt-2 text-xl font-extrabold">Hoàn thành Phần 1 của mỗi chương trình</h2>
        <p className="text-sm font-semibold opacity-90">Nhận huy hiệu &quot;Nhà đầu tư hiểu biết&quot;.</p>
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
