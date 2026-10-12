import { describe, expect, it } from "vitest";
import { findLesson } from "../index";
import { FAQ_NUMBERS } from "../outline";
import { FEES, LIMITS, netProceeds, SELL_EXAMPLE } from "./fund-facts";
import { CATEGORIES, excluded, glossary, library, searchLibrary } from "./index";

const vnd = (n: number) => n.toLocaleString("vi-VN");
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe("Q&A library", () => {
  it("has unique ids and known categories, each category filled", () => {
    const ids = library.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of library) expect(CATEGORIES).toHaveProperty(e.cat);
    for (const cat of Object.keys(CATEGORIES)) expect(library.some((e) => e.cat === cat), cat).toBe(true);
  });

  it("accounts for every source row: merged into an entry or excluded with a reason", () => {
    const used = new Set<string>([...library.flatMap((e) => e.from), ...excluded.map((x) => x.from)]);
    const all = [...FAQ_NUMBERS.map((n) => `faq:${n}`), ...range(114).map((n) => `is:${n}`), ...range(49).map((n) => `etf:${n}`)];
    expect(all.filter((o) => !used.has(o))).toEqual([]);
    for (const x of excluded) expect(x.reason.length).toBeGreaterThan(5);
  });

  it("speaks to investors: no source lines, staff notes or chat fillers", () => {
    const bad = /Nguồn\s*:|\(CS |Báo team|hình bên dưới|(^|\s)(ạ|nhé)([.,!?\s]|$)|FAQ \d/u;
    for (const e of [...library.map((x) => x.q + "\n" + x.a), ...glossary.map((g) => g.def)]) expect(e).not.toMatch(bad);
  });

  it("finds the concrete fee answer for the question investors actually ask", () => {
    const top = searchLibrary("bán quỹ sau 2 năm mất phí và thuế gì")[0];
    expect(top?.cat).toBe("bieu-phi-thue");
    expect(top?.a).toMatch(/0,1%/);
  });
});

describe("fund facts used in lessons", () => {
  it("keeps the worked redemption consistent", () => {
    const { gross, pit, sellFee, transferFee, net, units, nav } = SELL_EXAMPLE;
    expect(Math.round(units * nav)).toBe(gross);
    expect(netProceeds(gross, FEES.sellFeeExample.rate, transferFee)).toEqual({ pit, fee: sellFee, net });
  });

  it("quotes the same numbers in segment A as in fund-facts", () => {
    const text = (lesson: string, id: string) => {
      const c = findLesson(lesson)!.lesson.challenges.find((x) => x.id === id)!;
      return JSON.stringify(c);
    };
    const sale = text("a3-order-basics", "a3-estimate-vs-actual");
    for (const n of [SELL_EXAMPLE.gross, SELL_EXAMPLE.net, SELL_EXAMPLE.sellFee, SELL_EXAMPLE.transferFee]) expect(sale).toContain(vnd(n));
    const twoYears = text("a3-order-basics", "a3-sell-after-2y");
    expect(twoYears).toContain(vnd(FEES.transferFee.under500m) + "đ");
    expect(twoYears).toContain(vnd(FEES.transferFee.from500m) + "đ");
    expect(twoYears).toContain(`${FEES.pitOnSale * 100}`.replace(".", ",") + "%");
    expect(LIMITS.minBuy).toBe(100_000);
  });
});
