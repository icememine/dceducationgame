// CI gate for content PRs: `npm run content:check`
import { segments, validateContent } from "../content";

const problems = validateContent();
const lessons = segments.flatMap((s) => s.units.flatMap((u) => u.lessons));
const challenges = lessons.flatMap((l) => l.challenges);

console.log(`${segments.length} segments · ${lessons.length} lessons · ${challenges.length} challenges`);
if (problems.length) {
  console.error(problems.map((p) => `  ✗ ${p}`).join("\n"));
  process.exit(1);
}
console.log("content OK");
