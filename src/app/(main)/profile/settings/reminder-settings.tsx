"use client";

import { useEffect, useState, useTransition } from "react";
import { removePushSubscription, savePushSubscription, saveReminderSettings } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { REMINDER_HOURS } from "@/features/notifications/rules";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: REMINDER_HOURS.max - REMINDER_HOURS.min + 1 }, (_, i) => REMINDER_HOURS.min + i);

type DeviceState = "checking" | "unsupported" | "denied" | "off" | "on" | "busy";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function ReminderSettings({
  initialEnabled,
  initialHour,
  devices,
  vapidPublicKey,
}: {
  initialEnabled: boolean;
  initialHour: number;
  devices: number;
  vapidPublicKey: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hour, setHour] = useState(initialHour);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [device, setDevice] = useState<DeviceState>("checking");
  const [deviceMsg, setDeviceMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!vapidPublicKey) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setDevice("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setDevice("denied");
      return;
    }
    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setDevice(sub ? "on" : "off"))
      .catch(() => setDevice("off"));
  }, [vapidPublicKey]);

  const save = (next: { enabled: boolean; hour: number }) => {
    setEnabled(next.enabled);
    setHour(next.hour);
    setSaved(null);
    start(async () => {
      try {
        await saveReminderSettings(next);
        setSaved(next.enabled ? `Rồng sẽ nhắc bạn lúc ${next.hour}:00 mỗi ngày.` : "Đã tắt nhắc học.");
      } catch {
        setSaved("Chưa lưu được, bạn thử lại nhé.");
      }
    });
  };

  async function enableDevice() {
    setDevice("busy");
    setDeviceMsg(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setDevice(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) }));
      const json = sub.toJSON();
      await savePushSubscription({ endpoint: json.endpoint ?? sub.endpoint, keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" } });
      setDevice("on");
      setDeviceMsg("Đã bật thông báo trên thiết bị này.");
      if (!enabled) save({ enabled: true, hour });
    } catch (e) {
      console.error(e);
      setDevice("off");
      setDeviceMsg("Chưa bật được thông báo trên thiết bị này. Bạn thử lại sau nhé.");
    }
  }

  async function disableDevice() {
    setDevice("busy");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setDevice("off");
      setDeviceMsg("Đã tắt thông báo trên thiết bị này.");
    } catch {
      setDevice("on");
    }
  }

  return (
    <>
      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-lg font-extrabold">Nhắc học mỗi ngày</h2>
        <label className="flex items-center justify-between gap-3">
          <span className="flex flex-col">
            <span className="font-bold">Bật nhắc học</span>
            <span className="text-sm text-muted">Rồng nhắc bạn giữ chuỗi và ôn bài, trong ứng dụng và trên thiết bị đã bật.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={pending}
            onClick={() => save({ enabled: !enabled, hour })}
            className={cn("relative h-8 w-14 shrink-0 rounded-full transition-colors", enabled ? "bg-jade" : "bg-locked")}
          >
            <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left]", enabled ? "left-7" : "left-1")} />
          </button>
        </label>
        <label className="flex items-center justify-between gap-3">
          <span className="font-bold">Giờ nhắc (giờ Việt Nam)</span>
          <select
            value={hour}
            disabled={pending || !enabled}
            onChange={(e) => save({ enabled, hour: Number(e.target.value) })}
            className="rounded-xl border border-line bg-surface px-3 py-2 font-bold disabled:opacity-50"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{`${h}:00`}</option>
            ))}
          </select>
        </label>
        {saved && <p className="text-sm font-bold text-jade-deep" role="status">{saved}</p>}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-lg font-extrabold">Thông báo trên thiết bị</h2>
        {!vapidPublicKey ? (
          <p className="text-sm text-muted">
            Thông báo trên thiết bị chưa được cấu hình. Nhắc học vẫn hiện trong mục Thông báo của ứng dụng.
          </p>
        ) : device === "unsupported" ? (
          <p className="text-sm text-muted">Trình duyệt này chưa hỗ trợ thông báo đẩy. Trên iPhone, hãy thêm ứng dụng vào Màn hình chính trước.</p>
        ) : device === "denied" ? (
          <p className="text-sm text-muted">Bạn đã chặn thông báo cho trang này. Hãy mở cài đặt trình duyệt để cho phép lại.</p>
        ) : device === "on" ? (
          <>
            <p className="text-sm">Thiết bị này đang nhận thông báo.</p>
            <Button variant="ghost" onClick={disableDevice}>Tắt thông báo trên thiết bị này</Button>
          </>
        ) : (
          <Button variant="sky" onClick={enableDevice} disabled={device === "busy" || device === "checking"}>
            Bật thông báo trên thiết bị này
          </Button>
        )}
        {deviceMsg && <p className="text-sm font-bold" role="status">{deviceMsg}</p>}
        {devices > 0 && <p className="text-xs text-muted">Số thiết bị đã bật: {devices}</p>}
      </section>
    </>
  );
}
