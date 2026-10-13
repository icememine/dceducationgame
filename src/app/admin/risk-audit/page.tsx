import Link from "next/link";
import { SPECIAL_CASES } from "@content/risk";
import { requireAdmin } from "@/features/admin/auth";
import { listRiskProfiles, reviewHistory } from "@/features/compliance/queries";
import { parseStatus, riskAudit, vnDayEnd, vnDayStart } from "@/features/compliance/review";
import { DateRange, field, History, input, StatusBadge, StatusSelect, vnTime } from "@/features/compliance/ui/parts";
import { ReviewForm } from "@/features/compliance/ui/review-form";

export const metadata = { title: "Kiểm tra hồ sơ rủi ro" };

const VIEWS: Record<string, string> = {
  attention: "Cần xem (§5.2, cảnh báo ③, chọn cao hơn)",
  ...SPECIAL_CASES.labels,
  confirmed: "Đã xác nhận",
  unconfirmed: "Chưa xác nhận",
  all: "Tất cả",
};

type SP = { status?: string; view?: string; from?: string; to?: string };

/** Compliance audit of risk-check results (risk_profiles): scoring trail, §5 decision, §5.2 flags. */
export default async function RiskAuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const view = sp.view && sp.view in VIEWS ? sp.view : "attention";
  const { rows, total } = await listRiskProfiles({ status, view, from: vnDayStart(sp.from), to: vnDayEnd(sp.to) });
  const history = await reviewHistory("risk", rows.map((r) => r.id));
  const qs = new URLSearchParams({ status, view, ...(sp.from && { from: sp.from }), ...(sp.to && { to: sp.to }) });
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Kiểm tra hồ sơ khẩu vị rủi ro</h1>
      <p className="text-sm text-muted">
        Theo Risk Scoring Framework v2.3: điểm từng câu, quy tắc điều chỉnh ① ②, cảnh báo ③, mâu thuẫn ④, lựa chọn của học viên ở bước xác nhận (§5) và các
        trường hợp đặc biệt §5.2. Mặc định: các trường hợp cần xem, chưa duyệt.
      </p>
      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-3">
        <StatusSelect value={status} />
        <label className={field}>
          Nhóm
          <select name="view" defaultValue={view} className={input}>
            {Object.entries(VIEWS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <DateRange from={sp.from} to={sp.to} />
        <button className="rounded-lg bg-sky px-3 py-1.5 text-sm font-extrabold text-white">Lọc</button>
        <Link href={`/admin/risk-audit/export?${qs}`} className="text-sm font-bold text-sky-deep underline">Tải CSV</Link>
      </form>
      <p className="text-sm font-bold">{total} kết quả{total > rows.length ? ` (hiện ${rows.length} mới nhất)` : ""}</p>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const a = riskAudit(row);
          return (
            <li key={row.id} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-bold text-ink">#{a.id}</span>
                <span>{vnTime(a.when)}</span>
                <span>{a.learner} (…{a.learnerRef})</span>
                <span>Khung {a.framework}</span>
                <StatusBadge outcome={row.outcome} reviewer={row.reviewer} at={row.reviewedAt} />
              </div>
              <p className="text-sm">
                Tổng điểm <b>{a.total ?? "—"}</b> → theo điểm <b>{a.scored}</b> → đề xuất <b>{a.proposed}</b> → học viên <b>{a.decision}</b> → hồ sơ dùng <b>{a.final}</b>
                {a.acknowledged && <> · <span className="font-bold text-coral-deep">đã tick xác nhận rủi ro</span></>}
              </p>
              {a.flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {a.flags.map((f) => <span key={f.id} className={`rounded-full px-2 py-0.5 font-bold ${f.id === "unconfirmed" ? "bg-sunken text-muted" : "bg-coral-soft text-coral-deep"}`}>{f.label}</span>)}
                </div>
              )}
              <details>
                <summary className="cursor-pointer text-sm font-bold text-sky-deep">Chi tiết điểm và duyệt</summary>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  {a.sections && <p>Điểm theo phần: {Object.entries(a.sections).map(([k, v]) => `${k} ${v}`).join(" · ")}</p>}
                  {a.overrides.length > 0 && <p>Điều chỉnh: {a.overrides.join(" ")}</p>}
                  {a.capacityWarning && <p>Cảnh báo ③: {a.capacityWarning}</p>}
                  {a.inconsistency && <p>Mâu thuẫn ④: {a.inconsistency}</p>}
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-line"><th className="py-1">Câu hỏi</th><th>Trả lời</th><th className="text-right">Điểm</th></tr></thead>
                    <tbody>
                      {a.answers.map((x) => (
                        <tr key={x.question} className="border-b border-line align-top"><td className="py-1 pr-2">{x.question}</td><td className="pr-2">{x.answer}</td><td className="text-right">{x.points ?? "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <History items={history.get(row.id)} />
                  <ReviewForm kind="risk" id={row.id} />
                </div>
              </details>
            </li>
          );
        })}
        {!rows.length && <li className="rounded-lg bg-sunken p-4 text-sm text-muted">Không có kết quả nào khớp bộ lọc.</li>}
      </ul>
    </main>
  );
}
