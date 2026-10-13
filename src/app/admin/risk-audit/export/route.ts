import { SPECIAL_CASES } from "@content/risk";
import { getStaff } from "@/features/admin/auth";
import { can } from "@/features/staff/roles";
import { audit } from "@/features/staff/server";
import { listRiskProfiles } from "@/features/compliance/queries";
import { parseStatus, REVIEW_OUTCOMES, riskAudit, toCsv, vnDayEnd, vnDayStart } from "@/features/compliance/review";

export const dynamic = "force-dynamic";

const VIEWS = new Set(["attention", "confirmed", "unconfirmed", "all", ...Object.keys(SPECIAL_CASES.labels)]);

/** CSV of the risk-check results matching the page's filters (up to 5.000 rows), one column per answer. */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || staff.mustChangePassword || !can(staff.role, "risk-audit")) return new Response("Not Found", { status: 404 });
  const p = new URL(req.url).searchParams;
  const view = p.get("view") ?? "attention";
  const { rows } = await listRiskProfiles({ status: parseStatus(p.get("status")), view: VIEWS.has(view) ? view : "attention", from: vnDayStart(p.get("from")), to: vnDayEnd(p.get("to")), limit: 5000 });
  const audits = rows.map((r) => ({ r, a: riskAudit(r) }));
  const questions = audits[0]?.a.answers.map((x) => x.question) ?? [];
  const csv = toCsv(
    ["id", "thời gian", "học viên", "mã học viên", "khung", "tổng điểm", "theo điểm", "đề xuất", "lựa chọn", "hồ sơ dùng", "đã tick xác nhận", "điều chỉnh", "cờ", ...questions, "kết quả duyệt", "người duyệt", "ghi chú", "thời điểm duyệt"],
    audits.map(({ r, a }) => [
      a.id, a.when.toISOString(), a.learner, a.learnerRef, a.framework, a.total, a.scored, a.proposed, a.decision, a.final, a.acknowledged ? "có" : "không",
      a.overrides.join(" "), a.flags.map((f) => f.label).join("; "), ...a.answers.map((x) => `${x.answer} (${x.points ?? "—"})`),
      r.outcome ? REVIEW_OUTCOMES[r.outcome as keyof typeof REVIEW_OUTCOMES] : "Chưa duyệt", r.reviewer, r.note, r.reviewedAt?.toISOString(),
    ]),
  );
  await audit(staff, "export", "risk", { rows: rows.length, filters: Object.fromEntries(p) });
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="risk-audit-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
