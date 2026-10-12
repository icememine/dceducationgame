// Regenerates docs/CURRICULUM.md and docs/program.json from content/outline.
// Run after editing the outline: `npm run docs:curriculum`.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { aiScenarios, FAQ_NUMBERS, FORMATS, outline, outlineLessons, TOOLS, type SourceRef } from "../content/outline";
import { sourceById } from "../content/sources";

const root = path.join(__dirname, "..");
const lessons = outlineLessons();

const srcLabel = (r: SourceRef) => (r.startsWith("faq:") ? `FAQ ${r.slice(4)}` : (sourceById(r)?.title ?? r));
const srcShort = (refs: SourceRef[]) => {
  const faq = refs.filter((r) => r.startsWith("faq:")).map((r) => r.slice(4));
  const other = refs.filter((r) => !r.startsWith("faq:")).map(srcLabel);
  return [...other, ...(faq.length ? [`FAQ ${faq.join(", ")}`] : [])].join(" · ");
};
const esc = (s: string) => s.replace(/\|/g, "\\|");

const out: string[] = [];
const count = (c: string) => lessons.filter((l) => l.stage === c).length;
out.push(
  "# Chương trình học Rồng DC Academy",
  "",
  "> Tài liệu này được sinh tự động từ `content/outline/`. Sửa ở đó rồi chạy `npm run docs:curriculum`.",
  "",
  `**${outline.length} chặng · ${outline.reduce((s, x) => s + x.units.length, 0)} phần · ${lessons.length} bài · ${aiScenarios.length} tình huống luyện AI.** ` +
    `${lessons.filter((l) => l.builtAs).length} bài đã có bản chơi được (✅).`,
  "",
  "## Triết lý",
  "",
  "Hiểu mình → Hiểu quỹ → Hiểu quỹ DC. Nhà đầu tư bắt đầu từ chính tình hình tài chính, khẩu vị rủi ro và mục tiêu của mình;",
  "sau đó học loại quỹ nào làm việc gì; cuối cùng áp dụng vào sản phẩm Dragon Capital và giao dịch an toàn trên DragonX.",
  "",
  "| Chặng | Vai trò | Phần | Bài |",
  "|---|---|---|---|",
  ...outline.map((s) => `| ${s.order}. ${s.title} (${s.code}) | ${esc(s.role)} | ${s.units.length} | ${count(s.code)} |`),
  "",
  "### Dạng bài",
  "",
  "| Dạng | Mô tả | Số bài dùng |",
  "|---|---|---|",
  ...Object.entries(FORMATS).map(([k, v]) => `| \`${k}\` | ${v} | ${lessons.filter((l) => l.formats.includes(k as never)).length} |`),
  "",
  "### Công cụ tương tác dùng lại",
  "",
  "| Công cụ | Dùng trong bài |",
  "|---|---|",
  ...Object.entries(TOOLS).map(([k, v]) => `| ${v} (\`${k}\`) | ${lessons.filter((l) => l.tool === k).map((l) => l.code).join(", ") || "—"} |`),
  "",
);

for (const s of outline) {
  out.push(`## Chặng ${s.order} · ${s.title} (${s.code})`, "", `*${s.subtitle}*`, "", s.role, "");
  for (const u of s.units) {
    out.push(`### ${u.code} · ${u.title}`, "", `${u.why} Linh vật: \`${u.mascot}\`.`, "");
    out.push("| Bài | Mục tiêu | Dạng | Nguồn |", "|---|---|---|---|");
    for (const l of u.lessons) {
      out.push(
        `| **${l.code}** ${esc(l.title)}${l.builtAs ? " ✅" : ""} | ${esc(l.goal)}${l.tool ? ` *Công cụ: ${TOOLS[l.tool]}.*` : ""} | ${l.formats.map((f) => FORMATS[f]).join(", ")} | ${esc(srcShort(l.sources))} |`,
      );
    }
    const withFacts = u.lessons.filter((l) => l.facts?.length);
    if (withFacts.length) {
      out.push("", "<details><summary>Số liệu và ý chính cần dạy</summary>", "");
      for (const l of withFacts) out.push(`- **${l.code}**: ${l.facts!.join("; ")}`);
      out.push("", "</details>");
    }
    out.push("");
  }
  if (s.askRongOnly?.length) out.push(`Câu hỏi FAQ chỉ trả lời qua Hỏi Rồng (không làm bài): ${s.askRongOnly.join(", ")}.`, "");
}

out.push("## Tình huống luyện AI", "", "| Tình huống | AI đóng vai | Mở khóa sau | Chế độ |", "|---|---|---|---|");
for (const a of aiScenarios) out.push(`| ${esc(a.title)} | ${esc(a.persona)} | ${a.unlockAfter} | ${a.mode === "staff" ? "Chuyên viên" : "Nhà đầu tư"} |`);
out.push("", "Chi tiết lời mở đầu, tiêu chí chấm và cờ đỏ: `content/outline/ai-scenarios.ts`. Thiết kế tính năng: `docs/FEATURES.md`.", "");

out.push("## Bản đồ 133 câu hỏi FAQ", "", "| FAQ | Bài |", "|---|---|");
for (const n of FAQ_NUMBERS) {
  const where = lessons.filter((l) => l.sources.includes(`faq:${n}`)).map((l) => l.code);
  const rong = outline.some((s) => s.askRongOnly?.includes(n));
  out.push(`| ${n} | ${where.join(", ") || (rong ? "Hỏi Rồng" : "—")} |`);
}
out.push("");

out.push(
  "## Hướng dẫn viết bài",
  "",
  "1. Chọn một bài trong dàn ý chưa có ✅. Viết vào `content/segments/<chặng>.ts`, dùng id mới dạng kebab-case.",
  "2. Mỗi bài 3–6 câu, khoảng 3 phút; mở đầu bằng thẻ kiến thức hoặc câu chuyện khi giới thiệu khái niệm mới; chọn tư thế linh vật theo ý nghĩa.",
  "3. Dạy đúng các số liệu trong mục \"Số liệu và ý chính\" và trích nguồn `source: { sourceId, locator }` cho mọi câu có chấm điểm.",
  "4. Dùng `numeric` cho mọi công thức (kèm gợi ý công thức), `scenario` cho tình huống thật (FIFO, lừa đảo, mua khi giảm).",
  "5. Không hứa hay ngụ ý lợi nhuận; mọi lợi nhuận dự phóng ghi rõ \"giả định\". Không hard-code phí, giờ chốt lệnh hay NAV.",
  "6. Đặt `builtAs` cho bài trong `content/outline/`, chạy `npm run content:check && npm test && npm run docs:curriculum`, rồi mở PR để Compliance duyệt.",
  "",
);

writeFileSync(path.join(root, "docs", "CURRICULUM.md"), out.join("\n"));

// Compact JSON for the shareable program page.
const sources = Object.fromEntries(
  [...new Set(lessons.flatMap((l) => l.sources).concat(aiScenarios.flatMap((a) => a.sources)))].map((r) => [r, srcLabel(r)]),
);
writeFileSync(path.join(root, "docs", "program.json"), JSON.stringify({ outline, aiScenarios, formats: FORMATS, tools: TOOLS, sources }, null, 0));
console.log(`wrote docs/CURRICULUM.md (${lessons.length} lessons) and docs/program.json`);
