(() => {
"use strict";
const DATA = __DATA__;
const M = DATA.m;
const app = document.getElementById("app");

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const mascot = (mood = "explore", size = 96) => `<img class="mascot" src="${M[mood] || M.explore}" width="${size}" height="${size}" alt="">`;
const vnd = (n) => {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
  return Math.round(n / 1e6).toLocaleString("vi-VN") + " triệu";
};
const pct = (x, d = 1) => (x * 100).toLocaleString("vi-VN", { maximumFractionDigits: d }) + "%";
const num = (s) => {
  s = String(s ?? "").replace(/\s/g, "");
  if (!s) return NaN;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) return Number(s.replace(/\./g, "").replace(",", "."));
  return Number(s.replace(",", "."));
};
const shuffle = (arr, seed) => {
  const a = arr.map((v, i) => i);
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.every((v, i) => v === i) && a.length > 1) a.push(a.shift());
  return a;
};
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- icons ---------- */
const I = {
  flame: '<path d="M12 2.5c.8 3.2 4.8 5.3 4.8 10a4.8 4.8 0 0 1-9.6 0c0-2 .9-3.4 1.9-4.4.1 1.4.8 2.4 1.9 2.8-.2-3 .2-5.6 1-8.4z" fill="currentColor"/>',
  heart: '<path d="M12 20.5s-7.2-4.4-9.1-8.8C1.6 8.6 3.6 5 7 5c2 0 3.3 1.1 4.1 2.3h1.8C13.7 6.1 15 5 17 5c3.4 0 5.4 3.6 4.1 6.7C19.2 16.1 12 20.5 12 20.5z" fill="currentColor"/>',
  bolt: '<path d="M13.2 2 4.5 13.6h6.6L10 22l9.5-12.2h-6.9L13.2 2z" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.6 4.6L19 7.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  star: '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z" fill="currentColor"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="2" fill="currentColor"/><rect x="2.5" y="6.5" width="19" height="4.5" rx="1.5" fill="currentColor" opacity=".75"/><path d="M12 6.5v14" stroke="var(--surface)" stroke-width="2.2"/><path d="M12 6.5C10 3 6.5 3.5 7.5 5.5s4.5 1 4.5 1zm0 0c2-3.5 5.5-3 4.5-1S12 6.5 12 6.5z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  trophy: '<path d="M7 3h10v5a5 5 0 0 1-10 0V3z" fill="currentColor"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10.5" y="12.5" width="3" height="4" fill="currentColor"/><rect x="7.5" y="16.5" width="9" height="3.5" rx="1.2" fill="currentColor"/>',
  home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.5z" fill="currentColor"/>',
  chat: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="currentColor"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2.5" fill="currentColor"/><rect x="7.5" y="5.5" width="9" height="4" rx="1" fill="var(--surface)"/><g fill="var(--surface)"><circle cx="9" cy="13" r="1.1"/><circle cx="12" cy="13" r="1.1"/><circle cx="15" cy="13" r="1.1"/><circle cx="9" cy="17" r="1.1"/><circle cx="12" cy="17" r="1.1"/><circle cx="15" cy="17" r="1.1"/></g>',
  user: '<circle cx="12" cy="8" r="4.2" fill="currentColor"/><path d="M4 20.5c.8-4 4-6.2 8-6.2s7.2 2.2 8 6.2" fill="currentColor"/>',
  book: '<path d="M4 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4V4.5zM20 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6V4.5z" fill="currentColor"/>',
  sparkle: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z" fill="currentColor"/>',
  chev: '<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  next: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  send: '<path d="M3 11.5 21 3l-8.5 18-2-7.5L3 11.5z" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
  shield: '<path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6L12 2.5z" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 7v5.5l3.5 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  doc: '<path d="M6 2.5h8l4.5 4.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V4A1.5 1.5 0 0 1 6 2.5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8M8 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 3.5 2 3.5H5" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
};
const ic = (n, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ""}</svg>`;

/* ---------- content ---------- */
const STAGES = DATA.outline; // order: B, C, A
const STAGE_META = {
  B: { hearts: false, color: ["var(--jade)", "var(--gold-deep)", "var(--sky)", "var(--jade-deep)", "var(--coral)", "var(--violet)", "var(--sky-deep)"] },
  C: { hearts: true, color: ["var(--sky)", "var(--jade)", "var(--gold-deep)", "var(--coral)", "var(--violet)", "var(--jade-deep)", "var(--sky-deep)", "var(--gold-deep)"] },
  A: { hearts: true, color: ["var(--jade)", "var(--sky)", "var(--gold-deep)", "var(--violet)", "var(--sky-deep)", "var(--coral)", "var(--jade-deep)", "var(--coral)", "var(--violet)", "var(--gold-deep)"] },
};
const stageOf = (code) => STAGES.find((s) => s.code === code);
const flatLessons = (code) => stageOf(code).units.flatMap((u) => u.lessons);
const DEMO = { "B2.3": "risk", "B4.2": "compound", "B5.5": "timing", "B5.6": "reactions", "C3.2": "funds101", "A2.4": "case" };
/** Lessons before this code are shown as finished, so the path looks lived in. */
const BASE_DONE = { B: "B4.2", C: "C3.2", A: "A1.1" };

const PATTERN = { prediction: "Dự đoán", why: "Vì sao?", misconception: "Hiểu lầm phổ biến", decision: "Ra quyết định" };
const SRC = {
  nam: "Kế hoạch du học cho con (anh Nam)",
  age60: "Câu chuyện nhà đầu tư 60 tuổi",
  dcds10: "10 năm đầu tư đều đặn vào DCDS",
  petrol: "Không ai đợi giá xăng giảm mới đổ xăng",
  best: "Ngày tốt nhất để đầu tư là ngày tiền về",
  mmf: "W5 · Quỹ thị trường tiền tệ",
  bond: "W5 · Quỹ trái phiếu nâng cao",
  bal: "W5 · Quỹ cân bằng nâng cao",
  quiz: "Bộ câu hỏi tự đánh giá (bản nháp)",
};

/** Questions and rules come from content/risk/risk-model.ts (injected by npm run proto:build). */
const RISK_ITEMS = DATA.risk.questions.map((q) => ({ id: q.id, prompt: q.prompt, opts: q.options.map((o) => [o.label]) }));
/** Profiles and questionnaire: Risk Scoring Framework v2.3, injected from content/risk/risk-model.ts. */
const UNIT_LABEL = { "c1-money-market": "Quỹ thị trường tiền tệ", "c2-bond-funds": "Quỹ trái phiếu", "c3-equity-funds": "Quỹ cổ phiếu", "c4-index-passive": "Quỹ chỉ số & ETF", "c5-balanced": "Quỹ cân bằng" };
const PROFILES = DATA.risk.profiles.map((p) => ({ id: p.id, name: p.name, mood: p.mascot, summary: p.summary, units: p.studyUnits.map((u) => UNIT_LABEL[u] || u), funds: p.funds.join(" · ") }));
/* risk-score:start (mirror of scoreRisk in content/risk/score.ts; content/risk/prototype-parity.test.ts checks they agree) */
function scoreRiskModel(model, choices) {
  const ids = model.profiles.map((p) => p.id), level = (p) => ids.indexOf(p);
  const points = (id) => { const q = model.questions.find((x) => x.id === id), i = choices[id]; return q && i != null ? q.options[i]?.points : undefined; };
  const sections = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of model.questions) sections[q.section] += points(q.id) ?? 0;
  const total = sections.A + sections.B + sections.C + sections.D;
  const band = model.bands.find((b) => total >= b.min && total <= b.max) ?? (total < model.bands[0].min ? model.bands[0] : model.bands[model.bands.length - 1]);
  const scored = band.profile;
  let profile = scored;
  const overrides = [];
  const h = model.overrides.horizon, k = model.overrides.knowledge, c = model.overrides.capacity, n = model.overrides.inconsistency;
  if ((points(h.question) ?? Infinity) <= h.atMost && level(profile) > level(h.maxProfile)) { profile = h.maxProfile; overrides.push({ rule: "horizon", reason: h.reason }); }
  if ((points(k.question) ?? Infinity) <= k.atMost && level(profile) > level(k.startAt)) { profile = k.startAt; overrides.push({ rule: "knowledge", reason: k.reason }); }
  const capacityWarning = (points(c.question) ?? Infinity) <= c.atMost && total >= c.totalAtLeast ? c.warning : undefined;
  const inconsistency = (points(n.lowQuestion) ?? Infinity) <= n.lowAtMost && (points(n.highQuestion) ?? -Infinity) >= n.highAtLeast ? n.message : undefined;
  return { total, sections, scored, profile, overrides, ...(capacityWarning && { capacityWarning }), ...(inconsistency && { inconsistency }) };
}
/* risk-score:end */
function scoreRisk(answers) {
  const choices = {};
  DATA.risk.questions.forEach((q, i) => { if (answers[i] != null) choices[q.id] = answers[i]; });
  const r = scoreRiskModel(DATA.risk, choices);
  return { ...r, band: PROFILES.findIndex((p) => p.id === r.profile), decision: null };
}
const riskBand = (r) => (r.final ?? r.band);

const LESSONS = {
  risk: {
    title: "Tự đánh giá khẩu vị rủi ro", code: "B2.3", stage: "B", xp: 20, profile: true,
    items: [
      { type: "story", mood: "explore", title: "Không có câu trả lời sai", body: "6 câu hỏi giúp bạn hiểu khả năng tài chính, thời gian đầu tư và cảm xúc khi thị trường giảm. Kết quả dùng để gợi ý lộ trình học, không phải khuyến nghị đầu tư." },
      ...RISK_ITEMS.map((q, i) => ({ type: "profile", idx: i, prompt: q.prompt, options: q.opts.map((o) => o[0]) })),
    ],
  },
  compound: {
    title: "1 tỷ trong 30 năm", code: "B4.2", stage: "B", xp: 15,
    items: [
      { type: "story", mood: "grow", title: "Lãi sinh lãi", body: "Lãi kép là khi lợi nhuận được giữ lại và tiếp tục sinh lời ở các kỳ sau. Bạn không cần góp thêm vốn để có hiệu ứng này. Thứ bạn cần nhất là thời gian." },
      { type: "estimate", pattern: "prediction", context: "Chị Mai 30 tuổi nhận 1 tỷ đồng tiền thừa kế và đầu tư một lần, không rút ra. Giả định lợi nhuận 15%/năm (minh họa, không được bảo đảm).",
        prompt: "Đến năm 60 tuổi, khoản này thành bao nhiêu?", min: 2, max: 100, step: 1, start: 10, unit: "tỷ", answer: 66.2, tol: 0.25,
        reveal: [[5, 2], [10, 4], [20, 16.4], [30, 66.2]],
        explain: "Khoảng 66,2 tỷ. Với 15%/năm, cứ khoảng 5 năm tiền nhân đôi, và mỗi lần nhân đôi sau lớn hơn lần trước: phần lớn tài sản được tạo ra ở những năm cuối.", src: SRC.nam },
      { type: "select", pattern: "why", context: "An và Bình cùng góp 2 triệu/tháng đến năm 60 tuổi. An bắt đầu năm 25 tuổi (góp tổng 840 triệu), Bình năm 45 tuổi (góp 360 triệu). Giả định 15%/năm, An có khoảng 22,6 tỷ, Bình khoảng 1,2 tỷ.",
        prompt: "Vì sao An góp chưa đến 2,5 lần mà có gấp khoảng 18 lần?",
        options: ["An chọn được những ngày mua tốt hơn", "An có thêm 20 năm để lợi nhuận tiếp tục sinh lời", "An chọn được quỹ có lợi nhuận cao hơn"], answer: 1,
        explain: "Cùng quỹ, cùng mức góp: khác biệt đến từ 20 năm lãi kép thêm. Trì hoãn có chi phí thật, nhưng bắt đầu muộn vẫn tốt hơn không bắt đầu.", src: SRC.age60 },
      { type: "select", pattern: "why", context: "Một nhà đầu tư góp đều 10 triệu đồng/tháng vào DCDS. Sau 3 năm, tổng vốn góp là 360 triệu đồng, tài khoản đạt khoảng 404 triệu đồng.",
        prompt: "Vì sao sau 3 năm, gần 90% giá trị tài khoản vẫn đến từ vốn góp?",
        options: ["Lãi kép chỉ bắt đầu sau 3 năm", "Các khoản tiền góp sau chưa có nhiều thời gian sinh lời", "Đầu tư định kỳ không tận dụng được lãi kép"], answer: 1,
        explain: "Lãi kép bắt đầu ngay khi lợi nhuận được tái đầu tư, nhưng mỗi khoản góp có thời gian sinh lời khác nhau. Đầu tư lâu dài giúp hiệu ứng tích lũy có cơ hội rõ rệt hơn.", src: SRC.dcds10 },
      { type: "select", pattern: "misconception", context: "Một người bạn khoe: \"Quỹ của mình 5 năm qua tăng tổng cộng 100%, tức là mỗi năm 20%.\"",
        prompt: "Nhận định nào đúng?",
        options: ["Đúng, 100% chia cho 5 năm là 20%/năm", "Chưa đúng: nhờ lãi kép, gấp đôi trong 5 năm chỉ cần khoảng 15%/năm", "Phải hơn 20%/năm mới gấp đôi được trong 5 năm"], answer: 1,
        explain: "Mỗi năm lợi nhuận tính trên số vốn đã lớn lên, nên khoảng 15%/năm trong 5 năm đã gấp đôi. Khi so sánh quỹ, hãy dùng lợi nhuận bình quân năm, không chia đều tổng lợi nhuận." },
      { type: "select", pattern: "misconception", context: "Chị Lan nhận cổ tức tiền mặt từ quỹ mỗi năm và dùng hết cho du lịch. Chị nghĩ tài khoản vẫn tăng theo lãi kép như người giữ lại toàn bộ lợi nhuận.",
        prompt: "Nhận định nào đúng?",
        options: ["Lãi kép luôn tự diễn ra khi đã đầu tư vào quỹ", "Phần cổ tức đã tiêu không còn sinh lời; muốn có lãi kép phải tái đầu tư khoản đó", "Quỹ chia cổ tức thì hoàn toàn không có lãi kép"], answer: 1,
        explain: "Lãi kép cần lợi nhuận ở lại để tiếp tục sinh lời. Quỹ giữ lại thu nhập thì hiệu ứng nằm sẵn trong NAV; nhận tiền mặt ra ngoài thì phải tự mua lại nếu muốn tích lũy tiếp." },
    ],
  },
  reactions: {
    title: "Ba phản ứng khi quỹ giảm", code: "B5.6", stage: "B", xp: 20,
    items: [
      { type: "story", mood: "fight", title: "10 năm, 10 triệu mỗi tháng", body: "Bạn góp đều 10 triệu mỗi tháng cho một mục tiêu 10 năm. Trên đường đi, quỹ sẽ có ba đợt giảm. Mỗi lần như vậy, bạn quyết định làm gì. Số liệu trong mô phỏng là minh họa." },
      { type: "decision", kind: "Ra quyết định" },
      { type: "select", pattern: "prediction", context: "Ba người cùng góp 10 triệu/tháng vào DCDS từ 8/2016 đến 7/2026, tổng vốn 1,2 tỷ. Khi quỹ giảm, A vẫn góp đều, B tạm dừng, C bán ra rồi mua lại khi quỹ tăng.",
        prompt: "Ai có kết quả thấp nhất?",
        options: ["A, vì vẫn góp tiền cả lúc quỹ giảm", "B, vì bỏ lỡ một số tháng góp", "C, vì bán ra rồi mua lại"], answer: 2,
        explain: "A khoảng 2,21 tỷ, B 2,16 tỷ, C chỉ 1,85 tỷ: ít hơn khoảng 360 triệu, bằng 3 năm tiền góp. Bán khi giảm biến khoản lỗ tạm thời thành lỗ thật (kết quả lịch sử, chưa gồm phí).", src: SRC.dcds10 },
      { type: "select", pattern: "why", context: "Người tạm dừng đã cân nhắc ra vào 11 lần trong 10 năm, lần nào cũng có lý do nghe hợp lý. Kết quả cuối cùng vẫn thấp hơn người cứ góp đều.",
        prompt: "Vì sao \"làm nhiều hơn\" lại không tốt hơn?",
        options: ["Vì mỗi lần ra vào đều bị phạt phí rất cao", "Vì những tháng tạm dừng thường là lúc giá thấp, khi cùng số tiền mua được nhiều CCQ nhất", "Vì người góp đều được quỹ ưu tiên giá tốt hơn"], answer: 1,
        explain: "Dừng góp khi quỹ giảm nghĩa là bỏ qua những lần mua rẻ nhất. Điều bạn kiểm soát được là số tiền góp, mức rủi ro và việc có giữ kế hoạch hay không.", src: SRC.dcds10 },
    ],
  },
  timing: {
    title: "Trò chơi Nhà tiên tri", code: "B5.5", stage: "B", xp: 20,
    items: [
      { type: "story", mood: "save", title: "Không ai đợi giá xăng giảm mới đổ xăng", body: "Người đổ xăng không quyết định được giá, nhưng quyết định được số tiền: \"Năm chục, em ơi.\" Giá cao mua được ít, giá thấp mua được nhiều. Giờ thử xem, nếu cố chọn đúng ngày rẻ nhất mỗi tháng thì được bao nhiêu?", src: SRC.petrol },
      { type: "game", kind: "Trò chơi dữ liệu" },
      { type: "select", pattern: "prediction", context: "Hai người cùng góp 10 triệu/tháng vào DCDS suốt 22 năm (2004–2026). A may mắn luôn mua đúng ngày giá thấp nhất mỗi tháng; B mua vào một ngày cố định.",
        prompt: "A có nhiều hơn B khoảng bao nhiêu?",
        options: ["Chỉ khoảng 2,7%", "Khoảng 30%", "Gấp đôi"], answer: 0,
        explain: "Khoảng 11,8 tỷ so với 11,4 tỷ. Người xui nhất, tháng nào cũng mua đỉnh, cũng chỉ kém B khoảng 3,6%: thời gian ở trong thị trường quan trọng hơn chọn ngày.", src: SRC.petrol },
      { type: "select", pattern: "prediction", context: "Cũng dữ liệu DCDS 22 năm: ba người cùng đầu tư mỗi tháng, một người mua ngày 1, một người ngày 10, một người ngày 25.",
        prompt: "Kết quả của họ chênh nhau khoảng bao nhiêu?",
        options: ["Dưới 1%", "Khoảng 10%", "Khoảng 25%"], answer: 0,
        explain: "Chọn ngày nào trong tháng gần như không quan trọng. Thứ tốn kém là để tiền nằm chờ, nên ngày tốt nhất thường là ngày tiền về tài khoản.", src: SRC.best },
    ],
  },
  funds101: {
    title: "Bập bênh lãi suất", code: "C3.2", stage: "C", xp: 15,
    items: [
      { type: "match", kind: "Nối cặp", prompt: "Nối loại quỹ với vai trò trong danh mục",
        left: ["Quỹ tiền tệ", "Quỹ trái phiếu", "Quỹ cân bằng", "Quỹ cổ phiếu"],
        right: ["Tăng trưởng dài hạn, biến động lớn", "Lớp đệm thanh khoản, tiền chờ giải ngân", "Tự tái cân bằng cổ phiếu – trái phiếu", "Thu nhập cố định, bộ giảm chấn"],
        pairs: { 0: 1, 1: 3, 2: 2, 3: 0 }, explain: "Mỗi loại quỹ làm một việc. Danh mục tốt dùng đúng công cụ cho đúng khoản tiền.", src: SRC.bal },
      { type: "select", pattern: "misconception", context: "Anh Bình chuyển 200 triệu từ sổ tiết kiệm sang một quỹ thị trường tiền tệ vì nghe nói quỹ này \"an toàn y như gửi ngân hàng\".",
        prompt: "Điểm khác biệt nào anh cần biết?",
        options: ["Quỹ được bảo hiểm tiền gửi giống sổ tiết kiệm", "Quỹ không được bảo hiểm tiền gửi và lợi suất thay đổi theo lãi suất ngắn hạn", "Quỹ cam kết lợi suất cố định cao hơn tiết kiệm"], answer: 1,
        explain: "Quỹ tiền tệ biến động thấp vì nắm công cụ nợ ngắn hạn chất lượng cao, nhưng không phải tiền gửi: không có bảo hiểm tiền gửi, không cam kết lợi suất.", src: SRC.mmf },
      { type: "select", pattern: "prediction", seesaw: true, context: "Quỹ X nắm chủ yếu trái phiếu còn 1 năm đáo hạn; quỹ Y nắm trái phiếu còn 7 năm. Lãi suất thị trường tăng thêm 1%.",
        prompt: "NAV quỹ nào bị ảnh hưởng nhiều hơn?",
        options: ["Quỹ X, kỳ hạn ngắn", "Quỹ Y, kỳ hạn dài", "Như nhau, vì cùng là trái phiếu"], answer: 1,
        explain: "Lãi suất tăng thì giá trái phiếu giảm, như hai đầu bập bênh. Duration càng dài, giá càng nhạy với lãi suất, NAV càng dao động mạnh.", src: SRC.bond },
      { type: "spot", kind: "Tìm câu sai", prompt: "Bạn của bạn giải thích quỹ trái phiếu. Câu nào sai?",
        sentences: ["Quỹ trái phiếu định giá theo thị trường, nên NAV có thể giảm khi lãi suất tăng.", "Trái phiếu coupon 12% thì quỹ chắc chắn lời 12%/năm.", "Đa dạng hóa giúp giảm rủi ro tập trung vào một tổ chức phát hành."], answer: 1,
        explain: "Coupon là lãi danh nghĩa. Lợi nhuận thực tế (yield) còn phụ thuộc giá mua, biến động lãi suất và rủi ro tín dụng.", src: SRC.bond },
      { type: "order", kind: "Sắp xếp", prompt: "Sắp xếp theo mức biến động thường thấy, từ thấp đến cao",
        items: ["Quỹ thị trường tiền tệ", "Quỹ trái phiếu", "Quỹ cân bằng", "Quỹ cổ phiếu"],
        explain: "Tiền tệ biến động thấp nhất, cổ phiếu cao nhất. Biến động thấp hơn thường đi kèm kỳ vọng sinh lời thấp hơn.", src: SRC.bal },
      { type: "select", pattern: "prediction", context: "Trong một đợt điều chỉnh mạnh, khoản đầu tư quỹ cổ phiếu của chị Nhi giảm 30%: từ 100 triệu còn 70 triệu.",
        prompt: "Quỹ cần tăng bao nhiêu % để chị về lại 100 triệu?",
        options: ["30%", "Khoảng 43%", "Khoảng 70%"], answer: 1,
        explain: "70 triệu phải tăng thêm 30 triệu, tức khoảng 43%. Danh mục chỉ giảm 12,5% thì cần khoảng 14%: hạn chế mức sụt giảm giúp hồi phục nhanh hơn.", src: SRC.bal },
    ],
  },
  case: {
    title: "Hồ sơ: Đã chuyển tiền mà chưa thấy CCQ", code: "A2.4", stage: "A", xp: 15,
    items: [
      { type: "scenario", kind: "Hồ sơ hỗ trợ", prompt: "Anh Minh nên làm gì?", who: "Anh Minh", meta: "Chuyển 20 triệu mua DCDS lúc 9:00 sáng thứ Ba",
        says: "App vẫn chưa thấy chứng chỉ quỹ. Hay anh chuyển lại lần nữa cho chắc?",
        options: ["Chuyển thêm lần nữa, thừa thì quỹ trả lại", "Không chuyển thêm. Lệnh trước 14:30 thứ Ba khớp ở phiên thứ Tư; số CCQ hiện sau khi NAV công bố", "Hủy lệnh rồi đặt lệnh mới"], answer: 1,
        explain: "Lệnh trước 14:30 ngày T-1 khớp theo NAV của ngày T, công bố khoảng 12:00 ngày T. Không đặt lại lệnh hay chuyển thêm chỉ vì trạng thái chưa đổi." },
      { type: "order", kind: "Sắp xếp", prompt: "Sắp xếp các bước xử lý theo đúng thứ tự",
        items: ["Kiểm tra trạng thái lệnh và kỳ giao dịch", "Đối chiếu tài khoản nhận, số tiền, nội dung chuyển khoản", "Gửi mã lệnh và chứng từ qua kênh hỗ trợ chính thức", "Chờ phản hồi, không đặt lại lệnh hay chuyển thêm"],
        explain: "Quy tắc dùng lại được cho mọi sự cố giao dịch: kiểm tra trạng thái, đối chiếu, gửi thông tin qua kênh chính thức, không lặp lại thao tác." },
      { type: "spot", kind: "Tìm câu sai", prompt: "Một người bạn \"có kinh nghiệm\" nhắn cho anh Minh. Câu nào sai?",
        sentences: ["Chuyển tiền thành công ở ngân hàng chưa có nghĩa là lệnh đã được thực hiện.", "Chuyển sai nội dung thì lệnh có thể không khớp và phải yêu cầu hoàn tiền.", "Cứ gửi mã OTP cho nhân viên hỗ trợ để họ kiểm tra nhanh hơn."], answer: 2,
        explain: "Nhân viên hỗ trợ không bao giờ cần PIN hay OTP của bạn. Ai hỏi những thứ này là dấu hiệu lừa đảo." },
      { type: "select", pattern: "decision", context: "Anh Minh soạn email gửi bộ phận hỗ trợ về lệnh mua chưa thấy CCQ. Anh định gửi kèm mọi thứ có trong tay để được xử lý nhanh nhất.",
        prompt: "Thông tin nào anh tuyệt đối không được gửi?",
        options: ["Mã lệnh và thời điểm đặt lệnh", "Mã PIN hoặc OTP", "Ảnh chứng từ chuyển tiền"], answer: 1,
        explain: "Mã lệnh, thời điểm và chứng từ giúp tra soát nhanh. PIN, OTP và mật khẩu thì không ai được hỏi, kể cả nhân viên DC: ai hỏi là dấu hiệu lừa đảo." },
      { type: "select", pattern: "prediction", context: "10:00 thứ Hai, anh Minh đặt lệnh bán DCDS (trước giờ chốt 14:30). DCDS giao dịch mỗi ngày làm việc và trả tiền bán sau 2 ngày làm việc kể từ ngày giao dịch (T+2).",
        prompt: "Tiền bán dự kiến về tài khoản ngày nào?",
        options: ["Thứ Tư, tức 2 ngày sau khi đặt lệnh", "Thứ Năm: lệnh khớp ở phiên thứ Ba, cộng 2 ngày làm việc", "Ngay trong thứ Hai"], answer: 1,
        explain: "Thời gian chờ tính từ ngày giao dịch T, không phải ngày đặt lệnh. DCDS, DCDE trả tiền T+2; DCBF T+5; DCIP ngay trong ngày T; không tính thứ Bảy, Chủ nhật, ngày lễ." },
      { type: "select", pattern: "prediction", context: "Anh Hải mua DCDS cách đây 2 năm 3 tháng. Nay anh bán toàn bộ, tổng tiền bán là 200 triệu đồng, nhận về tài khoản ngân hàng thông thường.",
        prompt: "Anh sẽ chịu những khoản nào?",
        options: ["Phí bán 2,5% như mọi giao dịch bán", "Phí bán 0%; chỉ có thuế TNCN 0,1% (200.000đ) và phí chuyển tiền 6.600đ", "Không mất khoản nào vì đã giữ trên 2 năm"], answer: 1,
        explain: "Giữ trên 2 năm thì phí bán về 0%, nhưng thuế TNCN 0,1% trên tổng tiền bán vẫn áp dụng theo luật. Phí chuyển tiền là 6.600đ dưới 500 triệu, 220.000đ từ 500 triệu trở lên." },
    ],
  },
};
const lessonByCode = (code) => Object.entries(LESSONS).find(([, l]) => l.code === code)?.[0];

/* ---------- simulations ---------- */
const DROPS = [{ s: 16, len: 6, d: 0.26 }, { s: 50, len: 5, d: 0.2 }, { s: 84, len: 6, d: 0.3 }];
const REC = (len) => Math.round(len * 1.8);
const NAV = (() => {
  const out = [];
  for (let m = 0; m < 120; m++) {
    let k = 1;
    for (const { s, len, d } of DROPS) {
      if (m >= s && m < s + len) k *= 1 - (d * (m - s + 1)) / len;
      else if (m >= s + len && m < s + len + REC(len)) k *= 1 - d + (d * (m - s - len + 1)) / REC(len);
    }
    out.push(10000 * Math.pow(1.0105, m) * k * (1 + 0.012 * Math.sin(m * 1.7)));
  }
  return out;
})();
const decisionMonth = (i) => DROPS[i].s + 3;
const recoverMonth = (i) => DROPS[i].s + DROPS[i].len + REC(DROPS[i].len);
/** choices: "keep" | "pause" | "sell" for each drop. */
function simulate(choices) {
  let units = 0, cash = 0, invested = 0;
  for (let m = 0; m < 120; m++) {
    const p = NAV[m];
    cash *= 1.004;
    let holding = false;
    choices.forEach((c, i) => {
      if (c === "keep") return;
      if (m === decisionMonth(i) && c === "sell") { cash += units * p; units = 0; }
      if (m >= decisionMonth(i) && m < recoverMonth(i)) holding = true;
      if (m === recoverMonth(i)) { units += cash / p; cash = 0; }
    });
    invested += 10e6;
    if (holding) cash += 10e6; else units += 10e6 / p;
  }
  return { value: units * NAV[119] + cash, invested };
}
function navChart(upto, opts = {}) {
  const w = 320, h = 130, pad = 6;
  const max = Math.max(...NAV) * 1.05, min = Math.min(...NAV) * 0.9;
  const x = (m) => pad + (m / 119) * (w - 2 * pad), y = (v) => h - pad - ((v - min) / (max - min)) * (h - 2 * pad);
  const pts = NAV.slice(0, upto + 1).map((v, m) => `${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${x(0)},${h - pad} ${pts} ${x(upto)},${h - pad}`;
  const marks = DROPS.map((dp, i) => (decisionMonth(i) <= upto ? `<circle cx="${x(decisionMonth(i))}" cy="${y(NAV[decisionMonth(i)])}" r="5" fill="var(--coral)"/><text x="${x(decisionMonth(i))}" y="${y(NAV[decisionMonth(i)]) + 18}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--coral-deep)">${i + 1}</text>` : "")).join("");
  return `<div class="chartbox"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Biểu đồ NAV minh họa">
    <polygon points="${area}" fill="var(--jade-soft)"/><polyline points="${pts}" fill="none" stroke="var(--jade)" stroke-width="2.5" stroke-linejoin="round"/>${marks}
    <text x="${w - pad}" y="12" text-anchor="end" font-size="10" font-weight="700" fill="var(--muted)">Tháng ${upto + 1}/120 · minh họa</text></svg></div>`;
}

function monthPrices(round) {
  const r = rng(9871 + round * 131);
  const p = [10000 * Math.pow(1.012, round * 3)];
  for (let d = 1; d < 20; d++) p.push(p[d - 1] * (1 + (r() - 0.48) * 0.035));
  return p;
}
function timingChart(prices, picked, revealed, upto = prices.length - 1) {
  const w = 320, h = 140, pad = 8, n = prices.length;
  const max = Math.max(...prices) * 1.01, min = Math.min(...prices) * 0.99;
  const x = (i) => pad + (i / (n - 1)) * (w - 2 * pad), y = (v) => h - 22 - ((v - min) / (max - min)) * (h - 22 - pad);
  const shown = prices.slice(0, upto + 1);
  const pts = shown.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const minI = prices.indexOf(Math.min(...prices));
  const dots = shown.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${picked === i || (!revealed && i === upto) ? 6 : 3.5}" fill="${picked === i ? "var(--sky)" : revealed && i === minI ? "var(--jade)" : revealed && i === 0 ? "var(--gold)" : !revealed && i === upto ? "var(--sky)" : "var(--muted)"}"/>`).join("");
  return `<div class="chartbox"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Giá CCQ trong tháng">
    <rect x="${x(upto) + 4}" y="0" width="${Math.max(0, w - pad - x(upto) - 4)}" height="${h - 20}" rx="6" fill="var(--locked)" opacity="${revealed ? 0 : 0.6}"/>
    <polyline points="${pts}" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/>${dots}
    <text x="${pad}" y="${h - 6}" font-size="10" font-weight="700" fill="var(--muted)">Ngày 1</text><text x="${w - pad}" y="${h - 6}" text-anchor="end" font-size="10" font-weight="700" fill="var(--muted)">Ngày 20</text></svg></div>`;
}

/* ---------- finance ---------- */
const fv = (initial, monthly, rate, months) => { const r = rate / 12; if (!r) return initial + monthly * months; const g = Math.pow(1 + r, months); return initial * g + (monthly * (g - 1)) / r; };
function monthsTo(initial, monthly, rate, target) {
  if (initial >= target) return 0;
  const r = rate / 12;
  if (!r) return monthly > 0 ? (target - initial) / monthly : Infinity;
  const g = (target + monthly / r) / (initial + monthly / r);
  return monthly + initial > 0 && g > 0 ? Math.log(g) / Math.log(1 + r) : Infinity;
}
const dur = (m) => { if (!isFinite(m)) return "không đạt được"; const w = Math.floor(m), y = Math.floor(w / 12), mo = w % 12; return [y ? `${y} năm` : "", mo ? `${mo} tháng` : ""].filter(Boolean).join(" ") || "dưới 1 tháng"; };
