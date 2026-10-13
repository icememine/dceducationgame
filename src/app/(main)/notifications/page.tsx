import { Award, Bell, BellRing, Flame, RotateCcw, TrendingDown, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { markAllNotificationsRead, openNotification } from "@/actions/notifications";
import { listNotifications } from "@/features/notifications/data";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ICON: Record<string, { icon: typeof Bell; tint: string }> = {
  streak_risk: { icon: Flame, tint: "bg-gold-soft text-gold" },
  review_due: { icon: RotateCcw, tint: "bg-gold-soft text-gold" },
  study_nudge: { icon: BellRing, tint: "bg-jade-soft text-jade" },
  badge: { icon: Award, tint: "bg-gold-soft text-gold" },
  league: { icon: BarChart3, tint: "bg-sky-soft text-sky" },
  market_drop: { icon: TrendingDown, tint: "bg-coral-soft text-coral" },
};
const FALLBACK = { icon: Bell, tint: "bg-sunken text-muted" };

const fmt = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });

export default async function NotificationsPage() {
  const items = await listNotifications(await getUserId());
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Thông báo</h1>
        <Link href="/profile/settings" className="flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-bold text-sky hover:bg-sunken">
          <Settings className="h-4 w-4" /> Cài đặt nhắc học
        </Link>
      </div>

      {unread > 0 && (
        <form action={markAllNotificationsRead}>
          <button type="submit" className="text-sm font-extrabold text-sky hover:underline">Đánh dấu đã đọc tất cả</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sunken"><Bell className="h-6 w-6 text-muted" /></span>
          <p className="font-bold">Chưa có thông báo nào.</p>
          <p className="text-sm text-muted">Bật nhắc học để Rồng nhắc bạn mỗi ngày nhé.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li key={n.id}>
              <form action={openNotification.bind(null, n.id)}>
                <button
                  type="submit"
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left",
                    n.readAt ? "border-line bg-surface" : "border-sky bg-sky-soft",
                  )}
                >
                  {(() => { const { icon: Icon, tint } = ICON[n.kind] ?? FALLBACK; return <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>; })()}
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2 font-extrabold">
                      {!n.readAt && <i className="h-2 w-2 shrink-0 rounded-full bg-coral" aria-label="Chưa đọc" />}
                      {n.title}
                    </span>
                    <span className="text-sm">{n.body}</span>
                    <span className="text-xs text-muted">{fmt.format(n.createdAt)}</span>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
