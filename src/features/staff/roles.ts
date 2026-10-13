/**
 * Staff roles and what each may do in /admin. One place to read and change the policy:
 *  - admin:      everything, including staff accounts and the audit log.
 *  - content:    analytics and the content editor (opens PRs / diffs).
 *  - compliance: reviews of AI answers and risk-check results, analytics, audit log.
 * Sending the market-drop simulation to every learner is admin-only; previewing it in one's
 * own browser is open to all staff.
 */
export const ROLES = {
  admin: { label: "Quản trị", description: "Toàn quyền, quản lý tài khoản nhân viên" },
  content: { label: "Nội dung", description: "Phân tích câu hỏi, trình soạn thảo" },
  compliance: { label: "Tuân thủ", description: "Duyệt câu trả lời AI, kiểm tra hồ sơ rủi ro, nhật ký" },
} as const;
export type Role = keyof typeof ROLES;
export const isRole = (v: unknown): v is Role => typeof v === "string" && v in ROLES;

export const PERMISSIONS = {
  analytics: ["admin", "content", "compliance"],
  editor: ["admin", "content"],
  "ai-review": ["admin", "compliance"],
  "risk-audit": ["admin", "compliance"],
  "market-sim": ["admin", "content", "compliance"],
  "market-sim:all": ["admin"],
  audit: ["admin", "compliance"],
  staff: ["admin"],
} as const satisfies Record<string, readonly Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export const can = (role: string | undefined, p: Permission) => !!role && (PERMISSIONS[p] as readonly string[]).includes(role);

/** Admin navigation, filtered by role. */
export const NAV: { href: string; label: string; perm: Permission }[] = [
  { href: "/admin/analytics", label: "Phân tích câu hỏi", perm: "analytics" },
  { href: "/admin/editor", label: "Trình soạn thảo", perm: "editor" },
  { href: "/admin/ai-review", label: "Duyệt câu trả lời AI", perm: "ai-review" },
  { href: "/admin/risk-audit", label: "Kiểm tra hồ sơ rủi ro", perm: "risk-audit" },
  { href: "/admin/market-sim", label: "Mô phỏng thị trường giảm", perm: "market-sim" },
  { href: "/admin/audit", label: "Nhật ký", perm: "audit" },
  { href: "/admin/staff", label: "Tài khoản nhân viên", perm: "staff" },
];

export const AUDIT_ACTIONS: Record<string, string> = {
  login: "Đăng nhập",
  "login-failed": "Đăng nhập thất bại",
  "login-locked": "Bị tạm khoá đăng nhập",
  logout: "Đăng xuất",
  "password-change": "Đổi mật khẩu",
  "staff-create": "Tạo tài khoản",
  "staff-update": "Sửa tài khoản",
  "staff-reset": "Đặt lại mật khẩu",
  "staff-bootstrap": "Tạo quản trị viên đầu tiên",
  review: "Duyệt",
  "content-edit": "Tạo bản sửa nội dung",
  "market-sim": "Gửi mô phỏng thị trường giảm",
  export: "Tải CSV",
};
