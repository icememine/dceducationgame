import { Bell } from "lucide-react";
import Link from "next/link";
import { getUserId } from "@/lib/auth";
import { countUnread } from "./data";

/** Status-bar bell with the unread count; links to /notifications. Server component. */
export async function NotificationBell() {
  const unread = await countUnread(await getUserId()).catch(() => 0);
  const label = unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo";
  return (
    <Link href="/notifications" aria-label={label} title="Thông báo" className="relative text-muted hover:text-sky">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-extrabold leading-none text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
