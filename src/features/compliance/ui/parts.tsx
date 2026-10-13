import { REVIEW_OUTCOMES, STATUS_FILTERS } from "../review";

/** Small shared pieces for the two Compliance pages. */
export const vnTime = (d: Date | string) =>
  new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function StatusBadge({ outcome, reviewer, at }: { outcome: string | null; reviewer?: string | null; at?: Date | null }) {
  if (!outcome) return <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-extrabold text-gold-deep">Chưa duyệt</span>;
  const tone = outcome === "ok" ? "bg-jade-soft text-jade-deep" : outcome === "issue" ? "bg-coral-soft text-coral-deep" : "bg-violet-soft text-violet-deep";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${tone}`} title={at ? `${reviewer} · ${vnTime(at)}` : undefined}>
      {REVIEW_OUTCOMES[outcome as keyof typeof REVIEW_OUTCOMES] ?? outcome}{reviewer ? ` · ${reviewer}` : ""}
    </span>
  );
}

export function History({ items }: { items?: { outcome: string; note: string; reviewer: string; createdAt: Date }[] }) {
  if (!items?.length) return null;
  return (
    <div className="text-xs">
      <p className="font-bold">Lịch sử duyệt</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((h, i) => (
          <li key={i}>{vnTime(h.createdAt)} · {h.reviewer} · <b>{REVIEW_OUTCOMES[h.outcome as keyof typeof REVIEW_OUTCOMES] ?? h.outcome}</b>{h.note && <> · {h.note}</>}</li>
        ))}
      </ul>
    </div>
  );
}

export const field = "flex flex-col gap-1 text-xs font-bold";
export const input = "rounded border border-line bg-surface p-1.5 text-sm font-normal";

export function StatusSelect({ value }: { value: string }) {
  return (
    <label className={field}>
      Trạng thái duyệt
      <select name="status" defaultValue={value} className={input}>
        {Object.entries(STATUS_FILTERS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export function DateRange({ from, to }: { from?: string; to?: string }) {
  return (
    <>
      <label className={field}>Từ ngày<input type="date" name="from" defaultValue={from} className={input} /></label>
      <label className={field}>Đến ngày<input type="date" name="to" defaultValue={to} className={input} /></label>
    </>
  );
}
