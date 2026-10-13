import { describe, expect, it } from "vitest";
import { segment, type Segment } from "@content/schema";
import { toClientChallenge } from "@/features/lesson-engine/grade";
import { answerText, buildFunnel, buildQuestionStats, indexChallenges, pct, ratio } from "./stats";

const src = { sourceId: "faq" };
const ctx = "Một nhà đầu tư góp đều mỗi tháng trong ba năm liền.";
const insight = "Lãi kép bắt đầu ngay khi lợi nhuận được tái đầu tư.";
const fixture: Segment = segment.parse({
  id: "s1",
  code: "S",
  title: "Seg",
  subtitle: "",
  heartsEnabled: true,
  units: [
    {
      id: "u1", title: "Unit 1", description: "", color: "jade", mascot: "study",
      lessons: [
        {
          id: "l1", title: "Lesson 1",
          challenges: [
            { id: "q-select", type: "select", pattern: "why", context: ctx, prompt: "Vì sao?", options: ["A đúng", "B sai", "C sai"], answer: 0, explain: insight, source: src },
            { id: "q-order", type: "order", prompt: "Sắp xếp", items: ["một", "hai", "ba"], source: src },
            { id: "q-info", type: "info", title: "T", body: "B" },
          ],
        },
      ],
    },
    {
      id: "u2", title: "Unit 2", description: "", color: "sky", mascot: "study",
      lessons: [
        {
          id: "l2", title: "Lesson 2",
          challenges: [
            { id: "q-spot", type: "spot", context: ctx, prompt: "Câu nào sai?", statements: ["s0", "s1", "s2"], answer: 2, explain: insight, source: src },
            { id: "q-match", type: "match", prompt: "Nối", left: ["L0", "L1"], right: ["R0", "R1"], pairs: [0, 1], source: src },
          ],
        },
      ],
    },
  ],
});
const index = indexChallenges([fixture]);
const ch = (id: string) => index.get(id)!.challenge;

/** Position on screen of an original option, as the learner saw it. */
const shownPos = (id: string, text: string) => {
  const cc = toClientChallenge(ch(id)) as { options?: string[]; statements?: string[]; right?: string[]; items?: string[] };
  return (cc.options ?? cc.statements ?? cc.right ?? cc.items)!.indexOf(text);
};

describe("answerText", () => {
  it("maps shuffled positions back to the option text the learner saw", () => {
    expect(answerText(ch("q-select"), { type: "select", choice: shownPos("q-select", "B sai") })).toBe("B sai");
    expect(answerText(ch("q-spot"), { type: "spot", choice: shownPos("q-spot", "s1") })).toBe("s1");
    const order = ["ba", "một", "hai"].map((t) => shownPos("q-order", t));
    expect(answerText(ch("q-order"), { type: "order", order })).toBe("ba → một → hai");
    const pairs = [shownPos("q-match", "R1"), shownPos("q-match", "R0")];
    expect(answerText(ch("q-match"), { type: "match", pairs })).toBe("L0 → R1 · L1 → R0");
  });
  it("falls back to JSON for unexpected shapes", () => {
    expect(answerText(ch("q-select"), { foo: 1 })).toBe('{"foo":1}');
  });
});

describe("buildQuestionStats", () => {
  const totals = [
    { challengeId: "q-select", attempts: 10, learners: 8 },
    { challengeId: "q-spot", attempts: 5, learners: 5 },
    { challengeId: "q-order", attempts: 3, learners: 3 },
    { challengeId: "q-info", attempts: 4, learners: 4 },
    { challengeId: "gone", attempts: 2, learners: 2 },
  ];
  const firsts = [
    { challengeId: "q-select", tries: 8, correct: 6 },
    { challengeId: "q-spot", tries: 5, correct: 1 },
  ];
  const b = shownPos("q-select", "B sai");
  const c = shownPos("q-select", "C sai");
  const wrongs = [
    { challengeId: "q-select", answer: { type: "select", choice: b }, n: 1 },
    { challengeId: "q-select", answer: { type: "select", choice: c }, n: 3 },
    // Same choice stored with a different JSON shape still merges by text.
    { challengeId: "q-select", answer: { choice: b, type: "select" }, n: 1 },
  ];

  it("sorts by lowest first-try accuracy, skips ungraded and unknown ids, null accuracy last", () => {
    const rows = buildQuestionStats(index, totals, firsts, wrongs);
    expect(rows.map((r) => r.challenge.id)).toEqual(["q-spot", "q-select", "q-order"]);
    expect(rows[0].firstTryAccuracy).toBeCloseTo(0.2);
    expect(rows[2].firstTryAccuracy).toBeNull();
  });

  it("finds the most common wrong answer as text", () => {
    const sel = buildQuestionStats(index, totals, firsts, wrongs).find((r) => r.challenge.id === "q-select")!;
    expect(sel.topWrong).toEqual({ text: "C sai", n: 3, share: 0.6 });
    expect(sel.wrongTotal).toBe(5);
  });

  it("filters by segment and unit", () => {
    expect(buildQuestionStats(index, totals, firsts, wrongs, { unitId: "u2" }).map((r) => r.challenge.id)).toEqual(["q-spot"]);
    expect(buildQuestionStats(index, totals, firsts, wrongs, { segmentId: "other" })).toEqual([]);
  });
});

describe("buildFunnel", () => {
  it("lists every lesson in order with completion rate", () => {
    const rows = buildFunnel([fixture], [{ lessonId: "l2", started: 4, completed: 3, avgMistakes: 1.5 }]);
    expect(rows.map((r) => [r.lessonId, r.started, r.completed, r.completionRate, r.avgMistakes])).toEqual([
      ["l1", 0, 0, null, null],
      ["l2", 4, 3, 0.75, 1.5],
    ]);
    expect(buildFunnel([fixture], [], { unitId: "u1" }).map((r) => r.lessonId)).toEqual(["l1"]);
  });
});

describe("helpers", () => {
  it("formats ratios", () => {
    expect(ratio(1, 0)).toBeNull();
    expect(pct(ratio(1, 3))).toBe("33%");
    expect(pct(null)).toBe("—");
  });
});
