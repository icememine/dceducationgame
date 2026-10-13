import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth";
import { githubConfig } from "@/features/admin/content-files";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  // Cookies can only be set from a route handler; it checks the key and comes back here.
  if (key) redirect(`/admin/session?key=${encodeURIComponent(key)}`);
  await requireAdmin();
  const gh = githubConfig();
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Khu vực quản trị</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/analytics" className="font-extrabold text-sky-deep hover:underline">Phân tích câu hỏi</Link>
          <p className="text-sm text-muted">Tỷ lệ đúng lần đầu, đáp án sai phổ biến nhất, tỷ lệ hoàn thành từng bài.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/editor" className="font-extrabold text-sky-deep hover:underline">Trình soạn thảo</Link>
          <p className="text-sm text-muted">Sửa một câu hỏi, xem trước như học viên thấy, rồi tạo bản sửa.</p>
        </li>
      </ul>
      <p className="text-sm text-muted">
        Bản sửa: {gh ? <>tạo pull request vào nhánh <b>{gh.base}</b> của <b>{gh.repo}</b>.</> : <>chưa cấu hình GitHub (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BASE), trình soạn thảo sẽ hiện diff và cho tải file đã sửa.</>}
      </p>
    </main>
  );
}
