import { stageDcFunds } from "./stage-a-dc-funds";
import { stageKnowYourself } from "./stage-b-know-yourself";
import { stageKnowFunds } from "./stage-c-know-funds";
import type { OutlineLesson, OutlineStage } from "./types";

export * from "./types";
export { aiScenarios } from "./ai-scenarios";
export { advancedUnits } from "./advanced";

/** Recommended journey: Hiểu mình → Hiểu quỹ → Quỹ DC & DragonX. */
export const outline: OutlineStage[] = [stageKnowYourself, stageKnowFunds, stageDcFunds];

export const outlineLessons = (): (OutlineLesson & { stage: string; unit: string })[] =>
  outline.flatMap((s) => s.units.flatMap((u) => u.lessons.map((l) => ({ ...l, stage: s.code, unit: u.code }))));

/** FAQ question numbers that exist in the source document (17 and 20 are absent). */
export const FAQ_NUMBERS = Array.from({ length: 135 }, (_, i) => i + 1).filter((n) => n !== 17 && n !== 20);
