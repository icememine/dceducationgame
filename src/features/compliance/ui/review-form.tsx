"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/actions/compliance";
import { REVIEW_OUTCOMES } from "../review";

/** Outcome + note for one AI answer or risk confirmation. A note is required unless "Đạt". */
export function ReviewForm({ kind, id }: { kind: "ai" | "risk"; id: number }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  // Controlled: React resets uncontrolled fields after every action, which would drop the
  // chosen outcome and the note when the first try is refused (e.g. note missing).
  const [outcome, setOutcome] = useState("ok");
  const [note, setNote] = useState("");
  return (
    <form action={action} className="flex flex-col gap-2 rounded-lg bg-sunken p-3 text-sm">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <fieldset className="flex flex-wrap gap-3">
        <legend className="mb-1 font-bold">Kết quả duyệt</legend>
        {Object.entries(REVIEW_OUTCOMES).map(([v, label]) => (
          <label key={v} className="flex items-center gap-1.5"><input type="radio" name="outcome" value={v} checked={outcome === v} onChange={() => setOutcome(v)} />{label}</label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 font-bold">
        Ghi chú
        <textarea name="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="rounded border border-line bg-surface p-2 font-normal" placeholder="Bắt buộc khi Cần sửa / Chuyển cấp trên" />
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-lg bg-jade px-3 py-1.5 font-extrabold text-on-accent disabled:opacity-50">{pending ? "Đang lưu…" : "Lưu kết quả"}</button>
        {state.saved && <span role="status" className="font-bold text-jade-deep">Đã lưu: {REVIEW_OUTCOMES[state.saved as keyof typeof REVIEW_OUTCOMES]}</span>}
        {state.error && <span role="alert" className="font-bold text-coral-deep">{state.error}</span>}
      </div>
    </form>
  );
}
