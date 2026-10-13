import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getUserState } from "@/db/queries";
import { countPushSubscriptions } from "@/features/notifications/data";
import { getUserId } from "@/lib/auth";
import { getTheme } from "@/lib/theme";
import { ReminderSettings } from "./reminder-settings";
import { ThemeSettings } from "./theme-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getUserId();
  const [{ user }, devices, theme] = await Promise.all([getUserState(userId), countPushSubscriptions(userId), getTheme()]);
  return (
    <div className="flex flex-col gap-3.5 px-5 pb-8 pt-4">
      <div className="flex items-center gap-2">
        <Link href="/profile" aria-label="Quay lại hồ sơ" className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-line bg-surface text-ink"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">Cài đặt</h1>
      </div>
      <ThemeSettings initial={theme} />
      <ReminderSettings
        initialEnabled={user.reminderEnabled}
        initialHour={user.reminderHour}
        devices={devices}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
      />
    </div>
  );
}
