import type { Challenge, Segment } from "@content/schema";

/**
 * "Kiểm tra xếp lớp" (FEATURES.md 1.5): one question per unit, taken from the unit's checkpoint
 * when it has one (otherwise its last lesson), so the test asks what the unit is meant to teach.
 * Passing units in a row from the start opens every lesson up to the first unit missed.
 * Questions are shown once, no retries; the test never marks lessons as done or awards their XP.
 */
export const PLACEMENT_MAX = 10;
const PREFERRED = ["select", "scenario", "spot"] as const;

export type PlacementItem = { unitId: string; challenge: Challenge };

export function placementItems(segment: Segment): PlacementItem[] {
  const out: PlacementItem[] = [];
  for (const u of segment.units) {
    const lessons = [...u.lessons].reverse();
    const source = lessons.find((l) => l.kind === "checkpoint") ?? lessons.find((l) => l.kind !== "profile");
    const pick = source?.challenges.find((c) => (PREFERRED as readonly string[]).includes(c.type));
    if (pick) out.push({ unitId: u.id, challenge: pick });
    if (out.length === PLACEMENT_MAX) break;
  }
  return out;
}

export type PlacementResult = { unitId: string; correct: boolean };

/**
 * Index (in the segment's lesson order) up to which lessons open: the first lesson of the
 * first unit answered wrongly, or the end of the segment if every unit was passed.
 */
export function unlockIndexFor(segment: Segment, results: PlacementResult[]): number {
  let index = 0;
  for (const u of segment.units) {
    const r = results.find((x) => x.unitId === u.id);
    if (!r || !r.correct) return index;
    index += u.lessons.length;
  }
  return index;
}
