import type { Challenge } from "@content/schema";
import { sourceById } from "@content/sources";
import { applyPermutation, permutation } from "./shuffle";
import type { Answer, ClientChallenge, GradeResult } from "./types";

const permFor = (c: { id: string }, n: number, salt = "") => permutation(n, c.id + salt);

export function toClientChallenge(c: Challenge): ClientChallenge {
  switch (c.type) {
    case "info":
      return { id: c.id, type: c.type, title: c.title, body: c.body, mascot: c.mascot };
    case "select":
      return { id: c.id, type: c.type, prompt: c.prompt, context: c.context, options: applyPermutation(c.options, permFor(c, c.options.length)) };
    case "scenario":
      return { id: c.id, type: c.type, prompt: c.prompt, persona: c.persona, says: c.says, options: applyPermutation(c.options, permFor(c, c.options.length)) };
    case "true_false":
      return { id: c.id, type: c.type, prompt: c.prompt };
    case "match":
      return { id: c.id, type: c.type, prompt: c.prompt, left: c.left, right: applyPermutation(c.right, permFor(c, c.right.length)) };
    case "order":
      return { id: c.id, type: c.type, prompt: c.prompt, items: applyPermutation(c.items, permFor(c, c.items.length)) };
    case "numeric":
      return { id: c.id, type: c.type, prompt: c.prompt, context: c.context, unit: c.unit, hint: c.hint };
    case "profile":
      // Self-assessment options keep their authored order (low → high reads naturally).
      return { id: c.id, type: c.type, prompt: c.prompt, dimension: c.dimension, options: c.options.map((o) => o.label) };
    case "goal_planner":
      return { id: c.id, type: c.type, prompt: c.prompt, goal: c.goal, defaults: c.defaults };
  }
}

const fmt = (n: number) => n.toLocaleString("vi-VN");

/** Server-side grading. The client never decides correctness, so XP can't be forged. */
export function grade(c: Challenge, a: Answer): GradeResult {
  const src = c.source ? { ...c.source, title: sourceById(c.source.sourceId)?.title } : undefined;
  const base = { explain: c.explain, source: src };
  if (a.type !== c.type && !(a.type === "info" && c.type === "info")) {
    throw new Error(`answer type ${a.type} does not match challenge ${c.id} (${c.type})`);
  }

  switch (c.type) {
    case "info":
    case "goal_planner":
      return { ...base, correct: null };
    case "profile": {
      const choice = (a as Extract<Answer, { choice: number }>).choice;
      const opt = c.options[choice];
      if (!opt) throw new Error(`choice ${choice} out of range for ${c.id}`);
      const max = Math.max(...c.options.map((o) => o.score));
      return { ...base, correct: null, profileScore: { dimension: c.dimension, score: opt.score, max } };
    }
    case "select":
    case "scenario": {
      const perm = permFor(c, c.options.length);
      const original = perm[(a as Extract<Answer, { choice: number }>).choice];
      return { ...base, correct: original === c.answer, correctAnswer: c.options[c.answer] };
    }
    case "true_false":
      return { ...base, correct: (a as Extract<Answer, { type: "true_false" }>).value === c.answer, correctAnswer: c.answer ? "Đúng" : "Sai" };
    case "match": {
      const perm = permFor(c, c.right.length);
      const pairs = (a as Extract<Answer, { type: "match" }>).pairs;
      const correct = pairs.length === c.pairs.length && pairs.every((shown, i) => perm[shown] === c.pairs[i]);
      return { ...base, correct, correctAnswer: c.left.map((l, i) => `${l} → ${c.right[c.pairs[i]]}`).join(" · ") };
    }
    case "order": {
      const perm = permFor(c, c.items.length);
      const order = (a as Extract<Answer, { type: "order" }>).order;
      const correct = order.length === c.items.length && order.every((shown, i) => perm[shown] === i);
      return { ...base, correct, correctAnswer: c.items.join(" → ") };
    }
    case "numeric": {
      const v = (a as Extract<Answer, { type: "numeric" }>).value;
      return { ...base, correct: Number.isFinite(v) && Math.abs(v - c.answer) <= c.tolerance, correctAnswer: `${fmt(c.answer)} ${c.unit}` };
    }
  }
}

/** Accepts Vietnamese ("126,05" or "23.700") and English ("126.05") number input. */
export function parseLocaleNumber(input: string): number {
  const s = input.replace(/\s/g, "");
  if (!s) return NaN;
  // "23.700" / "1.000.000" → thousands separators; "126,05" → decimal comma.
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) return Number(s.replace(/\./g, "").replace(",", "."));
  return Number(s.replace(",", "."));
}
