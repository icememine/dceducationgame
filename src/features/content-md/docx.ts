/**
 * Word round trip for the lessons file. pandoc does the conversion; these two functions only
 * adjust what does not survive it: HTML comments (the guide and the version stamp) are dropped
 * in Word, and pandoc escapes brackets on the way back.
 */
const GUIDE_TITLE = "# Hướng dẫn sửa";
const STAMP_LABEL = "Phiên bản nội dung:";

/** Markdown for pandoc → .docx: the guide and stamp become visible text at the top. */
export function mdForDocx(md: string): string {
  const m = /^<!--\n([\s\S]*?)\n-->\n<!-- phiên bản nội dung: (\w+) -->\n/.exec(md);
  if (!m) return md;
  const guide = m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("- ") ? l : `\n${l}\n`));
  return [GUIDE_TITLE, "", ...guide, "", `${STAMP_LABEL} ${m[2]}`, "", md.slice(m[0].length)].join("\n");
}

/** Markdown pandoc produced from an edited .docx → the format parseContent expects. */
export function mdFromDocx(md: string): string {
  const text = md.replace(/\\([[\]*_`#<>~\\-])/g, "$1");
  const stamp = new RegExp(`${STAMP_LABEL} (\\w+)`).exec(text)?.[1];
  const guideAt = text.indexOf(GUIDE_TITLE);
  const bodyAt = guideAt < 0 ? 0 : text.indexOf("\n# ", guideAt + GUIDE_TITLE.length) + 1;
  return (stamp ? `<!-- phiên bản nội dung: ${stamp} -->\n\n` : "") + text.slice(bodyAt);
}
