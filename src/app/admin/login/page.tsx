import { redirect } from "next/navigation";
import { getStaff } from "@/features/admin/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập quản trị" };

export default async function AdminLoginPage() {
  if (await getStaff()) redirect("/admin");
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 pt-16">
      <h1 className="text-2xl font-extrabold">Đăng nhập quản trị</h1>
      <p className="text-sm text-muted">Khu vực dành cho nhân viên nội dung và Compliance.</p>
      <LoginForm />
    </main>
  );
}
