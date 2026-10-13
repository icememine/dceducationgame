import { getStaff } from "@/features/admin/auth";
import { toCsv, vnDayEnd, vnDayStart } from "@/features/compliance/review";
import { listAudit } from "@/features/staff/audit-queries";
import { AUDIT_ACTIONS, can } from "@/features/staff/roles";
import { audit } from "@/features/staff/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || staff.mustChangePassword || !can(staff.role, "audit")) return new Response("Not Found", { status: 404 });
  const p = new URL(req.url).searchParams;
  const action = p.get("action");
  const rows = await listAudit({ username: p.get("user") || undefined, action: action && action in AUDIT_ACTIONS ? action : undefined, from: vnDayStart(p.get("from")), to: vnDayEnd(p.get("to")), limit: 10000 });
  const csv = toCsv(["thời gian", "người dùng", "thao tác", "đối tượng", "chi tiết"], rows.map((r) => [r.createdAt.toISOString(), r.username, AUDIT_ACTIONS[r.action] ?? r.action, r.target, JSON.stringify(r.detail)]));
  await audit(staff, "export", "audit", { rows: rows.length });
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="audit-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
