"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changeOwnPassword, type PasswordState } from "@/actions/admin-session";

const box = "w-full rounded-lg border border-line bg-surface p-2.5 outline-none focus:border-sky";

export function PasswordForm({ min }: { min: number }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changeOwnPassword, {});
  if (state.done) {
    return (
      <p role="status" className="rounded-lg bg-jade-soft p-3 text-sm font-bold text-jade-deep">
        Đã đổi mật khẩu. Các phiên đăng nhập khác của bạn đã được đăng xuất. <Link href="/admin" className="underline">Về trang quản trị</Link>
      </p>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-bold">Mật khẩu hiện tại<input name="current" type="password" autoComplete="current-password" required className={box} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Mật khẩu mới<input name="next" type="password" autoComplete="new-password" required minLength={min} className={box} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Nhập lại mật khẩu mới<input name="confirm" type="password" autoComplete="new-password" required className={box} /></label>
      <p className="text-xs text-muted">Ít nhất {min} ký tự, có cả chữ và số, không chứa tên đăng nhập.</p>
      {state.error && <p role="alert" className="rounded-lg bg-coral-soft p-2 text-sm font-bold text-coral-deep">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-jade px-4 py-2.5 font-extrabold text-on-accent disabled:opacity-50">{pending ? "Đang lưu…" : "Đổi mật khẩu"}</button>
    </form>
  );
}
