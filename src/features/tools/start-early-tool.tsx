"use client";

import { useState } from "react";
import { START_EARLY } from "@content/tools/presets";
import { sourceById } from "@content/sources";
import { futureValue } from "@/features/goal-planner/finance";
import { formatVnd } from "@/lib/utils";

const W = 320;
const H = 130;
const PAD = 6;

/** "25 hay 45 tuổi": the same monthly amount, started 20 years apart, until the same age. */
export function StartEarlyTool() {
  const { early, late, endAge } = START_EARLY;
  const [monthly, setMonthly] = useState(START_EARLY.monthly);
  const [rate, setRate] = useState(START_EARLY.annualReturn);

  const valueAt = (startAge: number, age: number) => futureValue({ initial: 0, monthly, annualReturn: rate }, Math.max(0, (age - startAge) * 12));
  const a = valueAt(early.startAge, endAge);
  const b = valueAt(late.startAge, endAge);
  const paidA = monthly * 12 * (endAge - early.startAge);
  const paidB = monthly * 12 * (endAge - late.startAge);
  const span = endAge - early.startAge;
  const line = (startAge: number) =>
    Array.from({ length: span + 1 }, (_, i) => {
      const x = PAD + (i / span) * (W - 2 * PAD);
      const y = H - 16 - (valueAt(startAge, early.startAge + i) / a) * (H - 26);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">
        {early.name} bắt đầu năm {early.startAge} tuổi, {late.name} năm {late.startAge} tuổi. Cùng góp đều đến {endAge} tuổi.
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm font-bold">
        <label className="flex flex-col gap-1" htmlFor="se-monthly">
          Mỗi tháng: {monthly / 1e6} triệu
          <input id="se-monthly" type="range" min={1} max={20} step={1} value={monthly / 1e6} onChange={(e) => setMonthly(Number(e.target.value) * 1e6)} className="accent-[rgb(var(--jade))]" />
        </label>
        <label className="flex flex-col gap-1" htmlFor="se-rate">
          Lợi nhuận giả định: {Math.round(rate * 100)}%/năm
          <input id="se-rate" type="range" min={2} max={16} step={1} value={Math.round(rate * 100)} onChange={(e) => setRate(Number(e.target.value) / 100)} className="accent-[rgb(var(--jade))]" />
        </label>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-3">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Giá trị tích lũy theo tuổi" className="w-full">
          <polyline points={line(early.startAge)} fill="none" stroke="rgb(var(--jade))" strokeWidth={3} />
          <polyline points={line(late.startAge)} fill="none" stroke="rgb(var(--coral))" strokeWidth={3} />
          <text x={PAD} y={H - 2} fontSize={10} fontWeight={700} fill="rgb(var(--muted))">{early.startAge} tuổi</text>
          <text x={W - PAD} y={H - 2} textAnchor="end" fontSize={10} fontWeight={700} fill="rgb(var(--muted))">{endAge} tuổi</text>
        </svg>
        <p className="mt-1 flex gap-4 text-xs font-bold">
          <span className="text-jade-deep">● {early.name} (từ {early.startAge})</span>
          <span className="text-coral-deep">● {late.name} (từ {late.startAge})</span>
        </p>
      </div>

      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm">
        <dt>{early.name} góp {formatVnd(paidA)}</dt>
        <dd className="text-right font-extrabold text-jade-deep">{formatVnd(a)}</dd>
        <dt>{late.name} góp {formatVnd(paidB)}</dt>
        <dd className="text-right font-extrabold text-coral-deep">{formatVnd(b)}</dd>
      </dl>
      <div className="rounded-2xl bg-jade-soft p-4 text-sm">
        {early.name} chỉ góp nhiều hơn {(paidA / paidB).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} lần nhưng có gấp khoảng{" "}
        <b>{Math.round(a / b).toLocaleString("vi-VN")} lần</b>. Thời gian đầu tư dài hơn tạo khác biệt lớn hơn việc tăng số tiền góp.
      </div>
      <p className="text-xs text-muted">
        Giả định minh họa, không phải cam kết lợi nhuận. Nguồn: {sourceById(START_EARLY.sourceId)?.title}
      </p>
    </div>
  );
}
