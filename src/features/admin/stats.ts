import type { Challenge, Segment } from "@content/schema";
import { permutation } from "@/features/lesson-engine/shuffle";
import { GRADED_TYPES } from "./validate";

/** Pure aggregation for /admin/analytics. SQL lives in queries.ts; this joins rows to content. */

export type ChallengeLocation = {
  segmentId: string;
  segmentTitle: string;
  unitId: string;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  challenge: Challenge;
};

export function indexChallenges(all: Segment[]): Map<string, ChallengeLocation> {
  const map = new Map<string, ChallengeLocation>();
  for (const s of all)
    for (const u of s.units)
      for (const l of u.lessons)
        for (const c of l.challenges)
          map.set(c.id, { segmentId: s.id, segmentTitle: s.title, unitId: u.id, unitTitle: u.title, lessonId: l.id, lessonTitle: l.title, challenge: c });
  return map;
}

export const isGraded = (c: Challenge) => (GRADED_TYPES as readonly string[]).includes(c.type);

export type Filter = { segmentId?: string; unitId?: string };
const matches = (loc: { segmentId: string; unitId: string }, f: Filter) =>
  (!f.segmentId || loc.segmentId === f.segmentId) && (!f.unitId || loc.unitId === f.unitId);

/** Ratio in [0, 1], or null when there is nothing to divide by. */
export const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : null);

const perm = (c: { id: string }, n: number) => permutation(n, c.id);
const pick = <T,>(list: readonly T[], shown: unknown, p: number[]) => (typeof shown === "number" ? list[p[shown]] : undefined);

/**
 * Turns a stored answer (positions in the SHUFFLED lists the learner saw) back into the text of
 * what they picked, using the same deterministic shuffle as the lesson engine.
 */
export function answerText(c: Challenge, answer: unknown): string {
  const a = (answer ?? {}) as { choice?: unknown; pairs?: unknown; order?: unknown; value?: unknown };
  const fallback = JSON.stringify(answer);
  switch (c.type) {
    case "select":
    case "scenario":
      return pick(c.options, a.choice, perm(c, c.options.length)) ?? fallback;
    case "spot":
      return pick(c.statements, a.choice, perm(c, c.statements.length)) ?? fallback;
    case "profile":
      return typeof a.choice === "number" ? (c.options[a.choice] ?? fallback) : fallback;
    case "match": {
      if (!Array.isArray(a.pairs)) return fallback;
      const p = perm(c, c.right.length);
      return a.pairs.map((shown, i) => `${c.left[i]} → ${pick(c.right, shown, p) ?? "?"}`).join(" · ");
    }
    case "order": {
      if (!Array.isArray(a.order)) return fallback;
      const p = perm(c, c.items.length);
      return a.order.map((shown) => pick(c.items, shown, p) ?? "?").join(" → ");
    }
    case "numeric":
    case "estimate":
      return typeof a.value === "number" ? `${a.value.toLocaleString("vi-VN")} ${c.unit}` : fallback;
    default:
      return fallback;
  }
}

export type TotalsRow = { challengeId: string; attempts: number; learners: number };
export type FirstTryRow = { challengeId: string; tries: number; correct: number };
export type WrongAnswerRow = { challengeId: string; answer: unknown; n: number };

export type QuestionStat = ChallengeLocation & {
  attempts: number;
  learners: number;
  firstTries: number;
  firstCorrect: number;
  /** First attempt per learner, correct share; null without data. */
  firstTryAccuracy: number | null;
  topWrong?: { text: string; n: number; share: number };
  wrongTotal: number;
};

/**
 * One row per graded challenge that has attempts, sorted by lowest first-try accuracy
 * (ties: more learners first). Wrong answers that render to the same text are merged.
 */
export function buildQuestionStats(
  index: Map<string, ChallengeLocation>,
  totals: TotalsRow[],
  firsts: FirstTryRow[],
  wrongs: WrongAnswerRow[],
  filter: Filter = {},
): QuestionStat[] {
  const firstBy = new Map(firsts.map((r) => [r.challengeId, r]));
  const wrongBy = new Map<string, Map<string, number>>();
  for (const w of wrongs) {
    const loc = index.get(w.challengeId);
    if (!loc) continue;
    const text = answerText(loc.challenge, w.answer);
    const m = wrongBy.get(w.challengeId) ?? new Map<string, number>();
    m.set(text, (m.get(text) ?? 0) + w.n);
    wrongBy.set(w.challengeId, m);
  }

  const out: QuestionStat[] = [];
  for (const t of totals) {
    const loc = index.get(t.challengeId);
    if (!loc || !isGraded(loc.challenge) || !matches(loc, filter)) continue;
    const f = firstBy.get(t.challengeId);
    const w = wrongBy.get(t.challengeId);
    const wrongTotal = w ? [...w.values()].reduce((a, b) => a + b, 0) : 0;
    const top = w && [...w.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    out.push({
      ...loc,
      attempts: t.attempts,
      learners: t.learners,
      firstTries: f?.tries ?? 0,
      firstCorrect: f?.correct ?? 0,
      firstTryAccuracy: f ? ratio(f.correct, f.tries) : null,
      topWrong: top ? { text: top[0], n: top[1], share: top[1] / wrongTotal } : undefined,
      wrongTotal,
    });
  }
  const acc = (s: QuestionStat) => s.firstTryAccuracy ?? Number.POSITIVE_INFINITY;
  return out.sort((a, b) => acc(a) - acc(b) || b.learners - a.learners || a.challenge.id.localeCompare(b.challenge.id));
}

export type FunnelInputRow = { lessonId: string; started: number; completed: number; avgMistakes: number | null };
export type FunnelRow = {
  segmentId: string;
  unitId: string;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  started: number;
  completed: number;
  completionRate: number | null;
  avgMistakes: number | null;
};

/** Every lesson in content order (filtered), with its session counts (zero when unseen). */
export function buildFunnel(all: Segment[], rows: FunnelInputRow[], filter: Filter = {}): FunnelRow[] {
  const by = new Map(rows.map((r) => [r.lessonId, r]));
  const out: FunnelRow[] = [];
  for (const s of all)
    for (const u of s.units) {
      if (!matches({ segmentId: s.id, unitId: u.id }, filter)) continue;
      for (const l of u.lessons) {
        const r = by.get(l.id);
        out.push({
          segmentId: s.id,
          unitId: u.id,
          unitTitle: u.title,
          lessonId: l.id,
          lessonTitle: l.title,
          started: r?.started ?? 0,
          completed: r?.completed ?? 0,
          completionRate: r ? ratio(r.completed, r.started) : null,
          avgMistakes: r?.avgMistakes ?? null,
        });
      }
    }
  return out;
}

export const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
