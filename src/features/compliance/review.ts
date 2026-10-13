import { profileInfo, RISK_QUESTIONS, SPECIAL_CASES, type RiskResult } from "@content/risk";

/**
 * Compliance review of AI answers and risk-check confirmations: labels, the audit view of one
 * risk result, filters and CSV. Pure (no database), so it is unit-tested; SQL lives in queries.ts.
 */
export const REVIEW_OUTCOMES = { ok: "Đạt", issue: "Cần sửa", escalated: "Chuyển cấp trên" } as const;
export type ReviewOutcome = keyof typeof REVIEW_OUTCOMES;
export const isOutcome = (v: unknown): v is ReviewOutcome => typeof v === "string" && v in REVIEW_OUTCOMES;

/** Guardrail flags written by features/ai/guardrails.ts. */
export const AI_FLAG_LABELS: Record<string, string> = {
  promise: "Có thể hứa hẹn lợi nhuận",
  "asks-secret": "Có thể hỏi OTP/PIN/mật khẩu",
  "source-line": "Có dòng \"Nguồn:\" (đã tự xoá trước khi hiển thị)",
  "faq-number": "Nhắc số câu FAQ nội bộ",
};
export const aiFlagLabel = (f: string) => AI_FLAG_LABELS[f] ?? f;

export const DECISION_LABELS = { agree: "Đồng ý", lower: "Chọn thấp hơn", higher: "Chọn cao hơn" } as const;

/** Extra audit flags derived from the stored result (in addition to the §5.2 special cases). */
export const RISK_AUDIT_LABELS: Record<string, string> = {
  ...SPECIAL_CASES.labels,
  "capacity-warning": "Cảnh báo ③: khoản đầu tư chiếm phần lớn tài sản",
  unconfirmed: "Chưa xác nhận kết quả (§5)",
};

export type RiskRow = {
  id: number;
  userId: string;
  nickname: string;
  profile: string;
  finalProfile: string | null;
  decision: string | null;
  frameworkVersion: string | null;
  dimensions: unknown;
  flags: unknown;
  acknowledgedAt: Date | null;
  confirmedAt: Date | null;
  createdAt: Date;
};

type Stored = Partial<RiskResult> & { choices?: Record<string, number> };

/** Everything Compliance needs to judge one confirmation, in plain words. */
export function riskAudit(row: RiskRow) {
  const d = (row.dimensions ?? {}) as Stored;
  const stored = Array.isArray(row.flags) ? (row.flags as string[]) : [];
  const flags = [...stored];
  if (d.capacityWarning) flags.push("capacity-warning");
  if (!row.decision) flags.push("unconfirmed");
  const answers = RISK_QUESTIONS.map((q) => {
    const i = d.choices?.[q.id];
    const o = i === undefined ? undefined : q.options[i];
    return { question: q.prompt, answer: o?.label ?? "—", points: o?.points };
  });
  const name = (id?: string | null) => (id ? (profileInfo(id)?.name ?? id) : "—");
  return {
    id: row.id,
    learner: row.nickname,
    learnerRef: row.userId.slice(-8),
    when: row.confirmedAt ?? row.createdAt,
    total: d.total,
    sections: d.sections,
    scored: name(d.scored),
    proposed: name(row.profile),
    final: name(row.finalProfile),
    decision: row.decision ? (DECISION_LABELS[row.decision as keyof typeof DECISION_LABELS] ?? row.decision) : "Chưa xác nhận",
    acknowledged: !!row.acknowledgedAt,
    overrides: (d.overrides ?? []).map((o) => o.reason),
    capacityWarning: d.capacityWarning,
    inconsistency: d.inconsistency,
    flags: flags.map((f) => ({ id: f, label: RISK_AUDIT_LABELS[f] ?? f })),
    /** Needs a human look: any special case, a capacity warning, or a higher choice. */
    attention: flags.some((f) => f !== "unconfirmed"),
    answers,
    framework: row.frameworkVersion ?? "trước v2.3",
  };
}

/** Review status filter shared by both pages. */
export const STATUS_FILTERS = { todo: "Chưa duyệt", ok: "Đạt", issue: "Cần sửa", escalated: "Chuyển cấp trên", all: "Tất cả" } as const;
export type StatusFilter = keyof typeof STATUS_FILTERS;
export const parseStatus = (v: unknown): StatusFilter => (typeof v === "string" && v in STATUS_FILTERS ? (v as StatusFilter) : "todo");

/** "YYYY-MM-DD" → start of that day in Vietnam (UTC+7); anything else → undefined. */
export function vnDayStart(v: unknown): Date | undefined {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00+07:00`) : undefined;
}
export const vnDayEnd = (v: unknown) => {
  const d = vnDayStart(v);
  return d ? new Date(d.getTime() + 86_400_000) : undefined;
};

/** RFC 4180 CSV with a UTF-8 BOM so Excel opens Vietnamese text correctly. */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
