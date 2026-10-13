/**
 * The plan card as a standalone SVG (for "Tải ảnh" and link previews). Pure string building:
 * system fonts only (they render Vietnamese diacritics), no network fonts or scripts.
 */
import type { PlanCard } from "./model";

const W = 800;
const PAD = 48;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif";
const C = {
  page: "#E8EFEB", surface: "#FFFFFF", sunken: "#F3F7F5", ink: "#15302A", muted: "#647A72", line: "#D9E4DF",
  jade: "#16A571", jadeDeep: "#0D7D55", jadeSoft: "#D8F3E7", skySoft: "#DDEEFB", skyDeep: "#1D669F", goldSoft: "#FFF1D2", goldDeep: "#C2850E",
};

export const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Greedy word wrap by an average glyph width (≈0.55em for sans-serif). */
export function wrap(text: string, fontSize: number, width: number): string[] {
  const max = Math.max(8, Math.floor(width / (fontSize * 0.55)));
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function planCardSvg(card: PlanCard, opts: { mascotHref?: string } = {}): string {
  const out: string[] = [];
  let y = 0;
  const inner = W - PAD * 2;

  const text = (x: number, yy: number, s: string, size: number, fill: string, weight = 400) =>
    out.push(`<text x="${x}" y="${yy}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(s)}</text>`);
  const para = (s: string, size: number, fill: string, weight = 400, x = PAD, width = inner, lh = 1.4) => {
    for (const l of wrap(s, size, width)) {
      y += size * lh;
      text(x, y, l, size, fill, weight);
    }
  };
  const heading = (s: string) => {
    y += 40;
    text(PAD, y, s.toUpperCase(), 18, C.muted, 800);
    y += 6;
  };

  // Header band.
  out.push(`<rect x="0" y="0" width="${W}" height="96" fill="${C.jade}"/>`);
  text(PAD, 48, "BẢN KẾ HOẠCH ĐẦU TƯ", 26, "#FFFFFF", 800);
  text(PAD, 78, "Rồng DC Academy", 18, C.jadeSoft, 600);
  y = 96;

  // Learner.
  y += 32;
  const avatar = 112;
  if (opts.mascotHref) out.push(`<image x="${PAD}" y="${y}" width="${avatar}" height="${avatar}" href="${escapeXml(opts.mascotHref)}"/>`);
  else out.push(`<circle cx="${PAD + avatar / 2}" cy="${y + avatar / 2}" r="${avatar / 2}" fill="${C.jadeSoft}"/>`);
  const tx = PAD + avatar + 24;
  text(tx, y + 52, card.nickname, 38, C.ink, 800);
  text(tx, y + 86, "Kế hoạch học và đầu tư của mình", 20, C.muted, 600);
  y += avatar;

  // Risk profile.
  heading("Hồ sơ rủi ro");
  if (card.profile) {
    para(card.profile.name, 32, C.jadeDeep, 800);
    para(card.profile.summary, 22, C.ink);
  } else para("Chưa xác nhận hồ sơ rủi ro.", 22, C.muted);

  if (card.studyTypes.length) {
    heading("Loại quỹ nên tìm hiểu");
    y += 12;
    let x = PAD;
    const size = 20;
    for (const t of card.studyTypes) {
      const w = t.length * size * 0.56 + 32;
      if (x + w > W - PAD) {
        x = PAD;
        y += 48;
      }
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="40" rx="20" fill="${C.skySoft}"/>`);
      text(x + 16, y + 27, t, size, C.skyDeep, 700);
      x += w + 12;
    }
    y += 40;
  }

  // Goals.
  heading("Mục tiêu");
  if (card.goals.length === 0) para("Chưa lưu mục tiêu.", 22, C.muted);
  for (const g of card.goals) {
    const detail = card.hideAmounts ? "" : [g.target, g.monthly, g.duration && `ước tính ${g.duration}`].filter(Boolean).join(" · ");
    const h = detail ? 84 : 56;
    y += 12;
    out.push(`<rect x="${PAD}" y="${y}" width="${inner}" height="${h}" rx="16" fill="${C.sunken}"/>`);
    text(PAD + 20, y + 36, g.name, 24, C.ink, 800);
    if (detail) text(PAD + 20, y + 68, detail, 20, C.muted, 600);
    y += h;
  }
  if (card.moreGoals) para(`và ${card.moreGoals} mục tiêu khác`, 20, C.muted);
  if (card.hideAmounts) para("Số tiền đã được ẩn.", 18, C.muted);

  if (card.ageRule) {
    heading("Khung tham khảo");
    para(card.ageRule, 20, C.ink);
  }

  // Disclaimer box.
  y += 32;
  const longLines = wrap(card.disclaimerLong, 17, inner - 40);
  const boxH = 24 + 26 + longLines.length * 17 * 1.4 + 20;
  out.push(`<rect x="${PAD}" y="${y}" width="${inner}" height="${boxH}" rx="16" fill="${C.goldSoft}"/>`);
  text(PAD + 20, y + 40, card.disclaimer, 20, C.goldDeep, 800);
  let ly = y + 50;
  for (const l of longLines) {
    ly += 17 * 1.4;
    text(PAD + 20, ly, l, 17, C.ink);
  }
  y += boxH + 40;

  const H = Math.ceil(y);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${escapeXml(FONT)}">`,
    `<rect width="${W}" height="${H}" fill="${C.surface}"/>`,
    ...out,
    `</svg>`,
  ].join("\n");
}
