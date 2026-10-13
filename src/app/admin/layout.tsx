import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminLogout } from "@/actions/admin-session";
import { getStaff } from "@/features/admin/auth";
import { can, NAV, ROLES } from "@/features/staff/roles";
import { adminAreaEnabled } from "@/features/staff/server";

export const metadata: Metadata = {
  title: "Quản trị · Rồng DC Academy",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

/** Staff tools. Breaks out of the phone-width column of the root layout; the menu follows the role. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await adminAreaEnabled())) notFound();
  const staff = await getStaff();
  return (
    <div className="fixed inset-0 z-10 overflow-auto bg-page text-ink">
      {staff && (
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-line bg-surface px-4 py-2 text-sm">
          <Link href="/admin" className="font-extrabold">Quản trị</Link>
          {!staff.mustChangePassword && NAV.filter((n) => can(staff.role, n.perm)).map((n) => (
            <Link key={n.href} href={n.href} className="font-bold text-sky-deep hover:underline">{n.label}</Link>
          ))}
          <span className="ml-auto flex items-center gap-3">
            <Link href="/admin/account" className="text-muted hover:underline">{staff.displayName} · {ROLES[staff.role].label}</Link>
            <form action={adminLogout}><button className="font-bold text-muted hover:underline">Đăng xuất</button></form>
          </span>
        </header>
      )}
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </div>
  );
}
