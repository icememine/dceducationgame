import { segment, type Lesson, type Segment, type Unit } from "./schema";
import { sourceById } from "./sources";
import { dcFunds } from "./segments/dc-funds";
import { myPlan } from "./segments/my-plan";
import { fundTypes } from "./segments/fund-types";

/** Display order on the segment picker: A → B → C. */
const raw = [dcFunds, myPlan, fundTypes];

export const segments: Segment[] = raw.map((s) => segment.parse(s));

export type LessonLocation = {
  segment: Segment;
  unit: Unit;
  lesson: Lesson;
  /** 0-based position of the lesson inside its segment's path. */
  index: number;
};

const lessonIndex = new Map<string, LessonLocation>();
for (const s of segments) {
  let index = 0;
  for (const u of s.units) for (const l of u.lessons) lessonIndex.set(l.id, { segment: s, unit: u, lesson: l, index: index++ });
}

export const getSegment = (id: string) => segments.find((s) => s.id === id);
export const findLesson = (lessonId: string) => lessonIndex.get(lessonId);
export const lessonsOf = (s: Segment) => s.units.flatMap((u) => u.lessons);

/**
 * Checks Zod can't express: unique IDs across all content, answer indexes in range,
 * match pairs forming a permutation, and every citation resolving to a known source.
 * Returns a list of problems; empty means the content is publishable.
 */
export function validateContent(all: Segment[] = segments): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const unique = (id: string, where: string) => {
    if (seen.has(id)) problems.push(`duplicate id "${id}" (${where})`);
    seen.add(id);
  };

  for (const s of all) {
    unique(s.id, "segment");
    for (const u of s.units) {
      unique(u.id, `unit in ${s.id}`);
      for (const l of u.lessons) {
        unique(l.id, `lesson in ${u.id}`);
        if (l.kind === "profile" && l.challenges.some((c) => c.type !== "profile" && c.type !== "info")) {
          problems.push(`${l.id}: profile lessons may only contain profile/info items`);
        }
        for (const c of l.challenges) {
          const at = `${l.id}/${c.id}`;
          unique(c.id, `challenge in ${l.id}`);
          if (c.source && !sourceById(c.source.sourceId)) problems.push(`${at}: unknown source "${c.source.sourceId}"`);
          if (c.type !== "info" && c.type !== "profile" && c.type !== "goal_planner" && !c.source) {
            problems.push(`${at}: graded questions must cite a source`);
          }
          if ((c.type === "select" || c.type === "scenario") && c.answer >= c.options.length) {
            problems.push(`${at}: answer index ${c.answer} out of range`);
          }
          if (c.type === "match") {
            const sorted = [...c.pairs].sort((a, b) => a - b);
            const ok = c.pairs.length === c.left.length && c.left.length === c.right.length && sorted.every((v, i) => v === i);
            if (!ok) problems.push(`${at}: pairs must be a permutation of right-hand indexes`);
          }
        }
      }
    }
  }
  return problems;
}
