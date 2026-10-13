/**
 * Lessons ⇄ one Markdown file, for writers who prefer to edit text rather than code.
 *
 *   npm run content:export [-- docs/NOI-DUNG-BAI-HOC.md]     write every lesson and question
 *   npm run content:import -- <file.md>                       preview: problems + diff, writes nothing
 *   npm run content:import -- <file.md> --write               apply to content/segments/**, then check
 *
 * Only lesson titles and question texts/answers change; ids, types and sources stay. Edits are
 * applied with the admin editor's format-preserving patcher, validated with the same rules.
 */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { findLesson, segments } from "../content";
import { changedFields, findChallenge, patchChallenge, unifiedDiff, type Literal } from "../src/features/admin/patch";
import { validateChallenge } from "../src/features/admin/validate";
import { applyEdits, contentStamp, exportContent, parseContent, readStamp } from "../src/features/content-md/markdown";

const DEFAULT_OUT = "docs/NOI-DUNG-BAI-HOC.md";
const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const [cmd, file, ...flags] = process.argv.slice(2);

function unitFiles(dir = "content/segments"): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? unitFiles(p) : n.endsWith(".ts") && n !== "index.ts" ? [p] : [];
  });
}

if (cmd === "export") {
  const out = file ?? DEFAULT_OUT;
  const md = exportContent(segments);
  writeFileSync(out, md);
  const lessons = segments.reduce((n, s) => n + s.units.reduce((m, u) => m + u.lessons.length, 0), 0);
  const questions = segments.reduce((n, s) => n + s.units.reduce((m, u) => m + u.lessons.reduce((k, l) => k + l.challenges.length, 0), 0), 0);
  console.log(`wrote ${out}: ${lessons} lessons, ${questions} questions, ${Math.round(md.length / 1024)} KB`);
} else if (cmd === "import" && file) {
  const write = flags.includes("--write");
  const source = readFileSync(file, "utf8");
  const stamp = readStamp(source);
  if (stamp !== contentStamp(segments) && !flags.includes("--force")) {
    console.error(
      stamp
        ? "Nội dung trong mã đã thay đổi kể từ khi xuất file này, nên nhập lại có thể xoá các sửa đổi mới hơn.\n" +
            "Hãy chạy npm run content:export để lấy bản mới, chép các chỗ bạn sửa sang đó rồi nhập lại.\n" +
            "(Nếu chắc chắn muốn ghi đè, thêm --force.)"
        : "File không có dòng \"phiên bản nội dung\" (không phải file xuất bằng npm run content:export). Thêm --force nếu vẫn muốn nhập.",
    );
    process.exit(1);
  }
  const parsed = parseContent(source);
  const problems = [...parsed.errors];
  const texts = new Map<string, string>(unitFiles().map((f) => [f, readFileSync(f, "utf8")]));
  const fileOf = (id: string) => [...texts.entries()].find(([, t]) => findChallenge(t, id))?.[0];
  const log: string[] = [];

  for (const l of parsed.lessons) {
    const loc = findLesson(l.id);
    if (!loc) { problems.push(`Dòng ${l.line}: không có bài {${l.id}}`); continue; }
    if (loc.lesson.title === l.title) continue;
    if (!l.title) { problems.push(`Dòng ${l.line}: tên bài trống`); continue; }
    // Lesson objects hold their challenges, so change just the title line that follows the id.
    const re = new RegExp(`(id:\\s*"${l.id}",\\s*\\n\\s*title:\\s*)${escapeRe(JSON.stringify(loc.lesson.title))}`);
    const f = [...texts.keys()].find((k) => re.test(texts.get(k)!));
    if (!f) { problems.push(`Dòng ${l.line}: không sửa được tên bài {${l.id}} trong file`); continue; }
    texts.set(f, texts.get(f)!.replace(re, (_m, head: string) => head + JSON.stringify(l.title)));
    log.push(`bài ${l.id}: tên "${loc.lesson.title}" → "${l.title}"`);
  }

  for (const p of parsed.challenges) {
    const loc = segments.flatMap((s) => s.units.flatMap((u) => u.lessons)).flatMap((ls) => ls.challenges).find((c) => c.id === p.id);
    if (!loc) { problems.push(`Dòng ${p.line}: không có câu ${p.id}`); continue; }
    if (loc.type === "profile" || loc.type === "goal_planner") continue;
    const { value, problems: ps } = applyEdits(loc as never, p);
    if (!value) { problems.push(...ps); continue; }
    const changes = changedFields(loc as never, value as never);
    if (!changes.length) continue;
    const { issues } = validateChallenge(value);
    if (issues.length) { problems.push(...issues.map((i) => `Câu ${p.id} (dòng ${p.line}): ${i.path || "câu"}: ${i.message}`)); continue; }
    const f = fileOf(p.id);
    const span = f && findChallenge(texts.get(f)!, p.id);
    if (!f || !span) { problems.push(`Câu ${p.id}: không tìm thấy trong file nội dung (câu sinh tự động)`); continue; }
    const merged: Record<string, Literal> = { ...span.value };
    for (const c of changes) merged[c.key] = c.after;
    texts.set(f, patchChallenge(texts.get(f)!, p.id, merged));
    log.push(`câu ${p.id}: ${changes.map((c) => c.key).join(", ")}`);
  }

  const changedFiles = [...texts.entries()].filter(([f, t]) => t !== readFileSync(f, "utf8"));
  console.log(log.length ? `Thay đổi (${log.length}):\n  ${log.join("\n  ")}` : "Không có thay đổi nào.");
  if (problems.length) {
    console.error(`\nCần sửa trước (${problems.length}):\n  ${problems.join("\n  ")}`);
    console.error("\nChưa ghi gì. Sửa các lỗi trên trong file Markdown rồi chạy lại.");
    process.exit(1);
  }
  if (!write) {
    for (const [f, t] of changedFiles) console.log("\n" + unifiedDiff(readFileSync(f, "utf8"), t, f));
    if (changedFiles.length) console.log("\nXem trước xong. Thêm --write để ghi vào file nội dung.");
  } else if (changedFiles.length) {
    for (const [f, t] of changedFiles) writeFileSync(f, t);
    console.log(`\nĐã ghi ${changedFiles.length} file. Kiểm tra nội dung…`);
    const r = spawnSync("npx", ["tsx", "scripts/check-content.ts"], { stdio: "inherit" });
    process.exit(r.status ?? 1);
  }
} else {
  console.error("Dùng: content-md.ts export [file.md] | import <file.md> [--write]");
  process.exit(2);
}
