"use client";

import { Check, X } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { cn, formatVnd } from "@/lib/utils";
import { formatDuration, monthsToTarget, projection } from "@/features/goal-planner/finance";
import type { ClientChallenge } from "./types";

/** Learner's in-progress answer, keyed by the challenge type the player is showing. */
export type Draft = {
  choice?: number;
  bool?: boolean;
  pairs?: (number | undefined)[];
  pickedLeft?: number;
  order?: number[];
  text?: string;
  plan?: { target: number; monthly: number; initial: number; annualReturn: number };
};

type ViewProps<T extends ClientChallenge["type"]> = {
  c: Extract<ClientChallenge, { type: T }>;
  draft: Draft;
  setDraft: (d: Draft) => void;
  locked: boolean;
};

const opt =
  "flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 border-line bg-surface p-3.5 text-left font-bold transition-colors aria-pressed:border-sky aria-pressed:bg-sky-soft disabled:opacity-80";
const key = "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-line text-xs text-muted";

function Options({ options, draft, setDraft, locked, letters }: { options: string[]; draft: Draft; setDraft: (d: Draft) => void; locked: boolean; letters?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o, i) => (
        <button key={i} className={opt} aria-pressed={draft.choice === i} disabled={locked} onClick={() => setDraft({ choice: i })}>
          <span className={key}>{letters ? String.fromCharCode(65 + i) : i + 1}</span>
          <span>{o}</span>
        </button>
      ))}
    </div>
  );
}

const Context = ({ text }: { text?: string }) =>
  text ? <div className="rounded-2xl bg-sunken p-4 text-[15px]">{text}</div> : null;

export function InfoView({ c }: { c: Extract<ClientChallenge, { type: "info" }> }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Mascot mood={c.mascot ?? "study"} size={140} />
      <h2 className="text-2xl font-extrabold">{c.title}</h2>
      <p className="text-[16px] leading-relaxed">{c.body}</p>
    </div>
  );
}

export function SelectView({ c, ...p }: ViewProps<"select">) {
  return (
    <>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <Context text={c.context} />
      <Options options={c.options} {...p} />
    </>
  );
}

export function ScenarioView({ c, ...p }: ViewProps<"scenario">) {
  return (
    <>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral font-extrabold text-white">{c.persona.name[0]}</span>
        <div className="rounded-2xl rounded-tl-sm border-2 border-line p-3">
          <small className="block font-bold text-muted">{c.persona.name}{c.persona.meta && ` · ${c.persona.meta}`}</small>
          {c.says}
        </div>
      </div>
      <Options options={c.options} letters {...p} />
    </>
  );
}

export function TrueFalseView({ c, draft, setDraft, locked }: ViewProps<"true_false">) {
  return (
    <>
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Đúng hay sai?</p>
      <div className="rounded-2xl bg-sunken p-4 text-lg font-bold">“{c.prompt}”</div>
      <div className="grid grid-cols-2 gap-3">
        <button className={cn(opt, "justify-center text-jade-deep")} aria-pressed={draft.bool === true} disabled={locked} onClick={() => setDraft({ bool: true })}>
          <Check /> Đúng
        </button>
        <button className={cn(opt, "justify-center text-coral")} aria-pressed={draft.bool === false} disabled={locked} onClick={() => setDraft({ bool: false })}>
          <X /> Sai
        </button>
      </div>
    </>
  );
}

const PAIR_COLORS = ["bg-sky-soft border-sky", "bg-gold-soft border-gold", "bg-violet-soft border-violet", "bg-coral-soft border-coral", "bg-jade-soft border-jade"];

/**
 * The server holds the answer key, so pairs can't be checked one by one as in the
 * prototype. The learner builds every pair (colour-coded), then checks once.
 */
export function MatchView({ c, draft, setDraft, locked }: ViewProps<"match">) {
  const pairs = draft.pairs ?? Array<number | undefined>(c.left.length).fill(undefined);
  const leftOfRight = (j: number) => pairs.findIndex((p) => p === j);
  const tapLeft = (i: number) => {
    if (pairs[i] !== undefined) {
      const next = [...pairs];
      next[i] = undefined;
      return setDraft({ ...draft, pairs: next, pickedLeft: undefined });
    }
    setDraft({ ...draft, pairs, pickedLeft: i });
  };
  const tapRight = (j: number) => {
    if (draft.pickedLeft === undefined || leftOfRight(j) !== -1) return;
    const next = [...pairs];
    next[draft.pickedLeft] = j;
    setDraft({ ...draft, pairs: next, pickedLeft: undefined });
  };
  const tile = "min-h-14 rounded-2xl border-2 border-b-4 border-line bg-surface p-2.5 text-sm font-bold";
  return (
    <>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-2.5">
          {c.left.map((t, i) => (
            <button key={i} disabled={locked} aria-pressed={draft.pickedLeft === i} onClick={() => tapLeft(i)}
              className={cn(tile, pairs[i] !== undefined && PAIR_COLORS[i % PAIR_COLORS.length], draft.pickedLeft === i && "border-sky")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {c.right.map((t, j) => {
            const li = leftOfRight(j);
            return (
              <button key={j} disabled={locked} onClick={() => tapRight(j)} className={cn(tile, li !== -1 && PAIR_COLORS[li % PAIR_COLORS.length])}>
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted">Chọn một ô bên trái rồi chọn ô tương ứng bên phải. Chạm lại ô bên trái để bỏ cặp.</p>
    </>
  );
}

export function OrderView({ c, draft, setDraft, locked }: ViewProps<"order">) {
  const order = draft.order ?? [];
  return (
    <>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <ol className="flex min-h-24 flex-col gap-2 rounded-2xl border-2 border-dashed border-line p-2">
        {order.map((idx, pos) => (
          <li key={idx}>
            <button className={opt} disabled={locked} onClick={() => setDraft({ order: order.filter((x) => x !== idx) })}>
              <span className={key}>{pos + 1}</span>{c.items[idx]}
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2">
        {c.items.map((t, idx) =>
          order.includes(idx) ? null : (
            <button key={idx} className={opt} disabled={locked} onClick={() => setDraft({ order: [...order, idx] })}>{t}</button>
          ),
        )}
      </div>
    </>
  );
}

export function NumericView({ c, draft, setDraft, locked }: ViewProps<"numeric">) {
  return (
    <>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <Context text={c.context} />
      <label className="flex items-center gap-2 rounded-2xl border-2 border-line bg-sunken p-4 focus-within:border-sky">
        <input inputMode="decimal" autoComplete="off" placeholder="0" disabled={locked} value={draft.text ?? ""}
          onChange={(e) => setDraft({ text: e.target.value })}
          className="w-full bg-transparent text-2xl font-extrabold outline-none" />
        <span className="font-bold text-muted">{c.unit}</span>
      </label>
      {c.hint && <p className="text-sm text-muted">{c.hint}</p>}
    </>
  );
}

export function ProfileView({ c, draft, setDraft, locked }: ViewProps<"profile">) {
  return (
    <>
      <p className="text-xs font-extrabold uppercase tracking-widest text-jade-deep">Tự đánh giá · không có đáp án sai</p>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <Options options={c.options} draft={draft} setDraft={setDraft} locked={locked} />
    </>
  );
}

const field = "flex flex-col gap-1 text-sm font-bold";
const input = "rounded-xl border-2 border-line bg-sunken p-2.5 font-extrabold outline-none focus:border-sky";

export function GoalPlannerView({ c, draft, setDraft, locked }: ViewProps<"goal_planner">) {
  const plan = draft.plan ?? c.defaults;
  const set = (k: keyof typeof plan, v: number) => setDraft({ plan: { ...plan, [k]: v } });
  const months = monthsToTarget(plan, plan.target);
  const years = Math.min(40, Math.max(1, Math.ceil(months / 12) || 10));
  const pts = projection(plan, years);
  const max = Math.max(...pts.map((p) => p.value), plan.target);
  return (
    <>
      <h2 className="text-xl font-extrabold">{c.prompt}</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className={field}>Mục tiêu (triệu đ)
          <input className={input} inputMode="numeric" disabled={locked} value={plan.target / 1e6} onChange={(e) => set("target", Number(e.target.value) * 1e6 || 0)} />
        </label>
        <label className={field}>Mỗi tháng (triệu đ)
          <input className={input} inputMode="numeric" disabled={locked} value={plan.monthly / 1e6} onChange={(e) => set("monthly", Number(e.target.value) * 1e6 || 0)} />
        </label>
        <label className={field}>Vốn ban đầu (triệu đ)
          <input className={input} inputMode="numeric" disabled={locked} value={plan.initial / 1e6} onChange={(e) => set("initial", Number(e.target.value) * 1e6 || 0)} />
        </label>
        <label className={field}>Lợi nhuận giả định ({Math.round(plan.annualReturn * 100)}%/năm)
          <input type="range" min={0} max={20} step={1} disabled={locked} value={Math.round(plan.annualReturn * 100)} onChange={(e) => set("annualReturn", Number(e.target.value) / 100)} />
        </label>
      </div>
      <div className="rounded-2xl bg-jade-soft p-4">
        <p className="text-sm font-bold text-jade-deep">Thời gian ước tính</p>
        <p className="font-display text-3xl font-extrabold">{formatDuration(months)}</p>
        {Number.isFinite(months) && <p className="text-sm">Bạn góp khoảng {formatVnd(plan.initial + plan.monthly * months)}, phần còn lại từ lãi kép.</p>}
      </div>
      {/* Minimal bar chart: contributed vs projected value per year. */}
      <div className="flex h-28 items-end gap-1" aria-label="Biểu đồ tích lũy theo năm">
        {pts.slice(1).map((p) => (
          <div key={p.year} className="relative flex-1" title={`Năm ${p.year}: ${formatVnd(p.value)}`}>
            <div className="w-full rounded-t bg-jade" style={{ height: `${(p.value / max) * 112}px` }} />
            <div className="absolute bottom-0 w-full rounded-t bg-gold/80" style={{ height: `${(p.contributed / max) * 112}px` }} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted"><span className="font-bold text-gold-deep">■</span> Vốn góp · <span className="font-bold text-jade-deep">■</span> Giá trị minh họa. Giả định, không phải cam kết.</p>
    </>
  );
}
