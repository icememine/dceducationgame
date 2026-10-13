/**
 * Builds prototype/rong-dc-academy.html (one self-contained file) from prototype/src plus
 * the live content: the lesson outline and every playable lesson (converted from content/segments),
 * the AI practice scenarios, the Q&A library, glossary, fund facts, the risk self-check model, the
 * AI rules and the voice guide.
 * Edit content/ai/rong-voice.md or the library, then: npm run proto:build
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CATEGORIES, glossary, library } from "../content/library";
import { fundFactsText } from "../content/library/fund-facts-text";
import { BANDS, CONFIRMATION, DISCLAIMER, OVERRIDES, PROFILES, RISK_QUESTIONS, SECTIONS } from "../content/risk";
import { HARD_RULES } from "../src/features/ai/guardrails";
import { findLesson } from "../content";
import { aiScenarios, outline } from "../content/outline";
import type { Challenge, Lesson } from "../content/schema";
import { sourceById } from "../content/sources";

/** Source title shown under the insight; internal documents are never shown to investors. */
const srcTitle = (c: Challenge) => {
  const s = c.source && sourceById(c.source.sourceId);
  return s && !("internal" in s && s.internal) ? s.title : undefined;
};

/** One app challenge → the prototype's item shape (prototype/src/app3.js renders these). */
function protoItem(c: Challenge): Record<string, unknown> | undefined {
  const src = srcTitle(c);
  switch (c.type) {
    case "info":
      return { type: "story", mood: c.mascot ?? "study", title: c.title, body: c.body, src };
    case "select":
      return { type: "select", pattern: c.pattern, context: c.context, prompt: c.prompt, options: c.options, answer: c.answer, explain: c.explain, src };
    case "estimate":
      return { type: "estimate", pattern: "prediction", context: c.context, prompt: c.prompt, min: c.min, max: c.max, step: c.step, start: c.start, unit: c.unit, answer: c.answer, tol: c.tolerance, rows: c.reveal, explain: c.explain, src };
    case "match":
      return { type: "match", kind: "Nối cặp", prompt: c.prompt, left: c.left, right: c.right, pairs: c.pairs, explain: c.explain, src };
    case "order":
      return { type: "order", kind: "Sắp xếp", prompt: c.prompt, items: c.items, explain: c.explain, src };
    case "spot":
      return { type: "spot", kind: "Tìm câu sai", context: c.context, prompt: c.prompt, sentences: c.statements, answer: c.answer, explain: c.explain, src };
    case "scenario":
      return { type: "scenario", kind: "Tình huống", prompt: c.prompt, who: c.persona.name, meta: c.persona.meta ?? "", says: c.says, options: c.options, answer: c.answer, explain: c.explain, src };
    case "goal_planner":
      return { type: "story", mood: "grow", title: c.prompt, tool: "planner", src,
        body: `Thử với số của bạn trong Công cụ › Lập kế hoạch. Gợi ý ban đầu: mục tiêu ${c.defaults.target / 1e6} triệu, góp ${c.defaults.monthly / 1e6} triệu/tháng, lợi nhuận giả định ${Math.round(c.defaults.annualReturn * 100)}%/năm.` };
    case "reaction_sim":
      return { type: "decision", kind: "Ra quyết định" };
    case "timing_game":
      return { type: "game", kind: "Trò chơi dữ liệu" };
    default:
      return undefined; // numeric, profile: the prototype keeps its own risk check
  }
}

/** Every outline lesson that has a playable lesson in the app, keyed by the app lesson id. */
const lessons: Record<string, unknown> = {};
const lessonByCode: Record<string, string> = {};
for (const st of outline)
  for (const u of st.units)
    for (const l of u.lessons) {
      const found = l.builtAs ? findLesson(l.builtAs) : undefined;
      if (!found) continue;
      const lesson: Lesson = found.lesson;
      lessonByCode[l.code] = lesson.id;
      if (lessons[lesson.id]) continue;
      const items = lesson.challenges.map(protoItem).filter(Boolean);
      if (!items.length) continue;
      lessons[lesson.id] = { title: lesson.title, code: l.code, stage: st.code, xp: lesson.xp, items };
    }

const src = (f: string) => readFileSync(`prototype/src/${f}`, "utf8");

const data = {
  ...JSON.parse(src("data.base.json")),
  outline: outline.map((st) => ({
    code: st.code, title: st.title, subtitle: st.subtitle,
    units: st.units.map((u) => ({ code: u.code, title: u.title, why: u.why, mascot: u.mascot, lessons: u.lessons.map((l) => ({ code: l.code, title: l.title, goal: l.goal })) })),
  })),
  scen: aiScenarios,
  lessons,
  lessonByCode,
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
console.log(`prototype/rong-dc-academy.html: ${Object.keys(lessons).length} lessons, ${data.lib.length} Q&As, ${Math.round(app.length / 1024)} KB of script`);
