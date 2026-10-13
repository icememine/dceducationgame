"use server";

import { assertStaff } from "@/features/admin/auth";
import { audit } from "@/features/staff/server";
import { addReview } from "@/features/compliance/queries";
import { isOutcome } from "@/features/compliance/review";

export type ReviewState = { saved?: string; error?: string };

/** Record a Compliance decision on an AI answer or a risk confirmation (append-only). */
export async function submitReview(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const kind = form.get("kind");
  const staff = await assertStaff(kind === "ai" ? "ai-review" : "risk-audit");
  const id = Number(form.get("id"));
  const outcome = form.get("outcome");
  const note = String(form.get("note") ?? "");
  if ((kind !== "ai" && kind !== "risk") || !Number.isInteger(id) || !isOutcome(outcome)) return { error: "Thiếu thông tin duyệt" };
  if (outcome !== "ok" && !note.trim()) return { error: "Hãy ghi chú lý do khi chọn \"Cần sửa\" hoặc \"Chuyển cấp trên\"" };
  try {
    await addReview(kind, id, outcome, note, staff.username, staff.id);
    await audit(staff, "review", `${kind}#${id}`, { outcome, note });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  // No revalidation: the item stays on screen with its confirmation, so a reviewer can work down
  // the list; it leaves the "Chưa duyệt" view on the next filter or reload.
  return { saved: outcome };
}
