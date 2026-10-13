import { requireStaff } from "@/features/admin/auth";
import { vnDayEnd, vnDayStart } from "@/features/compliance/review";
import { DateRange, field, input, vnTime } from "@/features/compliance/ui/parts";
import { auditUsernames, listAudit } from "@/features/staff/audit-queries";
import { AUDIT_ACTIONS } from "@/features/staff/roles";

export const metadata = { title: "Nhật ký quản trị" };

type SP = { user?: string; action?: string; from?: string; to?: string };

const detailText = (d: unknown) =>
  d && typeof d === "object" && Object.keys(d).length ? Object.entries(d as Record<string, unknown>).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`).join(" · ") : "";

export default async function AuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireStaff("audit");
  const sp = await searchParams;
  const action = sp.action && sp.action in AUDIT_ACTIONS ? sp.action : undefined;
  const [rows, users] = await Promise.all([listAudit({ username: sp.user || undefined, action, from: vnDayStart(sp.from), to: vnDayEnd(sp.to) }), auditUsernames()]);
  const qs = new URLSearchParams({ ...(sp.user && { user: sp.user }), ...(action && { action }), ...(sp.from && { from: sp.from }), ...(sp.to && { to: sp.to }) });
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Nhật ký quản trị</h1>
      <p className="text-sm text-muted">Mọi đăng nhập (kể cả thất bại), duyệt, bản sửa nội dung, mô phỏng, tải CSV và thay đổi tài khoản. Không sửa hay xoá được.</p>
      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-3">
        <label className={field}>Người dùng
          <select name="user" defaultValue={sp.user ?? ""} className={input}>
            <option value="">Tất cả</option>
            {users.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <label className={field}>Thao tác
          <select name="action" defaultValue={action ?? ""} className={input}>
            <option value="">Tất cả</option>
            {Object.entries(AUDIT_ACTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <DateRange from={sp.from} to={sp.to} />
        <button className="rounded-lg bg-sky px-3 py-1.5 text-sm font-extrabold text-on-accent">Lọc</button>
        {/* Plain <a>: a prefetched <Link> would run the export (and log it) without a click. */}
        <a href={`/admin/audit/export?${qs}`} download className="text-sm font-bold text-sky-deep underline">Tải CSV</a>
      </form>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted"><tr><th className="p-2">Thời gian</th><th className="p-2">Người dùng</th><th className="p-2">Thao tác</th><th className="p-2">Đối tượng</th><th className="p-2">Chi tiết</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line align-top">
              <td className="whitespace-nowrap p-2">{vnTime(r.createdAt)}</td>
              <td className="p-2 font-bold">{r.username}</td>
              <td className={`p-2 ${r.action.startsWith("login-") ? "font-bold text-coral-deep" : ""}`}>{AUDIT_ACTIONS[r.action] ?? r.action}</td>
              <td className="p-2">{r.target}</td>
              <td className="p-2 text-xs text-muted">{detailText(r.detail)}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="p-4 text-muted">Không có mục nào.</td></tr>}
        </tbody>
      </table>
    </main>
  );
}
