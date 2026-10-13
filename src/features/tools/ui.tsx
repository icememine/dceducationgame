"use client";

import type { ReactNode } from "react";
import { sourceById } from "@content/sources";
import { cn } from "@/lib/utils";

/** Shared building blocks for the Công cụ calculators. */
export function Slider({ id, label, value, min, max, step = 1, onChange, format = String }: {
  id: string; label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold" htmlFor={id}>
      <span className="flex justify-between gap-2"><span>{label}</span><span className="text-jade-deep">{format(value)}</span></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-[rgb(var(--jade))]" />
    </label>
  );
}

/** Amount in millions of đồng (what investors think in), stored in đồng. */
export function MillionField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold" htmlFor={id}>
      {label}
      <span className="flex items-center gap-1 rounded-xl border-2 border-line bg-sunken px-3 focus-within:border-sky">
        <input id={id} className="w-full bg-transparent py-2 text-lg font-extrabold outline-none" inputMode="decimal" value={value / 1e6}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(",", ".")) || 0) * 1e6)} />
        <span className="text-xs text-muted">triệu</span>
      </span>
    </label>
  );
}

export function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} aria-pressed={value === o.id} onClick={() => onChange(o.id)}
          className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-bold aria-pressed:border-jade aria-pressed:bg-jade-soft aria-pressed:text-jade-deep">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Highlight({ label, value, children, tone = "jade" }: { label: string; value: ReactNode; children?: ReactNode; tone?: "jade" | "coral" | "gold" }) {
  const bg = { jade: "bg-jade-soft", coral: "bg-coral-soft", gold: "bg-gold-soft" }[tone];
  const fg = { jade: "text-jade-deep", coral: "text-coral-deep", gold: "text-gold-deep" }[tone];
  return (
    <div className={cn("rounded-2xl p-4", bg)}>
      <p className={cn("text-sm font-bold", fg)}>{label}</p>
      <p className="font-display text-3xl font-extrabold">{value}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}

/** Horizontal bars for comparing a few values (all ≥ 0). */
export function Bars({ rows, format }: { rows: { label: string; value: number; color: string }[]; format: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-line p-3">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-2 text-sm">
          <span className="font-bold">{r.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-sunken"><i className="block h-full rounded-full" style={{ width: `${(Math.abs(r.value) / max) * 100}%`, background: r.color }} /></span>
          <b className="tabular-nums">{format(r.value)}</b>
        </div>
      ))}
    </div>
  );
}

export function Footnote({ sourceId, children }: { sourceId?: string; children?: ReactNode }) {
  const title = sourceId ? sourceById(sourceId)?.title : undefined;
  return (
    <p className="text-xs leading-snug text-muted">
      {children ?? "Giả định minh họa, không phải cam kết lợi nhuận."}
      {title && <> Nguồn: {title}</>}
    </p>
  );
}

export const pct = (v: number, digits = 1) => `${(v * 100).toLocaleString("vi-VN", { maximumFractionDigits: digits })}%`;
export const signedPct = (v: number, digits = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${pct(Math.abs(v), digits)}`;
