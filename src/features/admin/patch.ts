/**
 * Text-level editing of content unit files (content/segments/**), for the admin editor.
 *
 * `patchChallenge()` finds the object literal of ONE challenge by its id and replaces it with
 * the edited object. It is format-preserving: properties whose value did not change keep their
 * original text byte for byte, changed values are re-serialised (unquoted keys, JSON-escaped
 * strings, the file's indentation), removed properties lose their line and new ones are added in
 * the canonical key order. Replacing a challenge with itself therefore returns the same text,
 * and editing one field changes only that field's lines.
 *
 * Pure string functions: no filesystem, no imports of content at runtime.
 */

export type Literal = string | number | boolean | null | undefined | Literal[] | { [key: string]: Literal };

type Prop = { key: string; keyStart: number; valueStart: number; valueEnd: number; value: Literal };

/** Canonical order for keys added by the editor (matches how content files are written). */
export const KEY_ORDER = [
  "id", "type", "pattern", "title", "persona", "context", "says", "prompt", "body", "mascot",
  "statements", "options", "left", "right", "pairs", "items", "goal", "defaults",
  "min", "max", "step", "start", "unit", "answer", "tolerance", "hint", "reveal", "explain", "source",
];

const MAX_LINE = 160;

// ---------------------------------------------------------------------------------------------
// Parser for the literal subset content files use.

class LiteralParser {
  pos: number;
  constructor(readonly text: string, pos = 0) {
    this.pos = pos;
  }

  fail(msg: string): never {
    const line = this.text.slice(0, this.pos).split("\n").length;
    throw new Error(`Không phân tích được (dòng ${line}): ${msg}`);
  }

  skipTrivia() {
    const t = this.text;
    for (;;) {
      const ch = t[this.pos];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") this.pos++;
      else if (ch === "/" && t[this.pos + 1] === "/") {
        const nl = t.indexOf("\n", this.pos);
        this.pos = nl === -1 ? t.length : nl + 1;
      } else if (ch === "/" && t[this.pos + 1] === "*") {
        const end = t.indexOf("*/", this.pos + 2);
        if (end === -1) this.fail("chú thích chưa đóng");
        this.pos = end + 2;
      } else return;
    }
  }

  value(): Literal {
    this.skipTrivia();
    const ch = this.text[this.pos];
    if (ch === "{") return this.object().value;
    if (ch === "[") return this.array();
    if (ch === '"' || ch === "'" || ch === "`") return this.string();
    if (ch === "-" || ch === "." || (ch >= "0" && ch <= "9")) return this.number();
    const word = /^[A-Za-z_$][\w$]*/.exec(this.text.slice(this.pos, this.pos + 40))?.[0];
    if (word === "true" || word === "false" || word === "null" || word === "undefined") {
      this.pos += word.length;
      return word === "true" ? true : word === "false" ? false : word === "null" ? null : undefined;
    }
    return this.fail(`cú pháp không hỗ trợ "${this.text.slice(this.pos, this.pos + 20)}"`);
  }

  object(): { value: { [key: string]: Literal }; props: Prop[] } {
    this.pos++; // {
    const props: Prop[] = [];
    const value: { [key: string]: Literal } = {};
    for (;;) {
      this.skipTrivia();
      if (this.text[this.pos] === "}") {
        this.pos++;
        return { value, props };
      }
      const keyStart = this.pos;
      let key: string;
      const ch = this.text[this.pos];
      if (ch === '"' || ch === "'") key = this.string();
      else {
        const m = /^[A-Za-z_$][\w$]*/.exec(this.text.slice(this.pos, this.pos + 100));
        if (!m) this.fail("cần tên thuộc tính");
        key = m[0];
        this.pos += key.length;
      }
      this.skipTrivia();
      if (this.text[this.pos] !== ":") this.fail(`cần ":" sau "${key}"`);
      this.pos++;
      this.skipTrivia();
      const valueStart = this.pos;
      const v = this.value();
      const valueEnd = this.pos;
      props.push({ key, keyStart, valueStart, valueEnd, value: v });
      value[key] = v;
      this.skipTrivia();
      if (this.text[this.pos] === ",") this.pos++;
      else if (this.text[this.pos] !== "}") this.fail(`cần "," hoặc "}" sau "${key}"`);
    }
  }

  array(): Literal[] {
    this.pos++; // [
    const out: Literal[] = [];
    for (;;) {
      this.skipTrivia();
      if (this.text[this.pos] === "]") {
        this.pos++;
        return out;
      }
      out.push(this.value());
      this.skipTrivia();
      if (this.text[this.pos] === ",") this.pos++;
      else if (this.text[this.pos] !== "]") this.fail('cần "," hoặc "]"');
    }
  }

  string(): string {
    const t = this.text;
    const quote = t[this.pos++];
    let out = "";
    for (;;) {
      const ch = t[this.pos++];
      if (ch === undefined) this.fail("chuỗi chưa đóng");
      if (ch === quote) return out;
      if (quote === "`" && ch === "$" && t[this.pos] === "{") this.fail("template literal có biểu thức");
      if (ch !== "\\") {
        out += ch;
        continue;
      }
      const e = t[this.pos++];
      const simple: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" };
      if (e in simple) out += simple[e];
      else if (e === "x") {
        out += String.fromCharCode(parseInt(t.slice(this.pos, this.pos + 2), 16));
        this.pos += 2;
      } else if (e === "u" && t[this.pos] === "{") {
        const end = t.indexOf("}", this.pos);
        out += String.fromCodePoint(parseInt(t.slice(this.pos + 1, end), 16));
        this.pos = end + 1;
      } else if (e === "u") {
        out += String.fromCharCode(parseInt(t.slice(this.pos, this.pos + 4), 16));
        this.pos += 4;
      } else if (e === "\r" || e === "\n") {
        if (e === "\r" && t[this.pos] === "\n") this.pos++;
      } else out += e;
    }
  }

  number(): number {
    const m = /^-?(?:\d[\d_]*)?(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?/.exec(this.text.slice(this.pos, this.pos + 60));
    const raw = m?.[0] ?? "";
    const n = Number(raw.replace(/_/g, ""));
    if (!raw || raw === "-" || !Number.isFinite(n)) this.fail("số không hợp lệ");
    this.pos += raw.length;
    return n;
  }
}

/** Parses a TS object/array literal (unquoted keys, trailing commas, comments, 1_000 numbers). */
export function parseLiteral(text: string): Literal {
  const p = new LiteralParser(text);
  const v = p.value();
  p.skipTrivia();
  if (p.pos !== text.length) p.fail("thừa ký tự sau giá trị");
  return v;
}

// ---------------------------------------------------------------------------------------------
// Serialiser.

const IDENT = /^[A-Za-z_$][\w$]*$/;
const keyText = (k: string) => (IDENT.test(k) ? k : JSON.stringify(k));

export function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) >= 10_000) {
    const sign = n < 0 ? "-" : "";
    return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "_");
  }
  return String(n);
}

const isScalar = (v: Literal) => v === null || typeof v !== "object";
const defined = (o: { [key: string]: Literal }) => Object.entries(o).filter(([, v]) => v !== undefined);

function inline(v: Literal): string | null {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") return formatNumber(v);
  if (typeof v === "boolean" || v === null) return String(v);
  if (Array.isArray(v)) {
    const parts = v.map(inline);
    return parts.some((p) => p === null) ? null : `[${parts.join(", ")}]`;
  }
  const entries = defined(v);
  if (!entries.every(([, x]) => isScalar(x))) return null;
  return entries.length ? `{ ${entries.map(([k, x]) => `${keyText(k)}: ${inline(x)}`).join(", ")} }` : "{}";
}

/**
 * Serialises a value as it would appear after `key: ` on a line indented by `indent`.
 * `column` is where the value starts on that line, used to decide inline vs multi-line.
 */
export function serialiseValue(v: Literal, indent: string, column = indent.length): string {
  const one = inline(v);
  // Strings, numbers and objects of scalars (source, persona, defaults) always stay on one line,
  // like the content files; long text cannot be wrapped without changing it.
  if (one !== null && (!Array.isArray(v) || column + one.length + 1 <= MAX_LINE)) return one;
  const inner = indent + "  ";
  if (Array.isArray(v)) {
    return `[\n${v.map((x) => `${inner}${serialiseValue(x, inner)},\n`).join("")}${indent}]`;
  }
  const entries = defined(v as { [key: string]: Literal });
  return `{\n${entries.map(([k, x]) => `${inner}${keyText(k)}: ${serialiseValue(x, inner, inner.length + keyText(k).length + 2)},\n`).join("")}${indent}}`;
}

/** Whole challenge as a multi-line object literal whose braces sit at `indent`. */
export function serialiseObject(obj: { [key: string]: Literal }, indent: string): string {
  const inner = indent + "  ";
  const lines = defined(obj).map(([k, v]) => `${inner}${keyText(k)}: ${serialiseValue(v, inner, inner.length + keyText(k).length + 2)},\n`);
  return `{\n${lines.join("")}${indent}}`;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  const ea = Object.entries(a as object).filter(([, v]) => v !== undefined);
  const eb = Object.entries(b as object).filter(([, v]) => v !== undefined);
  return ea.length === eb.length && ea.every(([k, v]) => deepEqual(v, (b as Record<string, unknown>)[k]));
}

// ---------------------------------------------------------------------------------------------
// Locating a challenge.

/** Positions of every `{` that encloses `target`, outermost first (skips strings and comments). */
function openBracesAt(text: string, target: number): number[] {
  const stack: number[] = [];
  let i = 0;
  while (i < target) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      i++;
      while (i < text.length && text[i] !== ch) i += text[i] === "\\" ? 2 : 1;
      i++;
    } else if (ch === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      i = nl === -1 ? text.length : nl + 1;
    } else if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
    } else {
      if (ch === "{") stack.push(i);
      else if (ch === "}") stack.pop();
      i++;
    }
  }
  // `i` overshooting target means target was inside a string or comment.
  return i === target ? stack : [];
}

export type ChallengeSpan = {
  /** Offset of the challenge's `{`. */
  start: number;
  /** Offset just after its `}`. */
  end: number;
  /** Whitespace before the `{` on its line. */
  indent: string;
  props: Prop[];
  value: { [key: string]: Literal };
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Finds the object literal whose own `id` property is `challengeId`. Null if absent. */
export function findChallenge(text: string, challengeId: string): ChallengeSpan | null {
  const re = new RegExp(`(^|[\\s{,])id\\s*:\\s*["'\`]${escapeRe(challengeId)}["'\`]`, "g");
  const found: ChallengeSpan[] = [];
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const at = m.index + m[1].length;
    const stack = openBracesAt(text, at);
    const start = stack[stack.length - 1];
    if (start === undefined) continue;
    const parser = new LiteralParser(text, start);
    const { value, props } = parser.object();
    if (value.id !== challengeId || typeof value.type !== "string") continue;
    const lineStart = text.lastIndexOf("\n", start) + 1;
    const indent = /^[ \t]*/.exec(text.slice(lineStart, start))![0];
    found.push({ start, end: parser.pos, indent, props, value });
  }
  if (found.length > 1) throw new Error(`Mã câu "${challengeId}" xuất hiện ${found.length} lần trong file`);
  return found[0] ?? null;
}

// ---------------------------------------------------------------------------------------------
// Patching.

type Edit = { start: number; end: number; text: string };

const lineStartOf = (text: string, pos: number) => text.lastIndexOf("\n", pos - 1) + 1;

/** End of a property: after its comma, trailing spaces/comment and newline. */
function propLineEnd(text: string, p: Prop): { end: number; hasComma: boolean } {
  let i = p.valueEnd;
  while (text[i] === " " || text[i] === "\t") i++;
  const hasComma = text[i] === ",";
  if (hasComma) i++;
  while (text[i] === " " || text[i] === "\t") i++;
  if (text[i] === "/" && text[i + 1] === "/") {
    const nl = text.indexOf("\n", i);
    i = nl === -1 ? text.length : nl;
  }
  if (text[i] === "\r") i++;
  if (text[i] === "\n") i++;
  return { end: i, hasComma };
}

const orderOf = (k: string) => {
  const i = KEY_ORDER.indexOf(k);
  return i === -1 ? KEY_ORDER.length : i;
};

/**
 * Replaces the challenge `challengeId` in `fileText` with `edited`. Throws if the challenge is
 * not found or cannot be parsed. `edited` keys with value `undefined` are removed.
 */
export function patchChallenge(fileText: string, challengeId: string, edited: { [key: string]: Literal }): string {
  const span = findChallenge(fileText, challengeId);
  if (!span) throw new Error(`Không tìm thấy câu "${challengeId}" dưới dạng object literal trong file`);
  const firstProp = span.props[0];
  const propIndent = firstProp
    ? /^[ \t]*/.exec(fileText.slice(lineStartOf(fileText, firstProp.keyStart)))![0]
    : span.indent + "  ";
  const multiline = fileText.slice(span.start, span.end).includes("\n");
  if (!multiline) {
    return fileText.slice(0, span.start) + serialiseObject(edited, span.indent) + fileText.slice(span.end);
  }

  const edits: Edit[] = [];
  const kept: Prop[] = [];
  for (const p of span.props) {
    const next = edited[p.key];
    if (next === undefined) {
      edits.push({ start: lineStartOf(fileText, p.keyStart), end: propLineEnd(fileText, p).end, text: "" });
      continue;
    }
    kept.push(p);
    if (!deepEqual(p.value, next)) {
      const column = p.valueStart - lineStartOf(fileText, p.valueStart);
      edits.push({ start: p.valueStart, end: p.valueEnd, text: serialiseValue(next, propIndent, column) });
    }
  }

  const originalKeys = new Set(span.props.map((p) => p.key));
  const added = Object.keys(edited).filter((k) => edited[k] !== undefined && !originalKeys.has(k));
  added.sort((a, b) => orderOf(a) - orderOf(b));
  for (const k of added) {
    const line = `${propIndent}${keyText(k)}: ${serialiseValue(edited[k], propIndent, propIndent.length + keyText(k).length + 2)},\n`;
    // After the last kept property that comes earlier in canonical order, else first.
    const before = kept.filter((p) => orderOf(p.key) <= orderOf(k)).pop();
    if (before) {
      const { end, hasComma } = propLineEnd(fileText, before);
      if (!hasComma) edits.push({ start: before.valueEnd, end: before.valueEnd, text: "," });
      edits.push({ start: end, end, text: line });
    } else {
      const at = fileText.indexOf("\n", span.start) + 1;
      edits.push({ start: at, end: at, text: line });
    }
  }

  // Apply back to front; insertions at the same offset keep their canonical order.
  let out = fileText;
  edits
    .map((e, i) => ({ ...e, i }))
    .sort((a, b) => b.start - a.start || b.i - a.i)
    .forEach((e) => {
      out = out.slice(0, e.start) + e.text + out.slice(e.end);
    });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Diff and change summary.

type Op = { kind: " " | "-" | "+"; line: string };

function diffLines(a: string[], b: string[]): Op[] {
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const am = a.slice(pre, a.length - suf);
  const bm = b.slice(pre, b.length - suf);
  // LCS table over the changed middle only.
  const n = am.length;
  const m = bm.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = am[i] === bm[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const mid: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (am[i] === bm[j]) {
      mid.push({ kind: " ", line: am[i++] });
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) mid.push({ kind: "-", line: am[i++] });
    else mid.push({ kind: "+", line: bm[j++] });
  }
  while (i < n) mid.push({ kind: "-", line: am[i++] });
  while (j < m) mid.push({ kind: "+", line: bm[j++] });
  return [...a.slice(0, pre).map((line) => ({ kind: " " as const, line })), ...mid, ...a.slice(a.length - suf).map((line) => ({ kind: " " as const, line }))];
}

/** Unified diff (git style) between two versions of a file. Empty string when identical. */
export function unifiedDiff(before: string, after: string, path: string, context = 3): string {
  if (before === after) return "";
  const ops = diffLines(before.split("\n"), after.split("\n"));
  const changed = ops.map((o, i) => (o.kind === " " ? -1 : i)).filter((i) => i >= 0);
  const hunks: [number, number][] = [];
  for (const i of changed) {
    const lo = Math.max(0, i - context);
    const hi = Math.min(ops.length - 1, i + context);
    const last = hunks[hunks.length - 1];
    if (last && lo <= last[1] + 1) last[1] = hi;
    else hunks.push([lo, hi]);
  }
  const out = [`--- a/${path}`, `+++ b/${path}`];
  for (const [lo, hi] of hunks) {
    let aLine = 1;
    let bLine = 1;
    for (let k = 0; k < lo; k++) {
      if (ops[k].kind !== "+") aLine++;
      if (ops[k].kind !== "-") bLine++;
    }
    const slice = ops.slice(lo, hi + 1);
    const aCount = slice.filter((o) => o.kind !== "+").length;
    const bCount = slice.filter((o) => o.kind !== "-").length;
    out.push(`@@ -${aCount ? aLine : aLine - 1},${aCount} +${bCount ? bLine : bLine - 1},${bCount} @@`);
    for (const o of slice) out.push(o.kind + o.line);
  }
  return out.join("\n") + "\n";
}

export type FieldChange = { key: string; before: Literal; after: Literal };

/** Top-level fields that differ between two challenge objects. */
export function changedFields(before: { [key: string]: Literal }, after: { [key: string]: Literal }): FieldChange[] {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort((a, b) => orderOf(a) - orderOf(b));
  return keys.filter((k) => !deepEqual(before[k], after[k])).map((key) => ({ key, before: before[key], after: after[key] }));
}

const short = (v: Literal) => {
  const s = v === undefined ? "(không có)" : JSON.stringify(v);
  return s.length > 160 ? `${s.slice(0, 157)}…` : s;
};

/** Markdown list of changes for the pull request body. */
export function describeChanges(changes: FieldChange[]): string {
  return changes.map((c) => `- \`${c.key}\`: ${short(c.before)} → ${short(c.after)}`).join("\n");
}
