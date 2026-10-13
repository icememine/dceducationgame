import { describe, expect, it } from "vitest";
import { segments } from "@content/index";
import { deepEqual } from "@/features/admin/patch";
import { applyEdits, contentStamp, exportContent, parseContent, readStamp } from "./markdown";

const all = segments.flatMap((s) => s.units.flatMap((u) => u.lessons));
const byId = new Map(all.flatMap((l) => l.challenges).map((c) => [c.id, c]));

describe("lesson content as Markdown", () => {
  const md = exportContent(segments);
  const parsed = parseContent(md);

  it("exports every lesson and every question", () => {
    expect(parsed.errors).toEqual([]);
    expect(parsed.lessons.map((l) => l.id)).toEqual(all.map((l) => l.id));
    expect(parsed.challenges.map((c) => c.id)).toEqual(all.flatMap((l) => l.challenges.map((c) => c.id)));
    expect(md).toContain("- [x]");
  });

  it("round-trips: an unedited export changes nothing", () => {
    for (const p of parsed.challenges) {
      const orig = byId.get(p.id)!;
      const { value, problems } = applyEdits(orig as never, p);
      expect(problems, p.id).toEqual([]);
      expect(deepEqual(value, orig), p.id).toBe(true);
    }
    for (const l of parsed.lessons) expect(l.title).toBe(all.find((x) => x.id === l.id)!.title);
  });

  it("applies a text edit, a moved answer and a reordered match", () => {
    const one = parseContent(`### Bài: Tên mới {b1-what-is-risk}

#### Câu b1-risk-paper-loss · Chọn đáp án

Bối cảnh: Chị Mai thấy NAV quỹ cổ phiếu giảm 12% sau 2 tháng
và nhắn: "Mình mất 12% rồi." Chị chưa bán.

Câu hỏi: Nhận định nào là đúng?

- [ ] Chị đã mất hẳn 12% số tiền
- [ ] Quỹ đã vỡ nợ nên NAV giảm
- [x] Đây là biến động giá; khoản lỗ chỉ thành thật nếu chị bán ở mức giá này

Giải thích: Biến động giá khác mất vốn vĩnh viễn, vì vậy hãy giữ quỹ dự phòng để không phải bán lúc giá thấp.
`);
    expect(one.lessons[0]).toMatchObject({ id: "b1-what-is-risk", title: "Tên mới" });
    const { value } = applyEdits(byId.get("b1-risk-paper-loss") as never, one.challenges[0]);
    expect(value!.context).toBe('Chị Mai thấy NAV quỹ cổ phiếu giảm 12% sau 2 tháng và nhắn: "Mình mất 12% rồi." Chị chưa bán.');
    expect(value!.prompt).toBe("Nhận định nào là đúng?");
    expect(value!.answer).toBe(2);
    expect((value!.options as string[])[2]).toMatch(/^Đây là biến động giá/);

    const m = byId.get("b1-risk-types") as { left: string[]; right: string[]; pairs: number[] };
    const lines = m.left.map((l, i) => `- ${l} → ${m.right[m.pairs[i]]}`).reverse().join("\n");
    const pm = parseContent(`#### Câu b1-risk-types · Nối cặp\n\nCâu hỏi: Nối loại rủi ro với ví dụ\n\n${lines}\n\nGiải thích: ${(m as unknown as { explain: string }).explain}\n`);
    const mv = applyEdits(m as never, pm.challenges[0]).value as { left: string[]; right: string[]; pairs: number[] };
    expect(mv.left).toEqual([...m.left].reverse());
    mv.left.forEach((l, i) => expect(mv.right[mv.pairs[i]]).toBe(m.right[m.pairs[m.left.indexOf(l)]]));
  });

  it("reports mistakes with line numbers", () => {
    const bad = parseContent(`#### Câu b1-risk-paper-loss · Chọn đáp án\n\nBối cảnh: abc\n\nCâu hỏi: ?\n\n- [x] a\n- [x] b\n- [ ] c\n`);
    const { problems } = applyEdits(byId.get("b1-risk-paper-loss") as never, bad.challenges[0]);
    expect(problems.join(" ")).toMatch(/đúng một \[x\].*dòng 1|dòng 1.*đúng một \[x\]/);
    expect(problems.join(" ")).toMatch(/Giải thích/);
  });

  it("stamps the export so a stale copy is caught", () => {
    expect(readStamp(md)).toBe(contentStamp(segments));
    const changed = structuredClone(segments);
    (changed[0].units[0].lessons[1].challenges[0] as { prompt: string }).prompt += " (sửa)";
    expect(contentStamp(changed)).not.toBe(contentStamp(segments));
  });
});
