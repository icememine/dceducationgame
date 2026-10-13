import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getUserState } from "@/db/queries";
import { countPushSubscriptions } from "@/features/notifications/data";
import { getUserId } from "@/lib/auth";
import { ReminderSettings } from "./reminder-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getUserId();
  const [{ user }, devices] = await Promise.all([getUserState(userId), countPushSubscriptions(userId)]);
  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center gap-2">
        <Link href="/profile" aria-label="Quay lại hồ sơ" className="rounded-xl p-1 text-muted hover:bg-sunken"><ChevronLeft className="h-6 w-6" /></Link>
        <h1 className="text-2xl font-extrabold">Cài đặt</h1>
      </div>
      <ReminderSettings
        initialEnabled={user.reminderEnabled}
        initialHour={user.reminderHour}
        devices={devices}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
      />
    </div>
  );
}
