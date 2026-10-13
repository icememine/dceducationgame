import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { staffUsers } from "@/db/schema";
import { requireStaff } from "@/features/admin/auth";
import { ROLES } from "@/features/staff/roles";
import { vnTime } from "@/features/compliance/ui/parts";
import { CreateStaffForm, EditStaffRow } from "./staff-forms";

export const metadata = { title: "Tài khoản nhân viên" };

export default async function StaffPage() {
  const me = await requireStaff("staff");
  const db = await getDb();
  const people = await db.select().from(staffUsers).orderBy(asc(staffUsers.username));
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Tài khoản nhân viên</h1>
      <ul className="grid gap-2 text-sm sm:grid-cols-3">
        {Object.entries(ROLES).map(([id, r]) => <li key={id} className="rounded-lg bg-surface p-3"><b>{r.label}</b>: {r.description}</li>)}
      </ul>
      <CreateStaffForm />
      <table className="w-full border-collapse text-sm">
        <thead className="text-left text-xs text-muted">
          <tr><th className="p-2">Tên đăng nhập</th><th className="p-2">Họ tên · vai trò · trạng thái</th><th className="p-2">Đăng nhập gần nhất</th><th className="p-2">Mật khẩu</th></tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <EditStaffRow
              key={p.id}
              person={{ id: p.id, username: p.username, displayName: p.displayName, role: p.role, active: p.active, mustChangePassword: p.mustChangePassword }}
              lastLogin={p.lastLoginAt ? vnTime(p.lastLoginAt) : "Chưa đăng nhập"}
              isMe={p.id === me.id}
            />
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted">
        Tài khoản không bị xoá, chỉ vô hiệu hoá, để nhật ký và lịch sử duyệt luôn chỉ đúng người. Đổi vai trò, vô hiệu hoá hoặc đặt lại mật khẩu sẽ đăng xuất người đó ở mọi thiết bị.
      </p>
    </main>
  );
}
