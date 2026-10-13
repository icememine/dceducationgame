import { describe, expect, it } from "vitest";
import { segments } from "../../../content";
import { mdForDocx, mdFromDocx } from "./docx";
import { exportContent, parseContent, readStamp } from "./markdown";

describe("docx round trip helpers", () => {
  const md = exportContent(segments);

  it("shows the guide and stamp as text, and reads them back", () => {
    const forWord = mdForDocx(md);
    expect(forWord).not.toContain("<!--");
    expect(forWord).toContain("Phiên bản nội dung:");
    // pandoc escapes brackets on the way back from Word
    const back = mdFromDocx(forWord.replace(/\[(x| )\]/g, "\\[$1\\]"));
    expect(readStamp(back)).toBe(readStamp(md));
    expect(parseContent(back).errors).toEqual([]);
    expect(parseContent(back).challenges.size).toBe(parseContent(md).challenges.size);
  });
});
