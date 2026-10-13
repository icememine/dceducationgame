"use client";

import { Component, useState, type ReactNode } from "react";
import type { Challenge } from "@content/schema";
import { sourceById } from "@content/sources";
import {
  EstimateView, GoalPlannerView, InfoView, MatchView, NumericView, OrderView, ProfileView, ScenarioView, SelectView, SpotView, type Draft,
} from "@/features/lesson-engine/challenge-views";
import { toClientChallenge } from "@/features/lesson-engine/grade";
import { ReactionSimView, TimingGameView } from "@/features/simulations/sim-views";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p className="text-sm text-muted">Chưa xem trước được: hãy điền đủ các trường bắt buộc.</p> : this.props.children;
  }
}

function correctAnswer(c: Challenge): string | null {
  switch (c.type) {
    case "select":
    case "scenario":
      return c.options[c.answer] ?? null;
    case "spot":
      return `Câu sai: ${c.statements[c.answer] ?? "?"}`;
    case "match":
      return c.left.map((l, i) => `${l} → ${c.right[c.pairs[i]] ?? "?"}`).join(" · ");
    case "order":
      return c.items.join(" → ");
    case "numeric":
    case "estimate":
      return `${c.answer.toLocaleString("vi-VN")} ${c.unit}`;
    default:
      return null;
  }
}

/** The learner's view, rendered with the lesson player's own components (options shuffled as learners see them). */
export function ChallengePreview({ challenge }: { challenge: Record<string, unknown> }) {
  const [draft, setDraft] = useState<Draft>({});
  const c = challenge as Challenge;
  let view: ReactNode;
  try {
    const cc = toClientChallenge(c);
    const p = { draft, setDraft, locked: false };
    view = (
      <>
        {cc.type === "info" && <InfoView c={cc} />}
        {cc.type === "select" && <SelectView c={cc} {...p} />}
        {cc.type === "scenario" && <ScenarioView c={cc} {...p} />}
        {cc.type === "match" && <MatchView c={cc} {...p} />}
        {cc.type === "order" && <OrderView c={cc} {...p} />}
        {cc.type === "numeric" && <NumericView c={cc} {...p} />}
        {cc.type === "estimate" && <EstimateView c={cc} {...p} />}
        {cc.type === "spot" && <SpotView c={cc} {...p} />}
        {cc.type === "reaction_sim" && <ReactionSimView c={cc} {...p} />}
        {cc.type === "timing_game" && <TimingGameView c={cc} {...p} />}
        {cc.type === "profile" && <ProfileView c={cc} {...p} />}
        {cc.type === "goal_planner" && <GoalPlannerView c={cc} {...p} />}
      </>
    );
  } catch {
    view = <p className="text-sm text-muted">Chưa xem trước được: hãy điền đủ các trường bắt buộc.</p>;
  }
  let answer: string | null = null;
  try {
    answer = correctAnswer(c);
  } catch {
    answer = null;
  }
  const src = c.source?.sourceId ? sourceById(c.source.sourceId) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 rounded-3xl border-4 border-ink/10 bg-surface p-5">
        {/* Reset the boundary and the learner draft whenever the content changes shape. */}
        <Boundary key={JSON.stringify(challenge)}>{view}</Boundary>
      </div>
      <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-sky-soft p-4 text-sm">
        {answer && <p><b>Đáp án:</b> {answer}</p>}
        {typeof c.explain === "string" && c.explain && <p className="mt-1"><b>Insight:</b> {c.explain}</p>}
        {c.source && (
          <p className="mt-1 text-xs text-muted">
            Nguồn: {src?.title ?? c.source.sourceId}{c.source.locator ? ` · ${c.source.locator}` : ""}
            {src && "internal" in src && src.internal ? " (nội bộ: học viên không thấy dòng này)" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
