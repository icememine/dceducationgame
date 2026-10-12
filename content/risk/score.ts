import {
  BANDS,
  OVERRIDES,
  PROFILE_IDS,
  PROFILES,
  RISK_QUESTIONS,
  SPECIAL_CASES,
  type ProfileId,
  type ProfileInfo,
  type SectionId,
  type SpecialCase,
} from "./risk-model";

/** questionId → index of the chosen option (authored order). */
export type RiskChoices = Record<string, number>;

export type RiskResult = {
  /** §4.1: sum of the answered questions (7–30 when all are answered). */
  total: number;
  sections: Record<SectionId, number>;
  /** §4.2: profile from the total alone. */
  scored: ProfileId;
  /** After override rules ① and ②: the profile the learner is asked to confirm. */
  profile: ProfileId;
  /** Overrides that changed the profile, with the reason shown to the learner. */
  overrides: { rule: "horizon" | "knowledge"; reason: string }[];
  /** ③: when set, the learner must tick the acknowledgement to confirm. */
  capacityWarning?: string;
  /** ④: when set, the learner is asked to check questions 3 and 4 again. */
  inconsistency?: string;
};

export type RiskDecision = "agree" | "lower" | "higher";

const level = (p: ProfileId) => PROFILE_IDS.indexOf(p);
const points = (id: string, choices: RiskChoices) => {
  const q = RISK_QUESTIONS.find((x) => x.id === id);
  const i = choices[id];
  return q && i !== undefined ? q.options[i]?.points : undefined;
};

export function scoreRisk(choices: RiskChoices): RiskResult {
  const sections: Record<SectionId, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of RISK_QUESTIONS) sections[q.section] += points(q.id, choices) ?? 0;
  const total = sections.A + sections.B + sections.C + sections.D;
  const scored = (BANDS.find((b) => total >= b.min && total <= b.max) ?? (total < BANDS[0].min ? BANDS[0] : BANDS[BANDS.length - 1])).profile;

  let profile = scored;
  const overrides: RiskResult["overrides"] = [];
  const h = OVERRIDES.horizon;
  if ((points(h.question, choices) ?? Infinity) <= h.atMost && level(profile) > level(h.maxProfile)) {
    profile = h.maxProfile;
    overrides.push({ rule: "horizon", reason: h.reason });
  }
  const k = OVERRIDES.knowledge;
  if ((points(k.question, choices) ?? Infinity) <= k.atMost && level(profile) > level(k.startAt)) {
    profile = k.startAt;
    overrides.push({ rule: "knowledge", reason: k.reason });
  }

  const c = OVERRIDES.capacity;
  const capacityWarning = (points(c.question, choices) ?? Infinity) <= c.atMost && total >= c.totalAtLeast ? c.warning : undefined;
  const n = OVERRIDES.inconsistency;
  const inconsistency =
    (points(n.lowQuestion, choices) ?? Infinity) <= n.lowAtMost && (points(n.highQuestion, choices) ?? -Infinity) >= n.highAtLeast ? n.message : undefined;

  return { total, sections, scored, profile, overrides, ...(capacityWarning && { capacityWarning }), ...(inconsistency && { inconsistency }) };
}

/** §5.1: agree keeps the profile; lower/higher move one step (within the scale). */
export function applyDecision(profile: ProfileId, decision: RiskDecision): ProfileId {
  const i = level(profile) + (decision === "lower" ? -1 : decision === "higher" ? 1 : 0);
  return PROFILE_IDS[Math.max(0, Math.min(PROFILE_IDS.length - 1, i))];
}

/** Whether the learner must tick the acknowledgement before this decision is accepted. */
export const needsAcknowledgement = (result: RiskResult, decision: RiskDecision) => decision === "higher" || (!!result.capacityWarning && decision !== "lower");

/** §5.2 special cases on the confirmed profile, stored for Compliance. */
export function specialCases(result: RiskResult, final: ProfileId, decision: RiskDecision, choices: RiskChoices): SpecialCase[] {
  const risky = level(final) >= level("kha-mao-hiem");
  const flags: SpecialCase[] = [];
  if (risky && (points(OVERRIDES.knowledge.question, choices) ?? 0) <= OVERRIDES.knowledge.atMost) flags.push("first-time-high-risk");
  if ((points("b1-q-horizon", choices) ?? 5) <= 2 && result.sections.B >= SPECIAL_CASES.toleranceHighAtLeast) flags.push("short-horizon-high-tolerance");
  if (result.inconsistency) flags.push("inconsistency");
  if (risky && result.sections.C <= SPECIAL_CASES.capacityLowAtMost) flags.push("low-capacity-high-risk");
  if (decision === "higher") flags.push("chose-higher");
  return flags;
}

export const profileInfo = (id: string): ProfileInfo | undefined => PROFILES.find((p) => p.id === id);
