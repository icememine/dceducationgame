"use server";

import { segments } from "@content/index";
import { assertAdmin } from "@/features/admin/auth";
import { githubConfig, loadUnitFile, openPullRequest } from "@/features/admin/content-files";
import { changedFields, describeChanges, findChallenge, patchChallenge, unifiedDiff, type Literal } from "@/features/admin/patch";
import { indexChallenges } from "@/features/admin/stats";
import { validateChallenge, type Issue } from "@/features/admin/validate";

export type ContentEditResult =
  | { ok: false; error: string; issues?: Issue[] }
  | { ok: true; mode: "pr"; url: string; branch: string; path: string; changes: string[] }
  | { ok: true; mode: "diff"; path: string; diff: string; fileText: string; changes: string[] };

/**
 * "Tạo bản sửa": validate the edited challenge with the real schema, patch exactly its object
 * literal in the unit file, then open a pull request (GitHub configured) or return a diff and
 * the patched file for download. Never writes to the local filesystem.
 */
export async function createContentEdit(challengeId: string, edited: unknown): Promise<ContentEditResult> {
  await assertAdmin();
  try {
    const loc = indexChallenges(segments).get(challengeId);
    if (!loc) return { ok: false, error: `Không có câu "${challengeId}" trong nội dung hiện tại` };
    if (!edited || typeof edited !== "object" || Array.isArray(edited)) return { ok: false, error: "Dữ liệu sửa không hợp lệ" };
    const obj = edited as { [key: string]: Literal };
    if (obj.id !== challengeId) return { ok: false, error: "Không được đổi mã câu (id): tiến độ học viên tham chiếu mã này" };
    if (obj.type !== loc.challenge.type) return { ok: false, error: "Không được đổi loại câu" };

    const { data, issues } = validateChallenge(obj);
    if (!data) return { ok: false, error: "Câu hỏi chưa hợp lệ", issues };

    const file = await loadUnitFile(challengeId, loc.segmentId);
    const original = findChallenge(file.text, challengeId)!.value;
    // Serialise the validated object (Zod output: known keys only) in the original key order.
    const clean = JSON.parse(JSON.stringify(data)) as { [key: string]: Literal };
    const changes = changedFields(original, clean);
    if (!changes.length) return { ok: false, error: "Chưa có thay đổi nào so với file gốc" };
    const text = patchChallenge(file.text, challengeId, clean);
    const changedKeys = changes.map((c) => c.key);

    const cfg = githubConfig();
    if (cfg) {
      const body = [
        `Sửa câu \`${challengeId}\` (${loc.segmentTitle} › ${loc.unitTitle} › ${loc.lessonTitle}) từ trình soạn thảo /admin/editor.`,
        "",
        `File: \`${file.path}\``,
        "",
        "Trường đã đổi:",
        describeChanges(changes),
        "",
        "Đã kiểm tra bằng schema Zod (content/schema.ts) trước khi tạo commit. CI chạy `npm run content:check`.",
      ].join("\n");
      const pr = await openPullRequest(cfg, { file, text, challengeId, body });
      return { ok: true, mode: "pr", url: pr.url, branch: pr.branch, path: file.path, changes: changedKeys };
    }
    return { ok: true, mode: "diff", path: file.path, diff: unifiedDiff(file.text, text, file.path), fileText: text, changes: changedKeys };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
