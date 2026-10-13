"use client";

import { useActionState } from "react";
import { sendMarketDropSim, type SimState } from "@/actions/admin-sim";

export function SimForm({ options }: { options: number[] }) {
  const [state, action, pending] = useActionState<SimState, FormData>(sendMarketDropSim, {});
  return (
    <form action={action} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-sm">
      <label className="flex flex-col gap-1 font-bold">
        Mức giảm mô phỏng
        <select name="drop" defaultValue="20" className="rounded-lg border border-line bg-surface p-2">
          {options.map((o) => <option key={o} value={o}>−{o}%</option>)}
        </select>
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="font-bold">Gửi tới</legend>
        <label className="flex items-center gap-2"><input type="radio" name="audience" value="me" defaultChecked /> Trình duyệt này (xem trước trong mục Thông báo)</label>
        <label className="flex items-center gap-2"><input type="radio" name="audience" value="all" /> Tất cả học viên (buổi luyện tập)</label>
      </fieldset>
      <button disabled={pending} className="self-start rounded-lg bg-coral px-4 py-2 font-extrabold text-white disabled:opacity-50">{pending ? "Đang gửi…" : "Gửi thông báo mô phỏng"}</button>
      {state.sent !== undefined && <p role="status" className="font-bold text-jade-deep">Đã gửi tới {state.sent} học viên.</p>}
      {state.error && <p role="alert" className="font-bold text-coral-deep">{state.error}</p>}
    </form>
  );
}
