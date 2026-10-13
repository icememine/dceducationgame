"use client";

import { useEffect, useState, useTransition } from "react";
import { createPlanShare, revokePlanShare } from "@/actions/plan";
import { Button } from "@/components/ui/button";
import { tokenHidesAmounts, type PlanCard } from "./model";
import { PlanCardView } from "./plan-card";

const FILE = "ke-hoach-dau-tu";

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** SVG → PNG through a canvas; resolves null if the browser refuses (then the SVG is saved). */
function svgToPng(svg: Blob, scale = 2): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(svg);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => resolve(b), "image/png");
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export function PlanSharePanel({ shown, hidden, token: initialToken }: { shown: PlanCard; hidden: PlanCard; token: string | null }) {
  const [token, setToken] = useState(initialToken);
  const [hide, setHide] = useState(initialToken ? tokenHidesAmounts(initialToken) : false);
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [downloading, setDownloading] = useState(false);

  const [canShare, setCanShare] = useState(false);

  // Browser-only values, read after hydration so server and client render the same markup.
  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare("share" in navigator);
  }, []);

  const link = token ? `${origin}/p/${token}` : null;
  const linkHides = token ? tokenHidesAmounts(token) : null;

  const share = () =>
    start(async () => {
      const res = await createPlanShare(hide);
      setToken(res.token);
      setStatus("Đã tạo liên kết chia sẻ.");
    });
  const revoke = () =>
    start(async () => {
      await revokePlanShare();
      setToken(null);
      setStatus("Đã ngừng chia sẻ. Liên kết cũ không còn mở được.");
    });
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Đã sao chép liên kết.");
    } catch {
      setStatus("Không sao chép được, bạn hãy chọn và sao chép liên kết thủ công.");
    }
  };
  const webShare = async () => {
    if (!link) return;
    try {
      await navigator.share({ title: "Bản kế hoạch đầu tư của mình", text: "Kế hoạch học và đầu tư của mình trên Rồng DC Academy", url: link });
    } catch {
      // Cancelled by the user.
    }
  };
  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/plan-card/me?hide=${hide ? 1 : 0}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const svg = await res.blob();
      const png = await svgToPng(svg);
      if (png) save(png, `${FILE}.png`);
      else save(svg, `${FILE}.svg`);
    } catch {
      setStatus("Chưa tải được ảnh, bạn thử lại sau nhé.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-line p-3">
        <span>
          <span className="block text-sm font-extrabold">Ẩn số tiền</span>
          <span className="block text-xs text-muted">Ẩn số tiền mục tiêu, góp hằng tháng và thời gian trên bản chia sẻ.</span>
        </span>
        <input type="checkbox" className="h-6 w-6 accent-[rgb(var(--jade))]" checked={hide} onChange={(e) => setHide(e.target.checked)} />
      </label>

      <PlanCardView card={hide ? hidden : shown} />

      <section className="flex flex-col gap-3 rounded-2xl border-2 border-line p-4">
        <h2 className="text-lg font-extrabold">Chia sẻ</h2>
        {link ? (
          <>
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Liên kết chia sẻ" className="w-full rounded-xl border-2 border-line bg-sunken px-3 py-2 text-xs" />
            {linkHides !== hide && (
              <p className="text-xs text-coral-deep">
                Liên kết hiện tại đang {linkHides ? "ẩn" : "hiện"} số tiền. Tạo liên kết mới để áp dụng lựa chọn này (liên kết cũ sẽ ngừng hoạt động).
              </p>
            )}
            {linkHides !== hide && <Button variant="gold" onClick={share} disabled={pending}>Tạo liên kết mới</Button>}
            <div className={canShare ? "grid grid-cols-2 gap-2" : "grid gap-2"}>
              <Button variant="ghost" onClick={copy}>Sao chép</Button>
              {canShare && <Button variant="sky" onClick={webShare}>Gửi</Button>}
            </div>
            <Button variant="coral" onClick={revoke} disabled={pending}>Ngừng chia sẻ</Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Tạo một liên kết riêng để gửi người thân. Ai có liên kết đều xem được bản kế hoạch này; bạn có thể ngừng chia sẻ bất cứ lúc nào.</p>
            <Button onClick={share} disabled={pending}>Chia sẻ</Button>
          </>
        )}
        <Button variant="ghost" onClick={download} disabled={downloading}>{downloading ? "Đang tạo ảnh…" : "Tải ảnh"}</Button>
        <p role="status" aria-live="polite" className="min-h-4 text-xs text-muted">{status}</p>
      </section>
    </div>
  );
}
