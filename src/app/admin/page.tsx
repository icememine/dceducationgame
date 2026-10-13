import Link from "next/link";
import { requireStaff } from "@/features/admin/auth";
import { githubConfig } from "@/features/admin/content-files";
import { complianceCounts } from "@/features/compliance/queries";
import { can, ROLES, type Permission } from "@/features/staff/roles";

const CARDS: { href: string; perm: Permission; title: string; text: (n: { aiFlagged: number; riskAttention: number }) => React.ReactNode }[] = [
  { href: "/admin/ai-review", perm: "ai-review", title: "Duyệt câu trả lời AI", text: (n) => <>Câu trả lời Hỏi Rồng có cờ cảnh báo: <b className="text-ink">{n.aiFlagged} chưa duyệt</b>. Lọc theo cờ, ngày, từ khoá; ghi kết quả và tải CSV.</> },
  { href: "/admin/risk-audit", perm: "risk-audit", title: "Kiểm tra hồ sơ rủi ro", text: (n) => <>Trường hợp cần xem (§5.2, cảnh báo ③, chọn cao hơn): <b className="text-ink">{n.riskAttention} chưa duyệt</b>.</> },
  { href: "/admin/analytics", perm: "analytics", title: "Phân tích câu hỏi", text: () => "Tỷ lệ đúng lần đầu, đáp án sai phổ biến nhất, tỷ lệ hoàn thành từng bài." },
  { href: "/admin/editor", perm: "editor", title: "Trình soạn thảo", text: () => "Sửa một câu hỏi, xem trước như học viên thấy, rồi tạo bản sửa." },
  { href: "/admin/market-sim", perm: "market-sim", title: "Mô phỏng thị trường giảm", text: () => "Chỉ mô phỏng: xem trước lời nhắc \"[Mô phỏng] Thị trường giảm X%\" (gửi cho tất cả: chỉ quản trị viên)." },
  { href: "/admin/audit", perm: "audit", title: "Nhật ký", text: () => "Ai đã làm gì: đăng nhập, duyệt, sửa nội dung, gửi mô phỏng, thay đổi tài khoản." },
  { href: "/admin/staff", perm: "staff", title: "Tài khoản nhân viên", text: () => "Tạo tài khoản, đổi vai trò, vô hiệu hoá, đặt lại mật khẩu." },
];

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const staff = await requireStaff();
  const { denied } = await searchParams;
  const gh = githubConfig();
  const counts = can(staff.role, "ai-review") || can(staff.role, "risk-audit") ? await complianceCounts() : { aiFlagged: 0, riskAttention: 0 };
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Khu vực quản trị</h1>
      <p className="text-sm text-muted">Xin chào {staff.displayName} · vai trò <b>{ROLES[staff.role].label}</b> ({ROLES[staff.role].description}).</p>
      {denied && <p role="alert" className="rounded-lg bg-coral-soft p-3 text-sm font-bold text-coral-deep">Vai trò của bạn không được mở trang đó.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {CARDS.filter((c) => can(staff.role, c.perm)).map((c) => (
          <li key={c.href} className="rounded-xl border border-line bg-surface p-4">
            <Link href={c.href} className="font-extrabold text-sky-deep hover:underline">{c.title}</Link>
            <p className="text-sm text-muted">{c.text(counts)}</p>
          </li>
        ))}
      </ul>
      {can(staff.role, "editor") && (
        <p className="text-sm text-muted">
          Bản sửa: {gh ? <>tạo pull request vào nhánh <b>{gh.base}</b> của <b>{gh.repo}</b>.</> : <>chưa cấu hình GitHub (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BASE), trình soạn thảo sẽ hiện diff và cho tải file đã sửa.</>}
        </p>
      )}
    </main>
  );
}
