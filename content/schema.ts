import { z } from "zod";

/**
 * Content model. Lessons live in git as typed TS files (content-as-code), so every
 * wording change goes through a pull request: that history is the compliance audit
 * trail. IDs are stable strings — progress rows reference them, so never reuse or
 * renumber an ID once it has shipped.
 */

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "kebab-case id");

export const sourceRef = z.object({
  sourceId: z.string(),
  /** Section / question number inside the source, e.g. "Câu 10". */
  locator: z.string().optional(),
});

const base = {
  id,
  /** Shown after the learner answers (or under an info card). */
  explain: z.string().optional(),
  source: sourceRef.optional(),
};

export const infoCard = z.object({
  ...base,
  type: z.literal("info"),
  title: z.string(),
  body: z.string(),
  mascot: z.string().optional(),
});

/**
 * Every graded question follows the house quiz formula (docs/QUIZ_FORMULA.md):
 * CONTEXT (a situation or a striking number, 1–2 sentences) → QUESTION (one question about
 * a cause, a result or a decision) → 3 OPTIONS (one right, two built on common
 * misconceptions) → INSIGHT (`explain`: the financial principle to remember, 1–2 sentences).
 */
export const quizPattern = z.enum(["prediction", "why", "misconception", "decision"]);

export const QUIZ_PATTERNS: Record<z.infer<typeof quizPattern>, string> = {
  prediction: "Dự đoán",
  why: "Vì sao?",
  misconception: "Hiểu lầm phổ biến",
  decision: "Ra quyết định",
};

/** Limits that keep context and insight to "1–2 câu". */
export const QUIZ_TEXT_MAX = 320;

const insight = z.string().min(20).max(QUIZ_TEXT_MAX);
const context = z.string().min(20).max(QUIZ_TEXT_MAX);

export const selectChallenge = z.object({
  ...base,
  type: z.literal("select"),
  pattern: quizPattern,
  context,
  prompt: z.string(),
  options: z.array(z.string()).length(3),
  answer: z.number().int().min(0).max(2),
  explain: insight,
});

export const matchChallenge = z.object({
  ...base,
  type: z.literal("match"),
  prompt: z.string(),
  left: z.array(z.string()).min(2),
  right: z.array(z.string()).min(2),
  /** pairs[i] = index in `right` that matches left[i]. */
  pairs: z.array(z.number().int().nonnegative()),
});

export const orderChallenge = z.object({
  ...base,
  type: z.literal("order"),
  prompt: z.string(),
  /** Items in the CORRECT order; the player shuffles them. */
  items: z.array(z.string()).min(2),
});

/** "Đoán số": a prediction answered with a number. Keep the arithmetic to one easy step. */
export const numericChallenge = z.object({
  ...base,
  type: z.literal("numeric"),
  context,
  prompt: z.string(),
  explain: insight,
  answer: z.number(),
  tolerance: z.number().nonnegative(),
  unit: z.string(),
  hint: z.string().optional(),
});

/**
 * "Đoán số": a prediction on a slider. Ungraded (no heart lost): a close guess earns
 * "Chính xác!", a far one shows the real number. `reveal` lists the milestones shown after.
 */
export const estimateChallenge = z.object({
  ...base,
  type: z.literal("estimate"),
  context,
  prompt: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
  start: z.number(),
  unit: z.string(),
  answer: z.number(),
  /** Relative tolerance, e.g. 0.25 = within 25% counts as close. */
  tolerance: z.number().min(0).max(1),
  reveal: z.array(z.object({ label: z.string(), value: z.number() })).optional(),
  explain: insight,
});

/** "Tìm câu sai": someone explains a topic in three statements; the learner taps the wrong one. */
export const spotChallenge = z.object({
  ...base,
  type: z.literal("spot"),
  context,
  prompt: z.string(),
  statements: z.array(z.string()).length(3),
  /** Index of the WRONG statement. */
  answer: z.number().int().min(0).max(2),
  explain: insight,
});

/**
 * Interactive simulations (src/features/simulations). Ungraded: the learner plays, then reads
 * the insight. `context` sets the scene before the simulation starts.
 *  - reaction_sim: "Ba phản ứng khi quỹ giảm", decide keep/pause/sell at three drawdowns.
 *  - timing_game:  "Nhà tiên tri", try to buy at the month's low seeing one day at a time.
 */
export const reactionSimChallenge = z.object({ ...base, type: z.literal("reaction_sim"), context, explain: insight });
export const timingGameChallenge = z.object({ ...base, type: z.literal("timing_game"), context, explain: insight });

export const scenarioChallenge = z.object({
  ...base,
  type: z.literal("scenario"),
  prompt: z.string(),
  persona: z.object({ name: z.string(), meta: z.string().optional() }),
  /** What the persona says: the scenario's CONTEXT. */
  says: context,
  options: z.array(z.string()).length(3),
  answer: z.number().int().min(0).max(2),
  explain: insight,
});

/**
 * Self-assessment item: no right answer. Options are labels only; what each answer means
 * (willingness level or limit) lives in content/risk/risk-model.ts, keyed by the item id.
 */
export const profileChallenge = z.object({
  ...base,
  type: z.literal("profile"),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
});

export const goalKind = z.enum(["first-billion", "education", "retirement", "emergency", "custom"]);

/** Interactive planner: learner enters numbers, we show the projection and store the goal. */
export const goalPlannerChallenge = z.object({
  ...base,
  type: z.literal("goal_planner"),
  prompt: z.string(),
  goal: goalKind,
  defaults: z.object({
    target: z.number().positive(),
    monthly: z.number().nonnegative(),
    initial: z.number().nonnegative(),
    annualReturn: z.number().min(0).max(0.3),
  }),
});

export const challenge = z.discriminatedUnion("type", [
  infoCard,
  selectChallenge,
  matchChallenge,
  orderChallenge,
  numericChallenge,
  estimateChallenge,
  spotChallenge,
  reactionSimChallenge,
  timingGameChallenge,
  scenarioChallenge,
  profileChallenge,
  goalPlannerChallenge,
]);

export const lesson = z.object({
  id,
  title: z.string(),
  /** standard = graded; profile = self-assessment (never costs hearts); checkpoint = unit test. */
  kind: z.enum(["standard", "profile", "checkpoint"]).default("standard"),
  xp: z.number().int().positive().default(15),
  minutes: z.number().int().positive().default(3),
  challenges: z.array(challenge).min(1),
});

export const unit = z.object({
  id,
  title: z.string(),
  description: z.string(),
  color: z.enum(["jade", "sky", "gold", "coral", "violet"]),
  mascot: z.string(),
  lessons: z.array(lesson).min(1),
});

export const segment = z.object({
  id,
  code: z.string().max(4),
  title: z.string(),
  subtitle: z.string(),
  /** Segment B is self-assessment: wrong answers do not exist, so hearts are off. */
  heartsEnabled: z.boolean(),
  units: z.array(unit).min(1),
});

export const source = z.object({
  id: z.string(),
  title: z.string(),
  file: z.string(),
  /** Date the facts were last checked against official documents. */
  asOf: z.string(),
  url: z.string().url().optional(),
  /** Internal documents are kept for the audit trail but never cited to the learner. */
  internal: z.boolean().optional(),
});

export type SourceRef = z.infer<typeof sourceRef>;
export type Challenge = z.infer<typeof challenge>;
export type ChallengeInput = z.input<typeof challenge>;
export type Lesson = z.infer<typeof lesson>;
export type LessonInput = z.input<typeof lesson>;
export type Unit = z.infer<typeof unit>;
export type Segment = z.infer<typeof segment>;
export type SegmentInput = z.input<typeof segment>;
export type UnitInput = z.input<typeof unit>;
export type Source = z.infer<typeof source>;
export type QuizPattern = z.infer<typeof quizPattern>;
export type GoalKind = z.infer<typeof goalKind>;
