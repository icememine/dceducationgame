import { QUIZ_PATTERNS, type Challenge, type Segment } from "@content/schema";
import { sourceById } from "@content/sources";

/**
 * All lessons as one editable Markdown file, and back.
 *
 * Export: segment → unit → lesson → question, in path order, with the right answers marked.
 * Import: read the edited file, and for each lesson/question rebuild only the fields a writer
 * may change (texts, which option is right, estimate numbers). Ids, types and sources stay as
 * they are, so learner progress (which references ids) is never affected. Writing back to the
 * unit files is done by scripts/content-md.ts with the editor's format-preserving patcher.
 */

export const MD_HEADER = `<!--
  NỘI DUNG BÀI HỌC — file để sửa tay.
  Cách sửa:
  - Sửa chữ sau nhãn (Bối cảnh:, Câu hỏi:, Giải thích:, …) và các dòng phương án.
  - Đổi đáp án đúng: chuyển [x] sang phương án khác (đúng một [x] mỗi câu).
    Ở câu "Tìm câu sai", [x] đánh dấu câu SAI.
  - Nối cặp: mỗi dòng "trái → phải" là một cặp đúng. Sắp xếp: liệt kê theo đúng thứ tự.
  - Đổi tên bài: sửa chữ sau "Bài:", giữ nguyên phần {mã} ở cuối dòng.
  - KHÔNG sửa mã trong {…} hay sau "Câu", không thêm/xoá câu ở đây (mã gắn với tiến độ học viên).
  - Dòng bắt đầu bằng ">" chỉ để tham khảo (nguồn, loại câu), sửa cũng không có tác dụng.
  Giới hạn: Bối cảnh / Lời nói / Giải thích 20–320 ký tự; câu chọn đáp án có đúng 3 phương án.
  Áp dụng: npm run content:import -- <file> (xem trước) rồi thêm --write để ghi.
-->
`;

const TYPE_LABEL: Record<Challenge["type"], string> = {
  info: "Thẻ kiến thức",
  select: "Chọn đáp án",
  match: "Nối cặp",
  order: "Sắp xếp",
  numeric: "Tính nhanh",
  estimate: "Đoán số",
  spot: "Tìm câu sai",
  reaction_sim: "Mô phỏng ba phản ứng",
  timing_game: "Trò chơi Nhà tiên tri",
  scenario: "Tình huống",
  profile: "Tự đánh giá (không sửa ở đây)",
  goal_planner: "Lập kế hoạch (không sửa ở đây)",
};

/** Labels for editable text fields, per type, in display order. */
const FIELDS: Partial<Record<Challenge["type"], [key: string, label: string][]>> = {
  info: [["title", "Tiêu đề"], ["body", "Nội dung"]],
  select: [["context", "Bối cảnh"], ["prompt", "Câu hỏi"]],
  scenario: [["persona.name", "Nhân vật"], ["persona.meta", "Thông tin nhân vật"], ["says", "Lời nói"], ["prompt", "Câu hỏi"]],
  spot: [["context", "Bối cảnh"], ["prompt", "Câu hỏi"]],
  match: [["prompt", "Câu hỏi"]],
  order: [["prompt", "Câu hỏi"]],
  estimate: [["context", "Bối cảnh"], ["prompt", "Câu hỏi"]],
  numeric: [["context", "Bối cảnh"], ["prompt", "Câu hỏi"]],
  reaction_sim: [["context", "Bối cảnh"]],
  timing_game: [["context", "Bối cảnh"]],
};
const ALL_LABELS = ["Tiêu đề", "Nội dung", "Bối cảnh", "Câu hỏi", "Nhân vật", "Thông tin nhân vật", "Lời nói", "Giải thích", "Số liệu"];

const oneLine = (s: string) => s.replace(/\s*\n\s*/g, " ").trim();
const get = (c: Record<string, unknown>, path: string): unknown => path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), c);
const num = (n: number) => String(n);

function sourceLine(c: Challenge) {
  if (!c.source) return "";
  const s = sourceById(c.source.sourceId);
  return `> Nguồn: ${s?.title ?? c.source.sourceId}${c.source.locator ? ` · ${c.source.locator}` : ""}\n`;
}

function challengeMd(c: Challenge): string {
  const pattern = c.type === "select" ? ` · ${QUIZ_PATTERNS[c.pattern]}` : "";
  let out = `#### Câu ${c.id} · ${TYPE_LABEL[c.type]}${pattern}\n\n`;
  for (const [key, label] of FIELDS[c.type] ?? []) {
    const v = get(c as unknown as Record<string, unknown>, key);
    if (typeof v === "string") out += `${label}: ${oneLine(v)}\n\n`;
  }
  switch (c.type) {
    case "select":
    case "scenario":
      out += c.options.map((o, i) => `- [${i === c.answer ? "x" : " "}] ${oneLine(o)}`).join("\n") + "\n\n";
      break;
    case "spot":
      out += "> Đánh dấu [x] vào câu SAI.\n" + c.statements.map((o, i) => `- [${i === c.answer ? "x" : " "}] ${oneLine(o)}`).join("\n") + "\n\n";
      break;
    case "match":
      out += c.left.map((l, i) => `- ${oneLine(l)} → ${oneLine(c.right[c.pairs[i]])}`).join("\n") + "\n\n";
      break;
    case "order":
      out += c.items.map((it, i) => `${i + 1}. ${oneLine(it)}`).join("\n") + "\n\n";
      break;
    case "estimate":
      out += `Số liệu: nhỏ nhất=${num(c.min)}; lớn nhất=${num(c.max)}; bước=${num(c.step)}; bắt đầu=${num(c.start)}; đáp án=${num(c.answer)}; sai số=${num(c.tolerance)}; đơn vị=${c.unit}\n\n`;
      break;
    case "numeric":
      out += `Số liệu: đáp án=${num(c.answer)}; sai số=${num(c.tolerance)}; đơn vị=${c.unit}\n\n`;
      break;
    case "profile":
      out += c.options.map((o) => `- ${o}`).join("\n") + "\n\n> Câu tự đánh giá lấy từ mô hình rủi ro (content/risk/risk-model.ts), sửa ở đó.\n\n";
      break;
    case "goal_planner":
      out += `> ${c.prompt} · mục tiêu ${c.defaults.target.toLocaleString("vi-VN")}đ · góp ${c.defaults.monthly.toLocaleString("vi-VN")}đ/tháng · ${Math.round(c.defaults.annualReturn * 100)}%/năm\n\n`;
      break;
  }
  if (typeof c.explain === "string" && c.type !== "profile" && c.type !== "goal_planner") out += `Giải thích: ${oneLine(c.explain)}\n\n`;
  return out + sourceLine(c) + (c.source ? "\n" : "");
}

/** Short fingerprint of the exported lessons, stamped in the file so a stale copy is caught on import. */
export function contentStamp(segments: Segment[]): string {
  const body = exportContent(segments, "", false);
  let h = 2166136261;
  for (let i = 0; i < body.length; i++) h = Math.imul(h ^ body.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}

export const readStamp = (md: string) => /<!--\s*phiên bản nội dung:\s*([0-9a-f]{8})\s*-->/.exec(md)?.[1];

export function exportContent(segments: Segment[], header = MD_HEADER, stamp = true): string {
  let md = header + (stamp ? `<!-- phiên bản nội dung: ${contentStamp(segments)} -->\n` : "") + "\n";
  for (const s of segments) {
    md += `# ${s.title}\n\n`;
    for (const u of s.units) {
      md += `## ${u.title}\n\n`;
      for (const l of u.lessons) {
        const kind = l.kind === "checkpoint" ? " (kiểm tra)" : "";
        md += `### Bài: ${l.title} {${l.id}}${kind}\n\n`;
        for (const c of l.challenges) md += challengeMd(c);
      }
    }
  }
  return md.replace(/\n{3,}/g, "\n\n");
}

/* ---------- parsing ---------- */

export type ParsedChallenge = {
  id: string;
  line: number;
  fields: Record<string, string>;
  checklist: { checked: boolean; text: string }[];
  bullets: string[];
  numbered: string[];
};
export type Parsed = { lessons: { id: string; title: string; line: number }[]; challenges: ParsedChallenge[]; errors: string[] };

export function parseContent(md: string): Parsed {
  const out: Parsed = { lessons: [], challenges: [], errors: [] };
  const lines = md.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, "")).split("\n");
  let cur: ParsedChallenge | null = null;
  let field: string | null = null;
  const labelRe = new RegExp(`^(${ALL_LABELS.join("|")}):\\s*(.*)$`);
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const n = i + 1;
    const lesson = /^###\s+Bài:\s*(.*?)\s*\{([\w-]+)\}(?:\s*\(kiểm tra\))?\s*$/.exec(line);
    if (lesson) {
      out.lessons.push({ id: lesson[2], title: lesson[1].trim(), line: n });
      cur = null; field = null;
      return;
    }
    if (/^###\s+Bài:/.test(line)) { out.errors.push(`Dòng ${n}: thiếu mã bài dạng {mã} ở cuối dòng "Bài:"`); return; }
    const q = /^####\s+Câu\s+([\w-]+)\b/.exec(line);
    if (q) {
      cur = { id: q[1], line: n, fields: {}, checklist: [], bullets: [], numbered: [] };
      out.challenges.push(cur);
      field = null;
      return;
    }
    if (/^#{1,4}\s/.test(line)) { cur = null; field = null; return; }
    if (!cur) return;
    const c = cur as ParsedChallenge;
    if (line.trim() === "") { field = null; return; }
    if (line.startsWith(">")) { field = null; return; }
    const lab = labelRe.exec(line);
    if (lab) { field = lab[1]; c.fields[field] = lab[2].trim(); return; }
    const check = /^\s*[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (check) { c.checklist.push({ checked: check[1].toLowerCase() === "x", text: check[2].trim() }); field = null; return; }
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) { c.numbered.push(numbered[1].trim()); field = null; return; }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) { c.bullets.push(bullet[1].trim()); field = null; return; }
    // A wrapped continuation of the current field.
    if (field) c.fields[field] = `${c.fields[field]} ${line.trim()}`.trim();
  });
  return out;
}

type Obj = Record<string, unknown>;

/**
 * The challenge with the edited fields applied, or a list of problems. Only fields the Markdown
 * exposes are taken from it; everything else (id, type, pattern, source, …) comes from `orig`.
 */
export function applyEdits(orig: Obj, p: ParsedChallenge): { value?: Obj; problems: string[] } {
  const type = orig.type as Challenge["type"];
  const problems: string[] = [];
  const v: Obj = structuredClone(orig);
  const at = `Câu ${p.id} (dòng ${p.line})`;
  for (const [key, label] of FIELDS[type] ?? []) {
    const text = p.fields[label];
    if (text === undefined) {
      if (get(orig, key) !== undefined) problems.push(`${at}: thiếu "${label}:"`);
      continue;
    }
    if (key === "persona.name" || key === "persona.meta") {
      const persona = { ...(v.persona as Obj) };
      if (key === "persona.meta" && text === "") delete persona.meta;
      else persona[key.split(".")[1]] = text;
      v.persona = persona;
    } else v[key] = text;
  }
  if ("Giải thích" in p.fields) v.explain = p.fields["Giải thích"];
  else if (typeof orig.explain === "string" && type !== "profile" && type !== "goal_planner") problems.push(`${at}: thiếu "Giải thích:"`);

  if (type === "select" || type === "scenario" || type === "spot") {
    const marked = p.checklist.filter((x) => x.checked).length;
    if (marked !== 1) problems.push(`${at}: cần đúng một [x] (đang có ${marked})`);
    const list = p.checklist.map((x) => x.text);
    v[type === "spot" ? "statements" : "options"] = list;
    v.answer = p.checklist.findIndex((x) => x.checked);
  }
  if (type === "match") {
    const pairs = p.bullets.map((b) => b.split(/\s*(?:→|->)\s*/));
    if (pairs.some((x) => x.length !== 2 || !x[0] || !x[1])) problems.push(`${at}: mỗi dòng nối cặp cần dạng "trái → phải"`);
    else {
      const left = pairs.map((x) => x[0]);
      const rightInLeftOrder = pairs.map((x) => x[1]);
      const o = orig as { left: string[]; right: string[]; pairs: number[] };
      const same = left.length === o.left.length && left.every((l, i) => l === o.left[i] && rightInLeftOrder[i] === o.right[o.pairs[i]]);
      if (!same) {
        // Keep the original right-hand order where the texts still exist; the app shuffles anyway.
        const right = [...o.right.filter((r) => rightInLeftOrder.includes(r)), ...rightInLeftOrder.filter((r) => !o.right.includes(r))];
        v.left = left;
        v.right = right;
        v.pairs = rightInLeftOrder.map((r) => right.indexOf(r));
      }
    }
  }
  if (type === "order") {
    if (p.numbered.length < 2) problems.push(`${at}: cần ít nhất 2 bước đánh số`);
    v.items = p.numbered;
  }
  if (type === "estimate" || type === "numeric") {
    const raw = p.fields["Số liệu"];
    if (!raw) problems.push(`${at}: thiếu "Số liệu:"`);
    else {
      const kv = Object.fromEntries(raw.split(";").map((x) => x.split("=").map((s) => s.trim())).filter((x) => x.length === 2));
      const keys: [string, string][] = type === "estimate"
        ? [["nhỏ nhất", "min"], ["lớn nhất", "max"], ["bước", "step"], ["bắt đầu", "start"], ["đáp án", "answer"], ["sai số", "tolerance"]]
        : [["đáp án", "answer"], ["sai số", "tolerance"]];
      for (const [vi, key] of keys) {
        const n = Number(String(kv[vi] ?? "").replace(",", "."));
        if (kv[vi] === undefined || !Number.isFinite(n)) problems.push(`${at}: "Số liệu" thiếu hoặc sai "${vi}"`);
        else v[key] = n;
      }
      if (kv["đơn vị"] !== undefined) v.unit = kv["đơn vị"];
    }
  }
  return problems.length ? { problems } : { value: v, problems };
}
