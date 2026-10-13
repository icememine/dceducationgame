"use client";

import { QUIZ_PATTERNS } from "@content/schema";
import { sources } from "@content/sources";
import { MASCOT_MOODS } from "@/components/mascot";
import type { Issue } from "../validate";

/** Plain form controls for the challenge editor. */

const box = "w-full rounded-lg border border-line bg-surface p-2 text-sm outline-none focus:border-sky";
const small = "rounded border border-line px-2 py-0.5 text-xs font-bold hover:bg-sunken disabled:opacity-40";

export function Errors({ issues, path }: { issues: Issue[]; path: string }) {
  const mine = issues.filter((i) => i.path === path || i.path.startsWith(`${path}.`));
  if (!mine.length) return null;
  return (
    <ul className="text-xs font-bold text-coral-deep">
      {mine.map((i, k) => <li key={k}>{i.path !== path && `${i.path}: `}{i.message}</li>)}
    </ul>
  );
}

function Label({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex justify-between text-sm font-extrabold"><span>{label}</span>{hint && <span className="font-normal text-muted">{hint}</span>}</span>
      {children}
    </div>
  );
}

export function TextField(p: {
  label: string;
  value: unknown;
  onChange: (v: string | undefined) => void;
  issues: Issue[];
  path: string;
  multiline?: boolean;
  optional?: boolean;
  /** Quiz formula length limits, shown as a live counter. */
  limits?: [number, number];
}) {
  const v = typeof p.value === "string" ? p.value : "";
  const n = [...v].length;
  const bad = p.limits && (v.length < p.limits[0] || v.length > p.limits[1]);
  const hint = p.limits ? <span className={bad ? "font-bold text-coral-deep" : ""}>{n}/{p.limits[0]}–{p.limits[1]} ký tự</span> : p.optional ? "không bắt buộc" : undefined;
  const set = (s: string) => p.onChange(p.optional && s === "" ? undefined : s);
  return (
    <Label label={p.label} hint={hint}>
      {p.multiline
        ? <textarea className={box} rows={3} value={v} onChange={(e) => set(e.target.value)} />
        : <input className={box} value={v} onChange={(e) => set(e.target.value)} />}
      <Errors issues={p.issues} path={p.path} />
    </Label>
  );
}

export function NumberField({ label, value, onChange, issues, path, step }: { label: string; value: unknown; onChange: (v: number) => void; issues: Issue[]; path: string; step?: number }) {
  return (
    <Label label={label}>
      <input className={box} type="number" step={step ?? "any"} value={typeof value === "number" && Number.isFinite(value) ? value : ""} onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))} />
      <Errors issues={issues} path={path} />
    </Label>
  );
}

export function PatternField({ value, onChange, issues }: { value: unknown; onChange: (v: string) => void; issues: Issue[] }) {
  return (
    <Label label="Mẫu câu hỏi">
      <select className={box} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(QUIZ_PATTERNS).map(([k, l]) => <option key={k} value={k}>{l} ({k})</option>)}
      </select>
      <Errors issues={issues} path="pattern" />
    </Label>
  );
}

export function MascotField({ value, onChange }: { value: unknown; onChange: (v: string | undefined) => void }) {
  return (
    <Label label="Rồng DC" hint="không bắt buộc">
      <select className={box} value={String(value ?? "")} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">(mặc định: study)</option>
        {Object.entries(MASCOT_MOODS).map(([k, l]) => <option key={k} value={k}>{k} · {l}</option>)}
      </select>
    </Label>
  );
}

/**
 * List of strings. `fixed` locks the count (quiz options). `mark` adds a radio per row
 * (the right answer, or the wrong statement). `movable` shows up/down (order items).
 */
export function ListField(p: {
  label: string;
  values: unknown;
  onChange: (v: string[]) => void;
  issues: Issue[];
  path: string;
  fixed?: number;
  min?: number;
  movable?: boolean;
  mark?: { label: string; index: unknown; onPick: (i: number) => void };
  /** Called with the removed index so dependent fields (answer, pairs) can follow. */
  onRemove?: (i: number) => void;
  onMove?: (from: number, to: number) => void;
}) {
  const list = Array.isArray(p.values) ? p.values.map(String) : [];
  const set = (i: number, s: string) => p.onChange(list.map((x, k) => (k === i ? s : x)));
  const move = (i: number, d: number) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    p.onChange(next);
    p.onMove?.(i, i + d);
  };
  return (
    <Label label={p.label} hint={p.fixed ? `đúng ${p.fixed} mục` : p.min ? `ít nhất ${p.min} mục` : undefined}>
      <ol className="flex flex-col gap-1.5">
        {list.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-5 pt-2 text-right text-xs font-bold text-muted">{p.movable ? i + 1 : String.fromCharCode(65 + i)}</span>
            {p.mark && (
              <label className="flex items-center gap-1 pt-2 text-xs" title={p.mark.label}>
                <input type="radio" checked={p.mark.index === i} onChange={() => p.mark!.onPick(i)} />
              </label>
            )}
            <textarea className={box} rows={1} value={s} onChange={(e) => set(i, e.target.value)} />
            <div className="flex shrink-0 gap-1 pt-1.5">
              {p.movable && <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Lên">↑</button>}
              {p.movable && <button type="button" className={small} disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Xuống">↓</button>}
              {!p.fixed && (
                <button type="button" className={small} disabled={list.length <= (p.min ?? 0)} onClick={() => { p.onChange(list.filter((_, k) => k !== i)); p.onRemove?.(i); }}>Xóa</button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {p.mark && <span className="text-xs text-muted">Chấm tròn: {p.mark.label}</span>}
      {!p.fixed && <button type="button" className={`${small} self-start`} onClick={() => p.onChange([...list, ""])}>+ Thêm</button>}
      <Errors issues={p.issues} path={p.path} />
    </Label>
  );
}

export function PairsField({ left, right, pairs, onChange, issues }: { left: unknown; right: unknown; pairs: unknown; onChange: (v: number[]) => void; issues: Issue[] }) {
  const l = Array.isArray(left) ? left.map(String) : [];
  const r = Array.isArray(right) ? right.map(String) : [];
  const p = Array.isArray(pairs) ? (pairs as number[]) : [];
  return (
    <Label label="Cặp đúng" hint="mỗi ô trái nối với một ô phải">
      <ul className="flex flex-col gap-1.5 text-sm">
        {l.map((t, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-1/3 truncate font-bold">{t || `(trái ${i + 1})`}</span>→
            <select className={box} value={p[i] ?? ""} onChange={(e) => onChange(l.map((_, k) => (k === i ? Number(e.target.value) : (p[k] ?? k))))}>
              {r.map((rt, j) => <option key={j} value={j}>{j + 1}. {rt}</option>)}
            </select>
          </li>
        ))}
      </ul>
      <Errors issues={issues} path="pairs" />
    </Label>
  );
}

export function PersonaField({ value, onChange, issues }: { value: unknown; onChange: (v: { name: string; meta?: string }) => void; issues: Issue[] }) {
  const v = (value ?? { name: "" }) as { name?: string; meta?: string };
  return (
    <div className="grid grid-cols-2 gap-2">
      <Label label="Nhân vật · tên">
        <input className={box} value={v.name ?? ""} onChange={(e) => onChange({ name: e.target.value, ...(v.meta ? { meta: v.meta } : {}) })} />
      </Label>
      <Label label="Nhân vật · mô tả" hint="không bắt buộc">
        <input className={box} value={v.meta ?? ""} onChange={(e) => onChange({ name: v.name ?? "", ...(e.target.value ? { meta: e.target.value } : {}) })} />
      </Label>
      <div className="col-span-2"><Errors issues={issues} path="persona" /></div>
    </div>
  );
}

export function RevealField({ value, onChange, issues }: { value: unknown; onChange: (v: { label: string; value: number }[] | undefined) => void; issues: Issue[] }) {
  const list = Array.isArray(value) ? (value as { label: string; value: number }[]) : [];
  const set = (next: typeof list) => onChange(next.length ? next : undefined);
  return (
    <Label label="Mốc hiện sau khi đoán (reveal)" hint="không bắt buộc">
      {list.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input className={box} value={r.label} onChange={(e) => set(list.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
          <input className={`${box} w-40`} type="number" step="any" value={Number.isFinite(r.value) ? r.value : ""} onChange={(e) => set(list.map((x, k) => (k === i ? { ...x, value: Number(e.target.value) } : x)))} />
          <button type="button" className={small} onClick={() => set(list.filter((_, k) => k !== i))}>Xóa</button>
        </div>
      ))}
      <button type="button" className={`${small} self-start`} onClick={() => set([...list, { label: "", value: 0 }])}>+ Thêm mốc</button>
      <Errors issues={issues} path="reveal" />
    </Label>
  );
}

export function SourceField({ value, onChange, issues, optional }: { value: unknown; onChange: (v: { sourceId: string; locator?: string } | undefined) => void; issues: Issue[]; optional?: boolean }) {
  const v = value as { sourceId?: string; locator?: string } | undefined;
  return (
    <div className="grid grid-cols-2 gap-2">
      <Label label="Nguồn" hint={optional ? "không bắt buộc" : undefined}>
        <select className={box} value={v?.sourceId ?? ""} onChange={(e) => onChange(e.target.value ? { sourceId: e.target.value, ...(v?.locator ? { locator: v.locator } : {}) } : undefined)}>
          <option value="">(không có)</option>
          {sources.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.title}{"internal" in s && s.internal ? " (nội bộ)" : ""}</option>)}
        </select>
      </Label>
      <Label label="Vị trí trong nguồn" hint="không bắt buộc">
        <input className={box} value={v?.locator ?? ""} disabled={!v?.sourceId} onChange={(e) => onChange({ sourceId: v!.sourceId!, ...(e.target.value ? { locator: e.target.value } : {}) })} />
      </Label>
      <div className="col-span-2"><Errors issues={issues} path="source" /></div>
    </div>
  );
}
