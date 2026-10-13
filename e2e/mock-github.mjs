/**
 * Minimal stand-in for the GitHub REST API, enough for the content editor's PR flow:
 * contents (read from this checkout), git refs, contents PUT and pulls. Records writes at
 * GET /__writes. Start: node e2e/mock-github.mjs [port] (default 3999); point the app at it
 * with GITHUB_API_URL=http://localhost:3999 GITHUB_TOKEN=test GITHUB_REPO=dc/academy.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const port = Number(process.argv[2] ?? 3999);
const root = process.cwd();
const writes = [];

const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (url.pathname === "/__writes") return send(res, 200, writes);
    const m = /^\/repos\/[^/]+\/[^/]+(\/.*)$/.exec(url.pathname);
    if (!m) return send(res, 404, { message: "not found" });
    const rest = decodeURIComponent(m[1]);
    if (req.method === "GET" && rest.startsWith("/contents/")) {
      const rel = rest.slice("/contents/".length);
      const abs = path.join(root, rel);
      if (!abs.startsWith(root)) return send(res, 400, {});
      let st; try { st = statSync(abs); } catch { return send(res, 404, { message: "Not Found" }); }
      if (st.isDirectory()) return send(res, 200, readdirSync(abs, { withFileTypes: true }).map((d) => ({ name: d.name, path: `${rel}/${d.name}`, type: d.isDirectory() ? "dir" : "file" })));
      return send(res, 200, { content: readFileSync(abs).toString("base64"), encoding: "base64", sha: `sha-${rel}` });
    }
    if (req.method === "GET" && rest.startsWith("/git/ref/heads/")) return send(res, 200, { object: { sha: "base-sha" } });
    if (req.method === "POST" && rest === "/git/refs") { writes.push({ kind: "ref", ...JSON.parse(body) }); return send(res, 201, {}); }
    if (req.method === "PUT" && rest.startsWith("/contents/")) {
      const b = JSON.parse(body);
      writes.push({ kind: "file", path: rest.slice("/contents/".length), branch: b.branch, sha: b.sha, message: b.message, text: Buffer.from(b.content, "base64").toString("utf8") });
      return send(res, 200, { content: {} });
    }
    if (req.method === "POST" && rest === "/pulls") { const b = JSON.parse(body); writes.push({ kind: "pr", ...b }); return send(res, 201, { html_url: "https://github.com/dc/academy/pull/1" }); }
    send(res, 404, { message: `unhandled ${req.method} ${rest}` });
  });
}).listen(port, () => console.log(`mock GitHub on :${port}`));
