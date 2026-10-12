/**
 * Illustrative market simulations used by two lesson types. Deterministic (seeded), so the
 * server, the browser and the tests all see the same numbers. NOT real fund data: lessons
 * pair them with the real DCDS results from the AMDD articles.
 */

/* ---------- "Ba phản ứng khi quỹ giảm": 10 years, 3 drawdowns, a decision at each ---------- */

export const REACTION_MONTHS = 120;
export const REACTION_MONTHLY = 10_000_000;
/** Drawdowns: start month, months falling, depth. Recovery takes 1.8× the fall. */
export const DROPS = [
  { start: 16, len: 6, depth: 0.26 },
  { start: 50, len: 5, depth: 0.2 },
  { start: 84, len: 6, depth: 0.3 },
] as const;
const recoveryLen = (len: number) => Math.round(len * 1.8);

export const REACTIONS = {
  keep: "Tiếp tục góp đều",
  pause: "Tạm dừng góp, chờ hồi phục",
  sell: "Bán hết, khi nào hồi lại mới mua",
} as const;
export type Reaction = keyof typeof REACTIONS;

/** Monthly NAV/CCQ: ~13%/year drift, three drawdowns, a little noise. */
export const NAV: number[] = Array.from({ length: REACTION_MONTHS }, (_, m) => {
  let k = 1;
  for (const { start, len, depth } of DROPS) {
    const rec = recoveryLen(len);
    if (m >= start && m < start + len) k *= 1 - (depth * (m - start + 1)) / len;
    else if (m >= start + len && m < start + len + rec) k *= 1 - depth + (depth * (m - start - len + 1)) / rec;
  }
  return 10_000 * Math.pow(1.0105, m) * k * (1 + 0.012 * Math.sin(m * 1.7));
});

export const decisionMonth = (i: number) => DROPS[i].start + 3;
const recoverMonth = (i: number) => DROPS[i].start + DROPS[i].len + recoveryLen(DROPS[i].len);

/** Drop from the latest peak at the decision month of drawdown i (0.2 = −20%). */
export const dropAt = (i: number) => 1 - NAV[decisionMonth(i)] / Math.max(...NAV.slice(0, DROPS[i].start + 1));

/**
 * One reaction per drawdown. "pause" parks new money in cash (0.4%/month) until the fund
 * recovers; "sell" also sells the holding at the decision month and buys back on recovery.
 */
export function simulateReactions(choices: Reaction[]) {
  let units = 0;
  let cash = 0;
  for (let m = 0; m < REACTION_MONTHS; m++) {
    const p = NAV[m];
    cash *= 1.004;
    let waiting = false;
    choices.forEach((c, i) => {
      if (c === "keep") return;
      if (m === decisionMonth(i) && c === "sell") {
        cash += units * p;
        units = 0;
      }
      if (m >= decisionMonth(i) && m < recoverMonth(i)) waiting = true;
      if (m === recoverMonth(i)) {
        units += cash / p;
        cash = 0;
      }
    });
    if (waiting) cash += REACTION_MONTHLY;
    else units += REACTION_MONTHLY / p;
  }
  return { value: units * NAV[REACTION_MONTHS - 1] + cash, invested: REACTION_MONTHLY * REACTION_MONTHS };
}

/* ---------- "Nhà tiên tri": buy once a month, seeing prices one day at a time ---------- */

export const TIMING_ROUNDS = 5;
export const TIMING_DAYS = 20;
export const TIMING_AMOUNT = 10_000_000;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** NAV/CCQ for each of the 20 trading days of round `round`. */
export function monthPrices(round: number): number[] {
  const r = rng(9871 + round * 131);
  const p = [10_000 * Math.pow(1.012, round * 3)];
  for (let d = 1; d < TIMING_DAYS; d++) p.push(p[d - 1] * (1 + (r() - 0.48) * 0.035));
  return p;
}

/** Units bought with the learner's picks vs. always buying on day 1 vs. always at the low. */
export function scoreTiming(picks: number[]) {
  let mine = 0;
  let dayOne = 0;
  let oracle = 0;
  picks.forEach((d, round) => {
    const p = monthPrices(round);
    mine += TIMING_AMOUNT / p[d];
    dayOne += TIMING_AMOUNT / p[0];
    oracle += TIMING_AMOUNT / Math.min(...p);
  });
  return { mine, dayOne, oracle, vsDayOne: mine / dayOne - 1, oracleVsDayOne: oracle / dayOne - 1 };
}
