import { isAdmin } from "@/features/admin/auth";
import { listAiMessages } from "@/features/compliance/queries";
import { aiFlagLabel, AI_FLAG_LABELS, parseStatus, REVIEW_OUTCOMES, toCsv, vnDayEnd, vnDayStart } from "@/features/compliance/review";

export const dynamic = "force-dynamic";

/** CSV of the AI answers matching the page's filters (up to 5.000 rows). */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not Found", { status: 404 });
  const p = new URL(req.url).searchParams;
  const flag = p.get("flag") ?? "any";
  const { rows } = await listAiMessages({
    status: parseStatus(p.get("status")),
    flag: flag in AI_FLAG_LABELS || ["any", "none", "all"].includes(flag) ? flag : "any",
    from: vnDayStart(p.get("from")),
    to: vnDayEnd(p.get("to")),
    q: p.get("q")?.slice(0, 100) || undefined,
    limit: 5000,
  });
  const csv = toCsv(
    ["id", "thời gian", "học viên", "mã học viên", "câu hỏi", "câu trả lời", "chế độ", "mô hình", "cờ", "kết quả duyệt", "người duyệt", "ghi chú", "thời điểm duyệt"],
    rows.map((r) => [
      r.id, r.createdAt.toISOString(), r.nickname, r.userId.slice(-8), r.question, r.answer, r.mode, r.model, ((r.flags as string[]) ?? []).map(aiFlagLabel).join("; "),
      r.outcome ? REVIEW_OUTCOMES[r.outcome as keyof typeof REVIEW_OUTCOMES] : "Chưa duyệt", r.reviewer, r.note, r.reviewedAt?.toISOString(),
    ]),
  );
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="ai-review-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
