"use client";

import { useActionState, useState } from "react";
import { adminLogin, type LoginState } from "@/actions/admin-session";

const box = "w-full rounded-lg border border-line bg-surface p-2.5 outline-none focus:border-sky";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(adminLogin, {});
  // Controlled, so a failed attempt keeps the username (React resets uncontrolled form fields after an action).
  const [username, setUsername] = useState("");
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-bold">
        Tên đăng nhập
        <input name="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={box} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Mật khẩu
        <input name="password" type="password" autoComplete="current-password" required className={box} />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-coral-soft p-2 text-sm font-bold text-coral-deep">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-jade px-4 py-2.5 font-extrabold text-on-accent disabled:opacity-50">{pending ? "Đang kiểm tra…" : "Đăng nhập"}</button>
    </form>
  );
}
