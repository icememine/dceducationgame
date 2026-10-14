import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { segments } from "@content/index";
import { challenge as challengeSchema } from "@content/schema";
import { changedFields, describeChanges, findChallenge, parseLiteral, patchChallenge, serialiseObject, serialiseValue, unifiedDiff, type Literal } from "./patch";

const root = path.resolve(__dirname, "../../../content/segments");
const unitFiles = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(path.join(root, d.name)).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => path.join(root, d.name, f)));
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");
const FILE = "dc-funds/a1-family.ts";

describe("parseLiteral", () => {
  it("reads the literal subset used by content files", () => {
    expect(parseLiteral(`{ a: 1_000_000, "b-c": [1, -2.5, 'x\\'y'], d: "q\\"\\n", e: true, // note\n f: null, }`)).toEqual({
      a: 1_000_000,
      "b-c": [1, -2.5, "x'y"],
      d: 'q"\n',
      e: true,
      f: null,
    });
  });
  it("rejects expressions", () => {
    expect(() => parseLiteral("{ a: foo }")).toThrow(/không hỗ trợ/);
  });
});

describe("serialiser", () => {
  it("keeps short arrays and scalar objects inline, breaks long arrays", () => {
    expect(serialiseValue(["a", "b"], "  ")).toBe('["a", "b"]');
    expect(serialiseValue({ sourceId: "faq", locator: "Câu 1" }, "  ")).toBe('{ sourceId: "faq", locator: "Câu 1" }');
    const long = ["x".repeat(80), "y".repeat(80)];
    expect(serialiseValue(long, "    ")).toBe(`[\n      "${long[0]}",\n      "${long[1]}",\n    ]`);
    expect(serialiseValue(2_600_000, "")).toBe("2_600_000");
    expect(serialiseValue('nói "không"', "")).toBe('"nói \\"không\\""');
     // Long text stays one string literal, wherever it starts on the line.
    const text = "Lãi kép ".repeat(40).trim();
    expect(serialiseValue(text, "          ", 19)).toBe(JSON.stringify(text));
  });
  it("serialises a whole object at the given indentation", () => {
    expect(serialiseObject({ id: "x", type: "info", title: "T", body: "B" }, "  ")).toBe('{\n    id: "x",\n    type: "info",\n    title: "T",\n    body: "B",\n  }');
  });
});

describe("findChallenge", () => {
  it("parses every literal challenge exactly as the content registry sees it", () => {
    const all = segments.flatMap((s) => s.units.flatMap((u) => u.lessons.flatMap((l) => l.challenges)));
    const texts = unitFiles.map((f) => readFileSync(f, "utf8"));
    let found = 0;
    for (const c of all) {
      for (const t of texts) {
        const span = findChallenge(t, c.id);
        if (!span) continue;
        found++;
        expect(challengeSchema.parse(span.value)).toEqual(c);
      }
    }
    // Generated items (risk questions) are not literals; everything else is.
    expect(found).toBeGreaterThan(all.length * 0.9);
  });
});

describe("patchChallenge", () => {
  it("replacing every challenge with itself leaves every unit file identical", () => {
    for (const f of unitFiles) {
      const text = readFileSync(f, "utf8");
      const ids = [...text.matchAll(/^\s+id: "([a-z0-9-]+)",\n\s+type: "/gm)].map((m) => m[1]);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        const span = findChallenge(text, id)!;
        expect(patchChallenge(text, id, span.value), `${path.basename(f)} / ${id}`).toBe(text);
      }
    }
  });

  it("an edited prompt changes only that challenge's prompt line", () => {
    const text = read(FILE);
    const span = findChallenge(text, "a2-dividend-nav")!;
    const out = patchChallenge(text, "a2-dividend-nav", { ...span.value, prompt: 'NAV/CCQ "sau" ngày chốt quyền?' });
    const a = text.split("\n");
    const b = out.split("\n");
    expect(b.length).toBe(a.length);
    const diff = a.map((l, i) => (l === b[i] ? -1 : i)).filter((i) => i >= 0);
    expect(diff).toHaveLength(1);
    expect(b[diff[0]]).toBe('          prompt: "NAV/CCQ \\"sau\\" ngày chốt quyền?",');
    expect(a[diff[0]]).toContain("Sau ngày chốt quyền");
    // Still a valid challenge after the round trip.
    expect(findChallenge(out, "a2-dividend-nav")!.value.prompt).toBe('NAV/CCQ "sau" ngày chốt quyền?');
    expect(challengeSchema.safeParse(findChallenge(out, "a2-dividend-nav")!.value).success).toBe(true);
    
  });

  it("removes and adds fields in canonical order with the file's indentation", () => {
    const text = read(FILE);
    const span = findChallenge(text, "a2-dividend-nav")!;
    const edited: { [k: string]: Literal } = { ...span.value, source: undefined, options: ["Vẫn 25.000 đồng", "23.700 đồng", "26.300 đồng", "x".repeat(150)] };
    const out = patchChallenge(text, "a2-dividend-nav", edited);
    const after = findChallenge(out, "a2-dividend-nav")!;
    expect(after.value.source).toBeUndefined();
    expect(after.value.options).toHaveLength(4);
    expect(out).toContain(`          options: [\n            "Vẫn 25.000 đồng",\n`);
    const readded = patchChallenge(out, "a2-dividend-nav", { ...after.value, source: { sourceId: "faq", locator: "Câu 106" } });
    expect(readded).toContain(`          explain: ${JSON.stringify(span.value.explain)},`);
    expect(readded).toMatch(/explain: ".*",\n {10}source: \{ sourceId: "faq", locator: "Câu 106" \},\n {8}\},/);
  });

  it("fails clearly when the id is not in the file", () => {
    expect(() => patchChallenge(read(FILE), "nope-not-here", { id: "nope-not-here" })).toThrow(/Không tìm thấy/);
  });
});

describe("diff and change summary", () => {
  it("produces a unified diff with context", () => {
    const before = ["a", "b", "c", "d", "e", "f", "g", "h"].join("\n");
    const after = ["a", "b", "c", "d", "E", "f", "g", "h"].join("\n");
    expect(unifiedDiff(before, after, "x.ts")).toBe("--- a/x.ts\n+++ b/x.ts\n@@ -2,7 +2,7 @@\n b\n c\n d\n-e\n+E\n f\n g\n h\n");
    expect(unifiedDiff(before, before, "x.ts")).toBe("");
  });
  it("lists changed fields", () => {
    const changes = changedFields({ id: "a", prompt: "x", answer: 1 }, { id: "a", prompt: "y", answer: 1, hint: "h" });
    expect(changes.map((c) => c.key)).toEqual(["prompt", "hint"]);
    expect(describeChanges(changes)).toBe('- `prompt`: "x" → "y"\n- `hint`: (không có) → "h"');
  });
});
