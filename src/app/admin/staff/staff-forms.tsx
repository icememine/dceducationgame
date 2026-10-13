"use client";

import { useActionState, useState } from "react";
import { createStaff, resetStaffPassword, updateStaff, type StaffState } from "@/actions/staff";
import { ROLES } from "@/features/staff/roles";

const box = "rounded border border-line bg-surface p-1.5 text-sm";

function OneTimePassword({ username, password, label }: { username: string; password: string; label: string }) {
  return (
    <div role="status" className="rounded-lg bg-gold-soft p-3 text-sm">
      <p className="font-bold">{label} cho <b>{username}</b>. Mật khẩu tạm (chỉ hiện một lần, người dùng phải đổi khi đăng nhập):</p>
      <code data-testid="temp-password" className="mt-1 inline-block rounded bg-surface px-2 py-1 text-base font-extrabold">{password}</code>
    </div>
  );
}

export function CreateStaffForm() {
  const [state, action, pending] = useActionState<StaffState, FormData>(createStaff, {});
  // Controlled, so a refused attempt keeps what was typed.
  const [f, setF] = useState({ username: "", displayName: "", role: "content" });
  return (
    <form action={action} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <h2 className="font-extrabold">Tạo tài khoản</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold">Tên đăng nhập<input name="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} className={box} placeholder="vd: lan.nguyen" /></label>
        <label className="flex flex-col gap-1 text-xs font-bold">Họ tên<input name="displayName" value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} className={box} /></label>
        <label className="flex flex-col gap-1 text-xs font-bold">Vai trò
          <select name="role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={box}>
            {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{r.label}</option>)}
          </select>
        </label>
        <button disabled={pending} className="rounded-lg bg-jade px-3 py-1.5 text-sm font-extrabold text-on-accent disabled:opacity-50">Tạo tài khoản</button>
      </div>
      {state.error && <p role="alert" className="text-sm font-bold text-coral-deep">{state.error}</p>}
      {state.created && <OneTimePassword {...state.created} label="Đã tạo tài khoản" />}
    </form>
  );
}

type Person = { id: number; username: string; displayName: string; role: string; active: boolean; mustChangePassword: boolean };

export function EditStaffRow({ person, lastLogin, isMe }: { person: Person; lastLogin: string; isMe: boolean }) {
  const [saveState, save, saving] = useActionState<StaffState, FormData>(updateStaff, {});
  const [resetState, reset, resetting] = useActionState<StaffState, FormData>(resetStaffPassword, {});
  const [f, setF] = useState({ displayName: person.displayName, role: person.role, active: person.active });
  return (
    <tr className="border-t border-line align-top" data-username={person.username}>
      <td className="p-2 font-bold">{person.username}{isMe && <span className="ml-1 text-xs font-normal text-muted">(bạn)</span>}{!person.active && <span className="ml-1 rounded bg-sunken px-1 text-xs text-muted">đã vô hiệu</span>}</td>
      <td className="p-2">
        <form action={save} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={person.id} />
          <input name="displayName" aria-label={`Họ tên ${person.username}`} value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} className={box} />
          <select name="role" aria-label={`Vai trò ${person.username}`} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={box}>
            {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{r.label}</option>)}
          </select>
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="active" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Đang hoạt động</label>
          <button disabled={saving} className="rounded border border-line bg-surface px-2 py-1 text-xs font-bold disabled:opacity-50">Lưu</button>
          {saveState.saved && <span className="text-xs font-bold text-jade-deep">Đã lưu</span>}
          {saveState.error && <span role="alert" className="text-xs font-bold text-coral-deep">{saveState.error}</span>}
        </form>
      </td>
      <td className="p-2 text-xs text-muted">{lastLogin}{person.mustChangePassword && <><br />Chờ đổi mật khẩu</>}</td>
      <td className="p-2">
        <form action={reset}>
          <input type="hidden" name="id" value={person.id} />
          <button disabled={resetting} className="rounded border border-line bg-surface px-2 py-1 text-xs font-bold disabled:opacity-50">Đặt lại mật khẩu</button>
        </form>
        {resetState.reset && <OneTimePassword {...resetState.reset} label="Đã đặt lại mật khẩu" />}
        {resetState.error && <span role="alert" className="text-xs font-bold text-coral-deep">{resetState.error}</span>}
      </td>
    </tr>
  );
}
