import type { Challenge, QuizPattern, SourceRef } from "@content/schema";

/** What the browser receives: answer keys, scores and explanations stripped. */
export type ClientChallenge =
  | { id: string; type: "info"; title: string; body: string; mascot?: string }
  | { id: string; type: "select"; pattern: QuizPattern; context: string; prompt: string; options: string[] }
  | { id: string; type: "scenario"; prompt: string; persona: { name: string; meta?: string }; says: string; options: string[] }
  | { id: string; type: "match"; prompt: string; left: string[]; right: string[] }
  | { id: string; type: "order"; prompt: string; items: string[] }
  | { id: string; type: "numeric"; context: string; prompt: string; unit: string; hint?: string }
  | { id: string; type: "profile"; prompt: string; options: string[] }
  | {
      id: string;
      type: "goal_planner";
      prompt: string;
      goal: Extract<Challenge, { type: "goal_planner" }>["goal"];
      defaults: Extract<Challenge, { type: "goal_planner" }>["defaults"];
    };

/** Positions refer to the SHUFFLED lists the client was shown. */
export type Answer =
  | { type: "info" }
  | { type: "select" | "scenario" | "profile"; choice: number }
  | { type: "match"; pairs: number[] }
  | { type: "order"; order: number[] }
  | { type: "numeric"; value: number }
  | { type: "goal_planner"; target: number; monthly: number; initial: number; annualReturn: number };

export type GradeResult = {
  /** null = ungraded item (info card, self-assessment, planner). */
  correct: boolean | null;
  correctAnswer?: string;
  /** The INSIGHT: the principle to remember. */
  explain?: string;
  /** Only published sources (articles); internal documents are never shown. */
  source?: SourceRef & { title?: string };
};
