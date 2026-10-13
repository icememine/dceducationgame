import "server-only";
import { findChallenge } from "./patch";

/**
 * Where unit files are read from, and where edits go:
 *  - GITHUB_TOKEN + GITHUB_REPO (+ GITHUB_BASE): read from the base branch, write as a pull request.
 *  - otherwise: read the local checkout (dev); the editor only offers a diff and a download.
 * Nothing here ever writes to the local filesystem.
 */
const SEGMENTS_DIR = "content/segments";

export type GitHubConfig = { token: string; repo: string; base: string };

export function githubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, base: process.env.GITHUB_BASE || "main" };
}

export type UnitFile = { path: string; text: string; sha?: string };

async function gh<T>(cfg: GitHubConfig, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${cfg.repo}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub ${init.method ?? "GET"} ${path}: ${res.status} ${detail.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

type GhEntry = { name: string; path: string; type: string };
type GhFile = { content: string; encoding: string; sha: string };

const enc = encodeURIComponent;
const contentsPath = (p: string) => p.split("/").map(enc).join("/");

const ordered = (dirs: string[], segmentId?: string) => [...dirs].sort((a, b) => Number(b.endsWith(`/${segmentId}`)) - Number(a.endsWith(`/${segmentId}`)));
const isUnitFile = (name: string) => name.endsWith(".ts") && name !== "index.ts" && !name.endsWith(".test.ts");

async function findOnGitHub(cfg: GitHubConfig, challengeId: string, segmentId?: string): Promise<UnitFile | null> {
  const ref = `?ref=${enc(cfg.base)}`;
  const top = await gh<GhEntry[]>(cfg, `/contents/${contentsPath(SEGMENTS_DIR)}${ref}`);
  const dirs = ordered(top.filter((e) => e.type === "dir").map((e) => e.path), segmentId);
  const search = async (entries: GhEntry[]) => {
    for (const f of entries.filter((e) => e.type === "file" && isUnitFile(e.name))) {
      const file = await gh<GhFile>(cfg, `/contents/${contentsPath(f.path)}${ref}`);
      const text = Buffer.from(file.content, "base64").toString("utf8");
      if (findChallenge(text, challengeId)) return { path: f.path, text, sha: file.sha };
    }
    return null;
  };
  // The segment's own folder first; stop as soon as the challenge is found.
  for (const d of dirs) {
    const hit = await search(await gh<GhEntry[]>(cfg, `/contents/${contentsPath(d)}${ref}`));
    if (hit) return hit;
  }
  return search(top);
}

async function findLocally(challengeId: string, segmentId?: string): Promise<UnitFile | null> {
  const { readdir, readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.join(process.cwd(), SEGMENTS_DIR);
  const top = await readdir(root, { withFileTypes: true }).catch(() => {
    throw new Error("Không đọc được thư mục content/segments trên máy chủ này. Hãy cấu hình GITHUB_TOKEN, GITHUB_REPO, GITHUB_BASE.");
  });
  const dirs = ordered(top.filter((d) => d.isDirectory()).map((d) => `${SEGMENTS_DIR}/${d.name}`), segmentId);
  const candidates = top.filter((d) => d.isFile() && isUnitFile(d.name)).map((d) => `${SEGMENTS_DIR}/${d.name}`);
  for (const d of dirs) {
    const names = await readdir(path.join(process.cwd(), d));
    candidates.push(...names.filter(isUnitFile).map((n) => `${d}/${n}`));
  }
  for (const rel of candidates) {
    const text = await readFile(path.join(process.cwd(), rel), "utf8");
    if (findChallenge(text, challengeId)) return { path: rel, text };
  }
  return null;
}

/** The unit file whose text contains the challenge's object literal. */
export async function loadUnitFile(challengeId: string, segmentId?: string): Promise<UnitFile> {
  const cfg = githubConfig();
  const file = cfg ? await findOnGitHub(cfg, challengeId, segmentId) : await findLocally(challengeId, segmentId);
  if (!file) throw new Error(`Không tìm thấy câu "${challengeId}" dưới dạng object literal trong ${SEGMENTS_DIR} (câu sinh tự động thì sửa trực tiếp trong mã nguồn).`);
  return file;
}

/** Branch → commit → pull request. Returns the PR's web URL. */
export async function openPullRequest(
  cfg: GitHubConfig,
  args: { file: UnitFile; text: string; challengeId: string; body: string },
): Promise<{ url: string; branch: string }> {
  if (!args.file.sha) throw new Error("Thiếu sha của file gốc");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*$/, "").replace("T", "-");
  const branch = `content/${args.challengeId}-${stamp}`;
  const baseRef = await gh<{ object: { sha: string } }>(cfg, `/git/ref/heads/${contentsPath(cfg.base)}`);
  await gh(cfg, "/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseRef.object.sha }) });
  await gh(cfg, `/contents/${contentsPath(args.file.path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Nội dung: sửa ${args.challengeId}`,
      content: Buffer.from(args.text, "utf8").toString("base64"),
      sha: args.file.sha,
      branch,
    }),
  });
  const pr = await gh<{ html_url: string }>(cfg, "/pulls", {
    method: "POST",
    body: JSON.stringify({ title: `Nội dung: sửa ${args.challengeId}`, head: branch, base: cfg.base, body: args.body }),
  });
  return { url: pr.html_url, branch };
}
