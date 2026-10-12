"use client";

import { useState, useTransition } from "react";
import { PLANNER_PRESETS } from "@content/tools/presets";
import { sourceById } from "@content/sources";
import type { GoalKind } from "@content/schema";
import { saveGoal } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { formatDuration, monthsToTarget, requiredMonthly } from "@/features/goal-planner/finance";
import { ProjectionChart } from "@/features/goal-planner/projection-chart";
import { cn, formatVnd } from "@/lib/utils";

type Plan = { kind: GoalKind; target: number; monthly: number; initial: number; annualReturn: number };

const field = "flex flex-col gap-1 text-sm font-bold";
const box = "flex items-center gap-1 rounded-xl border-2 border-line bg-sunken px-3 focus-within:border-sky";
const inputCls = "w-full bg-transparent py-2 text-lg font-extrabold outline-none";

/** Amount input in millions of đồng (what investors think in), stored in đồng. */
function Million({ label, value, onChange, id }: { label: string; value: number; onChange: (v: number) => void; id: string }) {
  return (
    <label className={field} htmlFor={id}>
      {label}
      <span className={box}>
        <input id={id} className={inputCls} inputMode="decimal" value={value / 1e6} onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(",", ".")) || 0) * 1e6)} />
        <span className="text-xs text-muted">triệu</span>
      </span>
    </label>
  );
}

/**
 * "Lập kế hoạch mục tiêu": how long a plan takes, how much of the result is contributions vs
 * compounding, and the reverse question (monthly amount needed to arrive by a chosen year).
 */
export function GoalPlannerTool() {
  const first = PLANNER_PRESETS[0];
  const [plan, setPlan] = useState<Plan>({ kind: first.kind, target: first.target, monthly: first.monthly, initial: first.initial, annualReturn: first.annualReturn });
  const [byYears, setByYears] = useState(5);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (patch: Partial<Plan>) => {
    setSaved(false);
    setPlan((p) => ({ ...p, ...patch }));
  };

  const preset = PLANNER_PRESETS.find((p) => p.kind === plan.kind);
  const months = monthsToTarget(plan, plan.target);
  const contributed = plan.initial + plan.monthly * (Number.isFinite(months) ? months : 0);
  const years = Math.min(40, Math.max(1, Math.ceil((Number.isFinite(months) ? months : 120) / 12)));
  const needed = requiredMonthly(plan.target, byYears * 12, plan.initial, plan.annualReturn);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Mục tiêu mẫu">
        {PLANNER_PRESETS.map((p) => (
          <button
            key={p.kind}
            aria-pressed={plan.kind === p.kind}
            onClick={() => set({ kind: p.kind, target: p.target, monthly: p.monthly, initial: p.initial, annualReturn: p.annualReturn })}
            className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-bold aria-pressed:border-jade aria-pressed:bg-jade-soft aria-pressed:text-jade-deep"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Million id="pl-target" label="Mục tiêu" value={plan.target} onChange={(v) => set({ target: v })} />
        <Million id="pl-monthly" label="Góp mỗi tháng" value={plan.monthly} onChange={(v) => set({ monthly: v })} />
        <Million id="pl-initial" label="Đã có sẵn" value={plan.initial} onChange={(v) => set({ initial: v })} />
        <label className={field} htmlFor="pl-rate">
          Lợi nhuận giả định: {Math.round(plan.annualReturn * 100)}%/năm
          <input id="pl-rate" type="range" min={0} max={20} step={1} value={Math.round(plan.annualReturn * 100)} onChange={(e) => set({ annualReturn: Number(e.target.value) / 100 })} className="accent-[rgb(var(--jade))]" />
        </label>
      </div>

      <div className="rounded-2xl bg-jade-soft p-4">
        <p className="text-sm font-bold text-jade-deep">Thời gian ước tính</p>
        <p className="font-display text-3xl font-extrabold">{formatDuration(months)}</p>
        {Number.isFinite(months) ? (
          <p className="text-sm">
            Bạn góp khoảng <b>{formatVnd(contributed)}</b>, phần còn lại <b>{formatVnd(Math.max(0, plan.target - contributed))}</b> đến từ lãi kép.
          </p>
        ) : (
          <p className="text-sm">Với mức góp này, kế hoạch chưa đạt được mục tiêu. Thử tăng số tiền góp hoặc thời gian.</p>
        )}
      </div>

      <ProjectionChart plan={plan} years={years} target={plan.target} />

      <div className="flex flex-col gap-2 rounded-2xl border-2 border-line p-4">
        <label className={cn(field, "flex-row items-center justify-between")} htmlFor="pl-years">
          Muốn đạt mục tiêu trong
          <span className={cn(box, "w-28")}>
            <input id="pl-years" className={inputCls} inputMode="numeric" value={byYears} onChange={(e) => setByYears(Math.min(40, Math.max(1, Number(e.target.value) || 1)))} />
            <span className="text-xs text-muted">năm</span>
          </span>
        </label>
        <p className="text-sm">
          Cần góp khoảng <b className="text-jade-deep">{formatVnd(needed)}</b> mỗi tháng.
          {needed > plan.monthly && plan.monthly > 0 && <> Nhiều hơn mức hiện tại {formatVnd(needed - plan.monthly)}.</>}
        </p>
      </div>

      {preset && (
        <p className="text-xs text-muted">
          {preset.note} Nguồn: {sourceById(preset.sourceId)?.title}
        </p>
      )}
      <Button
        disabled={pending || saved}
        onClick={() =>
          start(async () => {
            await saveGoal({ kind: plan.kind, target: plan.target, monthly: plan.monthly, initial: plan.initial, annualReturn: plan.annualReturn });
            setSaved(true);
          })
        }
      >
        {saved ? "Đã lưu vào hồ sơ" : "Lưu mục tiêu"}
      </Button>
      <p className="text-xs leading-snug text-muted">
        Lợi nhuận là giả định, không phải cam kết. Kết quả thực tế có thể thấp hơn nhiều. Rà soát kế hoạch ít nhất mỗi năm một lần.
      </p>
    </div>
  );
}
