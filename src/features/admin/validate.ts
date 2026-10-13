import type { ZodIssue } from "zod";
import { challenge as challengeSchema, QUIZ_TEXT_MAX, type Challenge } from "@content/schema";
import { sourceById } from "@content/sources";

/**
 * Validates one edited challenge: the real Zod schema (quiz formula limits included) plus the
 * per-challenge rules of validateContent() in content/index.ts. Runs in the browser (live) and
 * again in the server action before anything is written.
 */
export type Issue = { path: string; message: string };

export const GRADED_TYPES = ["select", "scenario", "spot", "match", "order", "numeric"] as const;
/** Fields that the quiz formula limits to 20–320 characters. */
export const FORMULA_TEXT_FIELDS = ["context", "says", "explain"] as const;
export const FORMULA_TEXT_MIN = 20;
export { QUIZ_TEXT_MAX };

function translate(i: ZodIssue): string {
  switch (i.code) {
    case "too_small":
      if (i.type === "string") return `Cần ít nhất ${i.minimum} ký tự`;
      if (i.type === "array") return i.exact ? `Cần đúng ${i.minimum} mục` : `Cần ít nhất ${i.minimum} mục`;
      return `Phải ≥ ${i.minimum}`;
    case "too_big":
      if (i.type === "string") return `Tối đa ${i.maximum} ký tự`;
      if (i.type === "array") return i.exact ? `Cần đúng ${i.maximum} mục` : `Tối đa ${i.maximum} mục`;
      return `Phải ≤ ${i.maximum}`;
    case "invalid_type":
      return i.received === "undefined" ? "Bắt buộc" : `Sai kiểu dữ liệu (cần ${i.expected})`;
    case "invalid_enum_value":
      return `Giá trị phải là một trong: ${i.options.join(", ")}`;
    case "invalid_string":
      return "Sai định dạng (chữ thường, số, dấu gạch ngang)";
    default:
      return i.message;
  }
}

export function validateChallenge(input: unknown): { data?: Challenge; issues: Issue[] } {
  const parsed = challengeSchema.safeParse(input);
  if (!parsed.success) return { issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: translate(i) })) };
  const c = parsed.data;
  const issues: Issue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });

  if (c.source && !sourceById(c.source.sourceId)) add("source.sourceId", `Nguồn "${c.source.sourceId}" không có trong content/sources.ts`);
  if (c.type !== "info" && c.type !== "profile" && c.type !== "goal_planner" && !c.source) add("source", "Câu hỏi có chấm điểm phải trích nguồn");
  if (c.type === "estimate" && !(c.min <= c.start && c.start <= c.max && c.min <= c.answer && c.answer <= c.max)) add("answer", "Giá trị bắt đầu và đáp án phải nằm giữa min và max");
  if (c.type === "select" || c.type === "scenario") {
    if (new Set(c.options).size !== c.options.length) add("options", "Các phương án phải khác nhau");
    if (c.explain.trim() === c.options[c.answer]?.trim()) add("explain", "Insight phải giải thích, không lặp lại đáp án");
  }
  if (c.type === "spot" && new Set(c.statements).size !== c.statements.length) add("statements", "Các nhận định phải khác nhau");
  if (c.type === "match") {
    const sorted = [...c.pairs].sort((a, b) => a - b);
    const ok = c.pairs.length === c.left.length && c.left.length === c.right.length && sorted.every((v, i) => v === i);
    if (!ok) add("pairs", "Mỗi ô bên trái phải nối với đúng một ô bên phải (số ô hai bên bằng nhau)");
  }
  return { data: issues.length ? undefined : c, issues };
}
