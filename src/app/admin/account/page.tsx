import { requireStaff } from "@/features/admin/auth";
import { PASSWORD_MIN } from "@/features/staff/password";
import { ROLES } from "@/features/staff/roles";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Tài khoản của tôi" };

export default async function AccountPage() {
  const staff = await requireStaff(undefined, { allowPasswordChange: true });
  return (
    <main className="flex max-w-md flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Tài khoản của tôi</h1>
      <p className="text-sm">{staff.displayName} · <b>{staff.username}</b> · vai trò {ROLES[staff.role].label}</p>
      {staff.mustChangePassword && (
        <p role="alert" className="rounded-lg bg-gold-soft p-3 text-sm font-bold text-gold-deep">Hãy đặt mật khẩu mới trước khi dùng khu vực quản trị.</p>
      )}
      <PasswordForm min={PASSWORD_MIN} />
    </main>
  );
}
