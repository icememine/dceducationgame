import { requireStaff } from "@/features/admin/auth";
import { listAiMessages, reviewHistory } from "@/features/compliance/queries";
import { AI_FLAG_LABELS, aiFlagLabel, parseStatus, vnDayEnd, vnDayStart } from "@/features/compliance/review";
import { DateRange, field, History, input, StatusBadge, StatusSelect, vnTime } from "@/features/compliance/ui/parts";
import { ReviewForm } from "@/features/compliance/ui/review-form";

export const metadata = { title: "Duyệt câu trả lời AI" };

type SP = { status?: string; flag?: string; from?: string; to?: string; q?: string };

/** Compliance review of Hỏi Rồng answers (ai_messages): filter, read, record a decision. */
export default async function AiReviewPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireStaff("ai-review");
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const flag = sp.flag && (sp.flag in AI_FLAG_LABELS || ["any", "none", "all"].includes(sp.flag)) ? sp.flag : "any";
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const { rows, total } = await listAiMessages({ status, flag, from: vnDayStart(sp.from), to: vnDayEnd(sp.to), q });
  const history = await reviewHistory("ai", rows.map((r) => r.id));
  const qs = new URLSearchParams({ status, flag, ...(sp.from && { from: sp.from }), ...(sp.to && { to: sp.to }), ...(q && { q }) });
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Duyệt câu trả lời AI (Hỏi Rồng)</h1>
      <p className="text-sm text-muted">Mặc định: câu trả lời có cờ cảnh báo và chưa duyệt. Cờ do bộ kiểm tra tự động gắn (features/ai/guardrails.ts); người duyệt quyết định cuối cùng.</p>
      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-3">
        <StatusSelect value={status} />
        <label className={field}>
          Cờ cảnh báo
          <select name="flag" defaultValue={flag} className={input}>
            <option value="any">Có ít nhất một cờ</option>
            {Object.entries(AI_FLAG_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            <option value="none">Không có cờ</option>
            <option value="all">Tất cả</option>
          </select>
        </label>
        <DateRange from={sp.from} to={sp.to} />
        <label className={field}>Tìm trong câu hỏi/trả lời<input name="q" defaultValue={q} className={input} /></label>
        <button className="rounded-lg bg-sky px-3 py-1.5 text-sm font-extrabold text-on-accent">Lọc</button>
        {/* Plain <a>: a prefetched <Link> would run the export (and log it) without a click. */}
        <a href={`/admin/ai-review/export?${qs}`} download className="text-sm font-bold text-sky-deep underline">Tải CSV</a>
      </form>
      <p className="text-sm font-bold">{total} câu trả lời{total > rows.length ? ` (hiện ${rows.length} mới nhất)` : ""}</p>
      <ul className="flex flex-col gap-3">
        {rows.map((r) => {
          const flags = (r.flags as string[]) ?? [];
          return (
            <li key={r.id} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-bold text-ink">#{r.id}</span>
                <span>{vnTime(r.createdAt)}</span>
                <span>{r.nickname} (…{r.userId.slice(-8)})</span>
                <span>{r.mode === "ai" ? `Mô hình ${r.model ?? ""}` : "Thư viện (không gọi mô hình)"}</span>
                <StatusBadge outcome={r.outcome} reviewer={r.reviewer} at={r.reviewedAt} />
                {flags.map((f) => <span key={f} className="rounded-full bg-coral-soft px-2 py-0.5 font-bold text-coral-deep">{aiFlagLabel(f)}</span>)}
              </div>
              <p className="text-sm"><b>Hỏi:</b> {r.question}</p>
              <details>
                <summary className="cursor-pointer text-sm font-bold text-sky-deep">Câu trả lời và duyệt</summary>
                <div className="mt-2 flex flex-col gap-2">
                  <p className="whitespace-pre-wrap rounded bg-sunken p-2 text-sm">{r.answer}</p>
                  <History items={history.get(r.id)} />
                  <ReviewForm kind="ai" id={r.id} />
                </div>
              </details>
            </li>
          );
        })}
        {!rows.length && <li className="rounded-lg bg-sunken p-4 text-sm text-muted">Không có câu trả lời nào khớp bộ lọc.</li>}
      </ul>
    </main>
  );
}
