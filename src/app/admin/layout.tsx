import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminLogout } from "@/actions/admin-session";
import { adminEnabled, isAdmin } from "@/features/admin/auth";

export const metadata: Metadata = {
  title: "Quản trị · Rồng DC Academy",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

/** Staff tools. Breaks out of the phone-width column of the root layout. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!adminEnabled()) notFound();
  const staff = await isAdmin();
  return (
    <div className="fixed inset-0 z-10 overflow-auto bg-page text-ink">
      {staff && (
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-line bg-surface px-4 py-2 text-sm">
          <Link href="/admin" className="font-extrabold">Quản trị</Link>
          <Link href="/admin/analytics" className="font-bold text-sky-deep hover:underline">Phân tích câu hỏi</Link>
          <Link href="/admin/editor" className="font-bold text-sky-deep hover:underline">Trình soạn thảo</Link>
          <Link href="/admin/market-sim" className="font-bold text-sky-deep hover:underline">Mô phỏng thị trường giảm</Link>
          <form action={adminLogout} className="ml-auto"><button className="font-bold text-muted hover:underline">Đăng xuất</button></form>
        </header>
      )}
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </div>
  );
}
