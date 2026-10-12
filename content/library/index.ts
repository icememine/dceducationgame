import { CATEGORIES, type CategoryId, type LibraryEntry } from "./types";
import { productEntries, productExcluded } from "./faq-products";
import { serviceEntries, serviceExcluded } from "./faq-services";

export { glossary } from "./glossary";
export * from "./types";

/** Every investor-facing Q&A, ordered by category as listed in CATEGORIES. */
export const library: LibraryEntry[] = (() => {
  const all = [...productEntries, ...serviceEntries];
  const order = Object.keys(CATEGORIES);
  return all.map((e, i) => ({ e, i })).sort((a, b) => order.indexOf(a.e.cat) - order.indexOf(b.e.cat) || a.i - b.i).map((x) => x.e);
})();

/** Source rows kept out of the library on purpose (internal notes, legacy products…). */
export const excluded = [...productExcluded, ...serviceExcluded].filter((x, i, all) => all.findIndex((y) => y.from === x.from) === i);

export const entriesIn = (cat: CategoryId) => library.filter((e) => e.cat === cat);

const words = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFC")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1);

/**
 * Keyword ranking for the help centre and as the retrieval step before Hỏi Rồng's model
 * call: matches on the question and its alternative phrasings count most.
 */
export function searchLibrary(query: string, limit = 5): LibraryEntry[] {
  const qw = new Set(words(query));
  if (!qw.size) return [];
  const hits = (s: string) => words(s).filter((w) => qw.has(w)).length;
  return library
    .map((e) => ({ e, score: Math.max(...[e.q, ...(e.alt ?? [])].map(hits)) * 2 + hits(e.a) * 0.3 }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.e);
}
