/**
 * Validates ONE unit file on its own, so several writers can work in parallel:
 *   npx tsx scripts/check-unit.ts content/segments/my-plan/b6-market.ts
 * Checks the schema (quiz formula limits included), validateContent() rules, known sources,
 * and that no id clashes with any OTHER unit already in the content.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { segments, validateContent } from "../content/index";
import { segment, unit as unitSchema, type Segment } from "../content/schema";

const file = process.argv[2];
if (!file) throw new Error("usage: tsx scripts/check-unit.ts <unit file>");
async function main() {
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const parsed = unitSchema.safeParse(mod.unit);
  if (!parsed.success) {
    console.error(`✗ ${file}: schema errors`);
    for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
    process.exit(1);
  }
  const u = parsed.data;
  const probe = segment.parse({ id: "probe", code: "P", title: "probe", subtitle: "", heartsEnabled: true, units: [u] }) as Segment;
  const problems = validateContent([probe]);

  const ids = new Set([u.id, ...u.lessons.flatMap((l) => [l.id, ...l.challenges.map((c) => c.id)])]);
  for (const s of segments)
    for (const other of s.units) {
      if (other.id === u.id) continue;
      for (const id of [other.id, ...other.lessons.flatMap((l) => [l.id, ...l.challenges.map((c) => c.id)])]) if (ids.has(id)) problems.push(`id "${id}" already used in unit ${other.id}`);
    }

  if (problems.length) {
    console.error(`✗ ${file}`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  const items = u.lessons.reduce((n, l) => n + l.challenges.length, 0);
  console.log(`✓ ${file}: ${u.lessons.length} lessons, ${items} items`);
}

main();
