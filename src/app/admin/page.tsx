import Link from "next/link";
import { requireAdmin } from "@/features/admin/auth";
import { githubConfig } from "@/features/admin/content-files";
import { complianceCounts } from "@/features/compliance/queries";

export default async function AdminHome() {
  await requireAdmin();
  const gh = githubConfig();
  const open = await complianceCounts();
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Khu vực quản trị</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/ai-review" className="font-extrabold text-sky-deep hover:underline">Duyệt câu trả lời AI</Link>
          <p className="text-sm text-muted">Câu trả lời Hỏi Rồng có cờ cảnh báo: <b className="text-ink">{open.aiFlagged} chưa duyệt</b>. Lọc theo cờ, ngày, từ khoá; ghi kết quả và tải CSV.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/risk-audit" className="font-extrabold text-sky-deep hover:underline">Kiểm tra hồ sơ rủi ro</Link>
          <p className="text-sm text-muted">Trường hợp cần xem (§5.2, cảnh báo ③, chọn cao hơn): <b className="text-ink">{open.riskAttention} chưa duyệt</b>. Xem điểm từng câu và lựa chọn của học viên.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/analytics" className="font-extrabold text-sky-deep hover:underline">Phân tích câu hỏi</Link>
          <p className="text-sm text-muted">Tỷ lệ đúng lần đầu, đáp án sai phổ biến nhất, tỷ lệ hoàn thành từng bài.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/editor" className="font-extrabold text-sky-deep hover:underline">Trình soạn thảo</Link>
          <p className="text-sm text-muted">Sửa một câu hỏi, xem trước như học viên thấy, rồi tạo bản sửa.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4">
          <Link href="/admin/market-sim" className="font-extrabold text-sky-deep hover:underline">Mô phỏng thị trường giảm</Link>
          <p className="text-sm text-muted">Chỉ mô phỏng: gửi thử lời nhắc &quot;[Mô phỏng] Thị trường giảm X%&quot; để xem trước hoặc luyện tập.</p>
        </li>
      </ul>
      <p className="text-sm text-muted">
        Bản sửa: {gh ? <>tạo pull request vào nhánh <b>{gh.base}</b> của <b>{gh.repo}</b>.</> : <>chưa cấu hình GitHub (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BASE), trình soạn thảo sẽ hiện diff và cho tải file đã sửa.</>}
      </p>
    </main>
  );
}
