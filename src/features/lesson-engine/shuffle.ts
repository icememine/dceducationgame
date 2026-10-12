/**
 * Deterministic shuffle keyed by challenge id. Server and client compute the same order,
 * so the browser only ever sees shuffled options plus positions — never the answer key —
 * and the server can map a submitted position back to the original index.
 */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns `perm` where perm[shownPosition] = originalIndex. Never the identity for n > 1. */
export function permutation(n: number, seed: string): number[] {
  const perm = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return perm;
  const rand = mulberry32(hash(seed));
  for (let attempt = 0; attempt < 8; attempt++) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    if (perm.some((v, i) => v !== i)) return perm;
  }
  return [...perm.slice(1), perm[0]];
}

export const applyPermutation = <T,>(items: readonly T[], perm: number[]) => perm.map((i) => items[i]);
