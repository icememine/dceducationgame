"use server";

import { adminCredentials, assertAdmin } from "@/features/admin/auth";
import { addReview } from "@/features/compliance/queries";
import { isOutcome } from "@/features/compliance/review";

export type ReviewState = { saved?: string; error?: string };

/** Record a Compliance decision on an AI answer or a risk confirmation (append-only). */
export async function submitReview(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  await assertAdmin();
  const kind = form.get("kind");
  const id = Number(form.get("id"));
  const outcome = form.get("outcome");
  const note = String(form.get("note") ?? "");
  if ((kind !== "ai" && kind !== "risk") || !Number.isInteger(id) || !isOutcome(outcome)) return { error: "Thiếu thông tin duyệt" };
  if (outcome !== "ok" && !note.trim()) return { error: "Hãy ghi chú lý do khi chọn \"Cần sửa\" hoặc \"Chuyển cấp trên\"" };
  try {
    await addReview(kind, id, outcome, note, adminCredentials()?.username ?? "admin");
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  // No revalidation: the item stays on screen with its confirmation, so a reviewer can work down
  // the list; it leaves the "Chưa duyệt" view on the next filter or reload.
  return { saved: outcome };
}
