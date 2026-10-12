import type { Challenge, QuizPattern, SourceRef } from "@content/schema";
import type { Reaction } from "@/features/simulations/sims";

/** What the browser receives: answer keys, scores and explanations stripped. */
export type ClientChallenge =
  | { id: string; type: "info"; title: string; body: string; mascot?: string }
  | { id: string; type: "select"; pattern: QuizPattern; context: string; prompt: string; options: string[] }
  | { id: string; type: "scenario"; prompt: string; persona: { name: string; meta?: string }; says: string; options: string[] }
  | { id: string; type: "match"; prompt: string; left: string[]; right: string[] }
  | { id: string; type: "order"; prompt: string; items: string[] }
  | { id: string; type: "numeric"; context: string; prompt: string; unit: string; hint?: string }
  | { id: string; type: "estimate"; context: string; prompt: string; min: number; max: number; step: number; start: number; unit: string }
  | { id: string; type: "spot"; context: string; prompt: string; statements: string[] }
  | { id: string; type: "reaction_sim"; context: string }
  | { id: string; type: "timing_game"; context: string }
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
  | { type: "select" | "scenario" | "profile" | "spot"; choice: number }
  | { type: "match"; pairs: number[] }
  | { type: "order"; order: number[] }
  | { type: "numeric" | "estimate"; value: number }
  | { type: "reaction_sim"; reactions: Reaction[] }
  | { type: "timing_game"; picks: number[] }
  | { type: "goal_planner"; target: number; monthly: number; initial: number; annualReturn: number };

export type GradeResult = {
  /** null = ungraded item (info card, self-assessment, planner). */
  correct: boolean | null;
  correctAnswer?: string;
  /** Milestones shown after an estimate. */
  reveal?: { label: string; value: number }[];
  /** The INSIGHT: the principle to remember. */
  explain?: string;
  /** Only published sources (articles); internal documents are never shown. */
  source?: SourceRef & { title?: string };
};
