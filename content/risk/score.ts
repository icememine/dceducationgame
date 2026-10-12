import { DEFAULT_LEVEL, PROFILE_IDS, PROFILES, RISK_NOTES, RISK_QUESTIONS, type Level, type ProfileId, type ProfileInfo } from "./risk-model";

/** questionId → index of the chosen option (authored order). */
export type RiskChoices = Record<string, number>;

export type RiskResult = {
  profile: ProfileId;
  /** What the learner said they are willing to take, before any limit. */
  willing: ProfileId;
  /** Limits that pulled the result below `willing`, lowest first, with the reason shown to the learner. */
  reasons: { questionId: string; cap: ProfileId; reason: string }[];
  /** Contradictions worth pointing out; they do not change the result. */
  notes: string[];
};

const pick = (questionId: string, choices: RiskChoices) => {
  const q = RISK_QUESTIONS.find((x) => x.id === questionId);
  const i = choices[questionId];
  return q && i !== undefined ? q.options[i] : undefined;
};

export function scoreRisk(choices: RiskChoices): RiskResult {
  let sum = 0;
  let weights = 0;
  for (const q of RISK_QUESTIONS) {
    const level = pick(q.id, choices)?.level;
    if (q.kind !== "willingness" || level === undefined) continue;
    sum += level * (q.weight ?? 1);
    weights += q.weight ?? 1;
  }
  const willing = (weights ? Math.round(sum / weights) : DEFAULT_LEVEL) as Level;

  const limits = RISK_QUESTIONS.flatMap((q) => {
    const o = pick(q.id, choices);
    return o?.cap !== undefined && o.cap < willing ? [{ questionId: q.id, cap: o.cap, reason: o.reason ?? "" }] : [];
  }).sort((a, b) => a.cap - b.cap);
  const final = (limits[0]?.cap ?? willing) as Level;

  const notes = RISK_NOTES.filter((n) => {
    const high = pick(n.high, choices)?.level;
    const low = pick(n.low, choices)?.level;
    return high !== undefined && low !== undefined && high - low >= n.gap;
  }).map((n) => n.note);

  return {
    profile: PROFILE_IDS[final],
    willing: PROFILE_IDS[willing],
    reasons: limits.map((l) => ({ questionId: l.questionId, cap: PROFILE_IDS[l.cap], reason: l.reason })),
    notes,
  };
}

export const profileInfo = (id: ProfileId): ProfileInfo => PROFILES.find((p) => p.id === id)!;
