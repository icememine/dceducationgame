"use client";

import { useEffect, useState } from "react";
import { FUNDS, ORDER_CALENDAR, SCHEDULE, type OpenFund } from "@content/library/fund-facts";
import { cn } from "@/lib/utils";
import { orderTimeline } from "./calc";
import { Choice, Footnote } from "./ui";

const FUND_OPTIONS = (Object.keys(ORDER_CALENDAR) as OpenFund[]).map((id) => ({ id, label: id }));
const day = (d: Date) => d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });
const TIMES = [9, 11, 14, 15, 17, 21].map((h) => ({ id: String(h), label: h === 14 ? "14:00" : h === 15 ? "15:00" : `${h}:00` }));

/** "Vòng đời một lệnh": when an order trades, when NAV is known, when sale money arrives. */
export function OrderFlowTool() {
  const [days, setDays] = useState<Date[]>([]);
  const [fund, setFund] = useState<OpenFund>("DCDS");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [pick, setPick] = useState(0);
  const [hour, setHour] = useState("11");
  // Dates come from the viewer's clock, so build them after mount (no server/client mismatch).
  useEffect(() => {
    const now = new Date();
    setDays(Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)));
  }, []);
  if (!days.length) return <p className="text-sm text-muted">Đang tải lịch…</p>;
  const base = days[pick];
  const at = new Date(base.getFullYear(), base.getMonth(), base.getDate(), Number(hour), 0);
  const t = orderTimeline(fund, at)!;
  const steps = [
    { label: `Bạn đặt lệnh ${side === "buy" ? "mua" : "bán"} ${fund}`, when: `${day(at)}, ${hour}:00`, note: side === "buy" ? "Chuyển tiền đúng tài khoản và nội dung theo hướng dẫn trên DragonX." : "Số CCQ bán chưa biết giá: lệnh khớp theo NAV của kỳ giao dịch." },
    { label: "Hạn chót cho kỳ giao dịch này", when: `14:30 ${day(t.cutoffDay)}`, note: side === "buy" ? `Tiền phải về trước ${SCHEDULE.cashCutoff}.` : "Lệnh sau hạn chót chuyển sang kỳ sau." },
    { label: "Ngày giao dịch T", when: day(t.tradeDate), note: `${fund} giao dịch: ${FUNDS[fund].tradingDays.toLowerCase()}.` },
    { label: side === "buy" ? "NAV công bố, số CCQ được xác định" : "NAV công bố, số tiền bán được xác định", when: `Khoảng 12:00 ${day(t.tradeDate)}`, note: "Trạng thái trên ứng dụng có thể cập nhật muộn hơn: đừng đặt lại lệnh hay chuyển thêm tiền chỉ vì chưa thấy." },
    ...(side === "sell" ? [{ label: "Tiền bán về tài khoản ngân hàng", when: day(t.cashDate), note: `${FUNDS[fund].cashAfterSell}${t.cashDays ? ` (${t.cashDays} ngày làm việc sau T)` : ""}, sau khi trừ phí bán, thuế TNCN 0,1% và phí chuyển tiền.` }] : []),
  ];
  return (
    <div className="flex flex-col gap-4">
      <Choice label="Quỹ" value={fund} options={FUND_OPTIONS} onChange={setFund} />
      <Choice label="Loại lệnh" value={side} options={[{ id: "buy", label: "Mua" }, { id: "sell", label: "Bán" }] as const} onChange={setSide} />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">Ngày đặt lệnh</p>
        <Choice label="Ngày đặt lệnh" value={String(pick)} options={days.map((d, i) => ({ id: String(i), label: d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }) }))} onChange={(v) => setPick(Number(v))} />
        <p className="text-sm font-bold">Giờ đặt lệnh</p>
        <Choice label="Giờ đặt lệnh" value={hour} options={TIMES} onChange={setHour} />
      </div>
      <ol className="flex flex-col">
        {steps.map((s, i) => (
          <li key={s.label} className="grid grid-cols-[1.75rem_1fr] gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("flex size-7 items-center justify-center rounded-full text-sm font-extrabold text-on-accent", i === 2 ? "bg-jade" : "bg-sky")}>{i + 1}</span>
              {i < steps.length - 1 && <span className="w-0.5 flex-1 bg-line" />}
            </div>
            <div className="pb-4">
              <p className="font-extrabold">{s.label}</p>
              <p className="text-sm font-bold text-jade-deep">{s.when}</p>
              <p className="text-sm text-muted">{s.note}</p>
            </div>
          </li>
        ))}
      </ol>
      <Footnote>Lịch giao dịch theo thông tin quỹ hiện hành; chưa tính ngày nghỉ lễ. DCBA theo bản cáo bạch hiện hành.</Footnote>
    </div>
  );
}
