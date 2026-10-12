/**
 * Builds prototype/rong-dc-academy.html (one self-contained file) from prototype/src plus
 * the live content: the Q&A library, glossary, fund facts, the risk self-check model, the AI rules
 * and the voice guide.
 * Edit content/ai/rong-voice.md or the library, then: npm run proto:build
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CATEGORIES, glossary, library } from "../content/library";
import { fundFactsText } from "../content/library/fund-facts-text";
import { BANDS, CONFIRMATION, DISCLAIMER, OVERRIDES, PROFILES, RISK_QUESTIONS, SECTIONS } from "../content/risk";
import { HARD_RULES } from "../src/features/ai/guardrails";

const src = (f: string) => readFileSync(`prototype/src/${f}`, "utf8");

const data = {
  ...JSON.parse(src("data.base.json")),
  lib: library.map((e) => ({ c: CATEGORIES[e.cat].title, q: e.q, alt: e.alt ?? [], a: e.a, from: e.from })),
  glossary: glossary.map((g) => `${g.term}${g.full ? ` (${g.full})` : ""}: ${g.def}`),
  fundFacts: fundFactsText(),
  rules: HARD_RULES,
  voice: readFileSync("content/ai/rong-voice.md", "utf8"),
  risk: { questions: RISK_QUESTIONS, bands: BANDS, overrides: OVERRIDES, profiles: PROFILES, sections: SECTIONS, confirmation: CONFIRMATION, disclaimer: DISCLAIMER },
};

const js = [1, 2, 3, 4].map((i) => src(`app${i}.js`)).join("\n");
// Escape "</" so the embedded JSON can't close the <script> tag.
const app = js.replace("__DATA__", () => JSON.stringify(data).replace(/<\//g, "<\\/"));
writeFileSync("prototype/rong-dc-academy.html", `${src("head.html")}\n<script>\n${app}\n</script>\n`);
console.log(`prototype/rong-dc-academy.html: ${data.lib.length} Q&As, ${Math.round(app.length / 1024)} KB of script`);
