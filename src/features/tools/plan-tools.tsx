"use client";

import { useState } from "react";
import { EDU_COST, RUNWAY } from "@content/tools/presets";
import { formatDuration, requiredMonthly } from "@/features/goal-planner/finance";
import { formatVnd } from "@/lib/utils";
import { runway, runwayBand, studyCost } from "./calc";
import { Footnote, Highlight, MillionField, Slider } from "./ui";

const BAND_TEXT = {
  act: "Dưới 3 tháng: đây là tín hiệu cần hành động, bắt đầu tích lũy ngay từ tháng này.",
  build: "Từ 3 đến 6 tháng: đã có lớp đệm, tiếp tục góp đều để đạt ít nhất 6 tháng.",
  safe: "Từ 6 đến 12 tháng: tương đối an toàn. Mục tiêu lý tưởng là 12–18 tháng.",
  ideal: "Từ 12 tháng trở lên: bạn đã có quyền lựa chọn khi công việc thay đổi.",
} as const;

/** "Quỹ tự do sự nghiệp": months of spending covered now, the target, and time to reach it. */
export function RunwayTool() {
  const [spend, setSpend] = useState(RUNWAY.monthlySpend);
  const [savings, setSavings] = useState(30_000_000);
  const [monthly, setMonthly] = useState(RUNWAY.monthly);
  const [targetMonths, setTargetMonths] = useState(RUNWAY.targetMonths);
  const [rate, setRate] = useState(Math.round(RUNWAY.annualReturn * 100));
  const r = runway({ monthlySpend: spend, targetMonths, savings, monthly, annualReturn: rate / 100 });
  const band = runwayBand(r.covered, RUNWAY.bands);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">Nếu hôm nay mất thu nhập, bạn sống được bao lâu?</p>
      <div className="grid grid-cols-2 gap-3">
        <MillionField id="rw-spend" label="Chi tiêu mỗi tháng" value={spend} onChange={setSpend} />
        <MillionField id="rw-savings" label="Đã có sẵn" value={savings} onChange={setSavings} />
        <MillionField id="rw-monthly" label="Góp mỗi tháng" value={monthly} onChange={setMonthly} />
        <Slider id="rw-rate" label="Lợi nhuận giả định" value={rate} min={0} max={15} onChange={setRate} format={(v) => `${v}%/năm`} />
      </div>
      <Slider id="rw-target" label="Mục tiêu" value={targetMonths} min={3} max={18} onChange={setTargetMonths} format={(v) => `${v} tháng chi tiêu`} />
      <Highlight label="Hiện tại bạn có" value={`${r.covered.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tháng`} tone={band === "act" ? "coral" : band === "build" ? "gold" : "jade"}>
        {BAND_TEXT[band]}
      </Highlight>
      <Highlight label={`Mục tiêu ${targetMonths} tháng = ${formatVnd(r.target)}`} value={r.months === 0 ? "Đã đạt" : formatDuration(r.months)}>
        {r.months > 0 && Number.isFinite(r.months) ? "là thời gian ước tính để đạt mục tiêu với mức góp này." : r.months === 0 ? "Hãy giữ khoản này ở nơi rút được nhanh." : "Hãy thử tăng số tiền góp mỗi tháng."}
      </Highlight>
      <Footnote sourceId={RUNWAY.sourceId}>Khoản tiền cần dùng khi có biến cố nên đặt ở nơi ít biến động, rút nhanh. Lợi nhuận là giả định, không phải cam kết.</Footnote>
    </div>
  );
}

/** "Chi phí du học": cost at enrolment and the monthly amount needed from today. */
export function EduCostTool() {
  const [usd, setUsd] = useState(EDU_COST.annualUsd);
  const [years, setYears] = useState(EDU_COST.years);
  const [age, setAge] = useState(EDU_COST.childAge);
  const [growth, setGrowth] = useState(0);
  const [rate, setRate] = useState(Math.round(EDU_COST.annualReturn * 100));
  const yearsUntil = Math.max(0, EDU_COST.startAge - age);
  const today = studyCost({ annualUsd: usd, usdVnd: EDU_COST.usdVnd, years, yearsUntil: 0, growth: 0 });
  const then = studyCost({ annualUsd: usd, usdVnd: EDU_COST.usdVnd, years, yearsUntil, growth: growth / 100 });
  const monthly = yearsUntil ? requiredMonthly(then, yearsUntil * 12, 0, rate / 100) : then;
  return (
    <div className="flex flex-col gap-4">
      <Slider id="ed-usd" label="Học phí + sinh hoạt mỗi năm" value={usd} min={10_000} max={100_000} step={5_000} onChange={setUsd} format={(v) => `${v.toLocaleString("vi-VN")} USD`} />
      <div className="grid grid-cols-2 gap-3">
        <Slider id="ed-years" label="Số năm học" value={years} min={1} max={6} onChange={setYears} format={(v) => `${v} năm`} />
        <Slider id="ed-age" label="Tuổi của con" value={age} min={0} max={17} onChange={setAge} format={(v) => `${v} tuổi`} />
        <Slider id="ed-growth" label="Chi phí tăng mỗi năm (giả định)" value={growth} min={0} max={8} onChange={setGrowth} format={(v) => `${v}%`} />
        <Slider id="ed-rate" label="Lợi nhuận giả định" value={rate} min={0} max={15} onChange={setRate} format={(v) => `${v}%/năm`} />
      </div>
      <Highlight label={`Theo giá hôm nay, ${years} năm học`} value={formatVnd(today)}>
        {growth > 0 ? <>Nếu chi phí tăng {growth}%/năm, đến khi con {EDU_COST.startAge} tuổi cần khoảng <b>{formatVnd(then)}</b>.</> : <>Tỷ giá quy đổi theo bài viết: 40.000 USD/năm, 4 năm ≈ 4,2 tỷ.</>}
      </Highlight>
      <Highlight label={yearsUntil ? `Còn ${yearsUntil} năm, cần góp mỗi tháng` : "Con đã đến tuổi đi học"} value={yearsUntil ? formatVnd(monthly) : formatVnd(then)}>
        {yearsUntil ? "Bắt đầu càng sớm, số tiền góp mỗi tháng càng nhỏ: lãi kép làm phần việc lớn hơn." : "Số tiền cần có ngay."}
      </Highlight>
      <Footnote sourceId={EDU_COST.sourceId}>Ước tính của HSBC được dẫn trong bài viết; tỷ giá và mức tăng chi phí là giả định. Bài viết ước tính khoảng 18 triệu/tháng khi bắt đầu lúc con 8 tuổi; công cụ tính lãi theo tháng nên có thể chênh nhẹ. Lợi nhuận không được bảo đảm.</Footnote>
    </div>
  );
}
