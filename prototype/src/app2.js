
/* ---------- state ---------- */
const KEY = "rdc-proto-v1";
const fresh = () => ({
  screen: "welcome", tab: "learn", stage: "B", journey: null, goal: null, nickname: "Rồng Tích Sản",
  xp: 1240, weekXp: 185, streak: 6, hearts: 5, done: [], risk: null, goals: [],
  quests: { xp: 5, perfect: 0, practice: 0 }, weak: [{ t: "Tuổi của từng lô CCQ (FIFO)", s: "Biểu phí & thuế · sai 2 lần" }],
  toolSeg: "planner", aiSeg: "practice",
  planner: { kind: "billion", target: 1000, monthly: 5, initial: 0, rate: 15 },
  cmp: { monthly: 2, rate: 12 },
});
let S = fresh();
try { const saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved && saved.v === 1) S = { ...S, ...saved.s }; } catch {}
const save = () => { try { const { lesson, modal, popover, ai, rong, result, ...keep } = S; localStorage.setItem(KEY, JSON.stringify({ v: 1, s: keep })); } catch {} };
let T = { lesson: null, modal: null, popover: null, ai: null, rong: { turns: [], busy: false }, result: null, toast: null, scrolledPath: false };

/* ---------- AI availability ---------- */
let sample = null;
let aiState = "pending";
function setAi(state) {
  aiState = state;
  const el = document.getElementById("aiStatus");
  if (el) { el.textContent = state === "on" ? "AI: đã kết nối Claude" : state === "off" ? "AI: dùng câu trả lời soạn sẵn" : "AI: đang kết nối…"; el.className = "ai-pill" + (state === "on" ? " on" : ""); }
}

/* ---------- path status ---------- */
const isDone = (code) => S.done.includes(code);
function statusOf(stageCode) {
  const list = flatLessons(stageCode);
  const baseIdx = list.findIndex((l) => l.code === BASE_DONE[stageCode]);
  const st = new Map();
  let current = null;
  list.forEach((l, i) => {
    const done = i < baseIdx || isDone(l.code);
    if (done) st.set(l.code, "done");
    else if (!current) { current = l.code; st.set(l.code, "current"); }
    else st.set(l.code, DEMO[l.code] ? "demo" : "locked");
  });
  return { st, current, list };
}
const stageProgress = (code) => { const { st, list } = statusOf(code); return Math.round(([...st.values()].filter((v) => v === "done").length / list.length) * 100); };
const unlocked = (code) => { for (const s of STAGES) { const { st } = statusOf(s.code); if (st.has(code)) return st.get(code) === "done"; } return false; };

/* ---------- chrome ---------- */
function statusBar() {
  const s = stageOf(S.stage);
  return `<div class="status">
    <button class="course-chip" data-modal="stages" aria-label="Đổi chặng học"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.title)}</span>${ic("chev")}</button>
    <div class="stats">
      ${STAGE_META[S.stage].hearts ? `<span class="stat heart" title="Lượt sai còn lại">${ic("heart")}${S.hearts}</span>` : ""}
      <button class="stat gift" data-modal="quests" title="Nhiệm vụ hôm nay" aria-label="Nhiệm vụ hôm nay">${ic("gift")}</button>
    </div></div>`;
}
const TABS = [["learn", "Học", "home"], ["ai", "Luyện AI", "chat"], ["tools", "Công cụ", "calc"], ["league", "Xếp hạng", "trophy"], ["profile", "Hồ sơ", "user"]];
const tabBar = () => `<nav class="tabs">${TABS.map(([k, l, i]) => `<button class="tab" data-tab="${k}" aria-current="${S.tab === k}">${ic(i)}${l}</button>`).join("")}</nav>`;

/* ---------- onboarding ---------- */
function vWelcome() {
  return `<div class="ob"><div class="welcome">
      ${mascot("explore", 150)}
      <span class="tagline">Tăng trưởng cùng Rồng</span>
      <h2>Học đầu tư 5 phút mỗi ngày</h2>
      <p>Hiểu mình, hiểu quỹ, rồi mới chọn quỹ. Mỗi bài là vài câu hỏi ngắn, có nguồn từ tài liệu của Dragon Capital.</p>
    </div>
    <div class="stack"><button class="btn" data-go="journey">Bắt đầu</button><button class="btn ghost" data-go="learn">Tôi đã có tài khoản DragonX</button></div></div>`;
}
const obTop = (pct, back) => `<div class="ob-top"><button class="iconbtn" data-go="${back}" aria-label="Quay lại">${ic("back")}</button><div class="bar"><i style="width:${pct}%"></i></div></div>`;
const JOURNEYS = [
  ["new", "B", "Tôi mới bắt đầu", "Hiểu bản thân và đặt mục tiêu trước", "explore"],
  ["some", "C", "Tôi biết chút ít về đầu tư", "Tìm hiểu các loại quỹ", "study"],
  ["dc", "A", "Tôi đang đầu tư quỹ DC", "Nắm chắc sản phẩm, phí, giao dịch", "analyze"],
];
function vJourney() {
  return `<div class="ob">${obTop(25, "welcome")}
    <div class="mascot-row">${mascot("explore", 70)}<div class="bubble">Bạn đang ở đâu trên hành trình đầu tư?</div></div>
    <div class="choices">${JOURNEYS.map(([k, , t, d, mood]) => `<button class="choice" data-journey="${k}" aria-pressed="${S.journey === k}">${mascot(mood, 46)}<span>${t}<small>${d}</small></span></button>`).join("")}</div>
    <div class="ob-foot"><button class="btn" data-go="goal" ${S.journey ? "" : "disabled"}>Tiếp tục</button></div></div>`;
}
function vGoal() {
  const goals = [[5, "Nhẹ nhàng"], [10, "Đều đặn"], [15, "Nghiêm túc"], [20, "Tăng tốc"]];
  return `<div class="ob">${obTop(50, "journey")}
    <div class="mascot-row">${mascot("fight", 70)}<div class="bubble">Mỗi ngày bạn muốn học bao lâu?</div></div>
    <div class="choices">${goals.map(([m, l]) => `<button class="choice" data-goal="${m}" aria-pressed="${S.goal === m}"><span>${l}</span><span class="right">${m} phút / ngày</span></button>`).join("")}</div>
    <p class="src" style="margin-top:12px">${ic("clock")} Nhắc học lúc 20:30. Đổi được trong hồ sơ.</p>
    <div class="ob-foot"><button class="btn" data-go="riskintro" ${S.goal ? "" : "disabled"}>Tiếp tục</button></div></div>`;
}
function vRiskIntro() {
  return `<div class="ob">${obTop(75, "goal")}
    <div class="welcome">${mascot("study", 130)}<h2>Trước khi chọn quỹ, hiểu mình đã</h2>
    <p>4 phút tự đánh giá khẩu vị rủi ro. Rồng sẽ gợi ý bạn nên học loại quỹ nào trước.</p></div>
    <div class="stack"><button class="btn" data-start="risk">Tự đánh giá ngay</button><button class="linkbtn" data-go="learn">Để sau</button></div></div>`;
}
function vRiskResult() {
  // Results saved by older scoring (no total) are ignored; the learner can retake the check.
  const r = S.risk && typeof S.risk.total === "number" ? S.risk : null;
  if (!r) return `<div class="scroll"><div class="result">${mascot("explore", 120)}<h2>Chưa có hồ sơ rủi ro</h2><p>Làm bài đánh giá 7 câu, 2–3 phút.</p></div></div><div class="foot"><button class="btn" data-start="risk">Đánh giá ngay</button></div>`;
  const C = DATA.risk.confirmation, name = (id) => PROFILES.find((p) => p.id === id).name;
  if (r.decision) {
    const p = PROFILES[riskBand(r)];
    return `<div class="scroll"><div class="result" style="justify-content:flex-start">
      ${mascot(p.mood, 120)}
      <span class="q-kind">Hồ sơ đầu tư của bạn</span>
      <h2 style="font-size:30px;color:var(--jade-deep)">${p.name}</h2>
      <p>${p.summary}</p>
      ${r.decision === "higher" ? `<p class="disc">Bạn đã chọn mức cao hơn kết quả đánh giá và đã xác nhận.</p>` : r.decision === "lower" ? `<p class="disc">Bạn đã chọn mức thấp hơn kết quả đánh giá.</p>` : ""}
      <div class="scale5">${PROFILES.map((x, i) => `<span class="${i === riskBand(r) ? "on" : ""}">${x.name}</span>`).join("")}</div>
      <div class="card" style="margin:0;width:100%;text-align:left"><b>Lộ trình gợi ý cho bạn</b>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${p.units.map((u) => `<span class="chip" style="background:var(--sky-soft);color:var(--sky-deep)">${esc(u)}</span>`).join("")}</div>
        <span style="font-size:13.5px">Quỹ phù hợp (ví dụ): <b>${p.funds}</b></span></div>
      <p class="disc">${esc(DATA.risk.disclaimer)}</p>
    </div></div>
    <div class="foot"><button class="btn" data-go="learn">Bắt đầu học</button></div>`;
  }
  const max = { A: 5, B: 13, C: 8, D: 4 };
  const lvl = PROFILES.findIndex((p) => p.id === r.profile);
  const pending = T.riskChoice;
  return `<div class="scroll"><div class="result" style="justify-content:flex-start;text-align:left">
    <div class="card" style="margin:0;width:100%"><b style="display:flex;justify-content:space-between">Tổng điểm <span style="font-family:var(--f-display);font-size:22px;color:var(--jade-deep)">${r.total}/30</span></b>
      <div class="dims">${Object.entries(DATA.risk.sections).map(([k, n]) => `<div class="dim"><span>${esc(n)}</span><span class="track"><i style="width:${(r.sections[k] / max[k]) * 100}%"></i></span><b>${r.sections[k]}/${max[k]}</b></div>`).join("")}</div></div>
    ${r.inconsistency ? `<div class="ctx">${esc(r.inconsistency)} <button class="linkbtn" data-start="risk">Làm lại bài</button></div>` : ""}
    <span class="q-kind" style="align-self:center">Hồ sơ đầu tư phù hợp</span>
    <h2 style="font-size:30px;color:var(--jade-deep);align-self:center">${name(r.profile)}</h2>
    ${r.overrides.length ? `<div class="ctx">Theo tổng điểm, bạn ở mức <b>${name(r.scored)}</b>. Rồng điều chỉnh vì:<ul style="margin:6px 0 0 18px">${r.overrides.map((o) => `<li>${esc(o.reason)}</li>`).join("")}</ul></div>` : ""}
    ${r.capacityWarning ? `<div class="ctx" style="background:var(--coral-soft)">${esc(r.capacityWarning)}</div>` : ""}
    <b>${esc(C.question.replace("{profile}", name(r.profile)))}</b>
    ${pending ? `<div class="card" style="margin:0;width:100%"><label style="display:flex;gap:8px;font-size:14px"><input type="checkbox" id="riskAck" ${T.riskAck ? "checked" : ""}> <span>${esc(pending === "higher" ? C.acknowledgement : C.capacityAcknowledgement)}</span></label>
      <button class="btn ${pending === "higher" ? "wrongbtn" : ""}" data-act="riskConfirm" ${T.riskAck ? "" : "disabled"}>Xác nhận</button></div>` : ""}
  </div></div>
  <div class="foot"><div class="stack" style="width:100%">
    <button class="btn" data-riskdec="agree">${esc(C.agree)}</button>
    <div class="grid2"><button class="btn ghost sm" data-riskdec="lower" ${lvl === 0 ? "disabled" : ""}>${esc(C.lower)}</button><button class="btn ghost sm" data-riskdec="higher" ${lvl === PROFILES.length - 1 ? "disabled" : ""}>${esc(C.higher)}</button></div>
  </div></div>`;
}
/** §5: agree keeps, lower/higher move one step; higher (or agree under the capacity warning) needs the checkbox. */
function decideRisk(decision, acknowledged) {
  const r = S.risk, lvl = PROFILES.findIndex((p) => p.id === r.profile);
  const needsAck = decision === "higher" || (!!r.capacityWarning && decision !== "lower");
  if (needsAck && !acknowledged) { T.riskChoice = decision; T.riskAck = false; return render(); }
  r.decision = decision;
  r.final = Math.max(0, Math.min(PROFILES.length - 1, lvl + (decision === "lower" ? -1 : decision === "higher" ? 1 : 0)));
  T.riskChoice = null; T.riskAck = false;
  toast("Đã lưu hồ sơ rủi ro");
}

/* ---------- learn: progress, next lesson, units as lists ---------- */
const ring = (pct) => { const r = 25, c = 2 * Math.PI * r; return `<div class="ringbox"><svg width="60" height="60" viewBox="0 0 60 60" role="img" aria-label="Hoàn thành ${pct}%"><circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--jade)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 30 30)"/></svg><span>${pct}%</span></div>`; };
/** Unit codes are like "B1"; the overline shows "Phần N" and the code. */
function vLearn() {
  const s = stageOf(S.stage);
  const { st, current, list } = statusOf(S.stage);
  const doneN = [...st.values()].filter((v) => v === "done").length;
  const pct = Math.round((doneN / list.length) * 100);
  let nextUnit = null, nextIdx = 0;
  s.units.forEach((u, ui) => u.lessons.forEach((l, li) => { if (l.code === current) { nextUnit = { u, ui }; nextIdx = li; } }));
  const next = current && list.find((l) => l.code === current);
  const nextDemo = next && DEMO[next.code];
  const hero = next ? `<button class="hero" ${nextDemo ? `data-start="${nextDemo}"` : `data-node="${next.code}"`}>
      <span class="over"><span>Tiếp theo · Phần ${nextUnit.ui + 1}, bài ${nextIdx + 1}</span>${mascot(nextUnit.u.mascot, 42, "glass")}</span>
      <h3>${esc(next.title)}</h3>
      <span class="meta"><span>${esc(next.goal || "")}</span><span class="go">${nextDemo ? "Tiếp tục" : "Xem bài"}</span></span></button>` : "";
  const units = s.units.map((u, ui) => {
    const locked = u.lessons.every((l) => st.get(l.code) === "locked");
    const n = u.lessons.filter((l) => st.get(l.code) === "done").length;
    const rows = u.lessons.map((l, li) => {
      const status = st.get(l.code), open = T.popover === l.code, demo = DEMO[l.code];
      const mk = status === "done" ? ic("check") : /Kiểm tra/.test(l.title) && status === "locked" ? ic("lock") : li + 1;
      const right = status === "done" ? "Ôn lại" : status === "current" ? (demo ? "+" + LESSONS[demo].xp + " điểm" : "Tiếp theo") : status === "demo" ? "Bài mẫu" : "";
      let pop = "";
      if (open) {
        const playable = !!demo && status !== "locked";
        pop = `<div class="pop inline">
          <p>${esc(l.goal)}</p>
          ${status === "locked" ? `<button class="btn sm" disabled>Đang khoá</button>` : playable ? `<button class="btn sm" data-start="${demo}">${status === "done" ? "Ôn tập · +5 điểm" : "Bắt đầu · +" + LESSONS[demo].xp + " điểm"}</button>` : `<button class="btn sm" disabled>Chưa có trong bản mẫu</button><p style="font-size:12px">Thử các bài có nhãn "Bài mẫu", hoặc chọn ở danh sách bên trái.</p>`}
        </div>`;
      }
      return `<div><button class="lrow ${status}" data-node="${l.code}" aria-expanded="${open}" aria-label="${esc(l.code + " " + l.title)}"><span class="mk">${mk}</span><span class="tt">${esc(l.title)}</span><span class="rr">${right}</span></button>${pop}</div>`;
    }).join("");
    return `<div class="uhead ${locked ? "locked" : ""}">${mascot(u.mascot, 40, locked ? "plain" : "")}
        <div class="t"><span class="over">Phần ${ui + 1} · ${esc(u.code)}</span><h3>${esc(u.title)}</h3></div>
        <span class="count">${n} / ${u.lessons.length} bài</span>
        <button class="guide" data-guide="${u.code}" aria-label="Sổ tay phần ${esc(u.code)}">${ic("book")}</button></div>
      <div class="ulist">${rows}</div>`;
  }).join("");
  return `${statusBar()}<div class="scroll" id="pathScroll"><div class="learn">
      <div class="progress-card">${ring(pct)}<div><b>${doneN} trên ${list.length} bài</b><small>Chuỗi ${S.streak} ngày · ${S.xp.toLocaleString("vi-VN")} điểm</small></div></div>
      ${hero}${units}</div></div>
    <button class="fab" data-go="rong" aria-label="Hỏi Rồng">${mascot("study", 50)}<span>Hỏi Rồng</span></button>${tabBar()}`;
}

/* ---------- tools ---------- */
const PRESETS = {
  billion: { label: "1 tỷ đầu tiên", target: 1000, monthly: 5, initial: 0, rate: 15, note: "5 triệu/tháng, 15%/năm: khoảng 8 năm 4 tháng (bài 1 tỷ đầu tiên)." },
  edu: { label: "Du học cho con", target: 4200, monthly: 18, initial: 0, rate: 13, note: "4,2 tỷ cho 4 năm đại học; bắt đầu khi con 8 tuổi cần ~18 triệu/tháng (Chiếc vali)." },
  career: { label: "Tự do sự nghiệp", target: 180, monthly: 5, initial: 0, rate: 15, note: "12 tháng chi tiêu, 15 triệu/tháng = 180 triệu; góp 5 triệu mất khoảng 2,5 năm." },
  retire: { label: "Nghỉ hưu", target: 3000, monthly: 5, initial: 0, rate: 12, note: "Mục tiêu minh họa. Càng gần ngày nghỉ hưu, càng giảm tài sản biến động mạnh." },
};
function plannerChart(p) {
  const months = monthsTo(p.initial * 1e6, p.monthly * 1e6, p.rate / 100, p.target * 1e6);
  const years = Math.max(1, Math.min(40, Math.ceil((isFinite(months) ? months : 120) / 12)));
  const pts = Array.from({ length: years }, (_, i) => { const m = (i + 1) * 12; return { y: i + 1, c: p.initial * 1e6 + p.monthly * 1e6 * m, v: fv(p.initial * 1e6, p.monthly * 1e6, p.rate / 100, m) }; });
  const max = Math.max(p.target * 1e6, ...pts.map((d) => d.v));
  const w = 320, h = 140, pad = 6, bw = (w - 2 * pad) / years;
  const ty = h - 18 - (p.target * 1e6 / max) * (h - 26);
  const bars = pts.map((d, i) => { const vh = (d.v / max) * (h - 26), ch = (d.c / max) * (h - 26); const x = pad + i * bw + 1; return `<rect x="${x}" y="${h - 18 - vh}" width="${bw - 2}" height="${vh}" rx="2" fill="var(--jade)"/><rect x="${x}" y="${h - 18 - ch}" width="${bw - 2}" height="${ch}" rx="2" fill="var(--locked-deep)"/>`; }).join("");
  return `<div class="chartbox"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Vốn góp và giá trị minh họa theo năm">${bars}
    <line x1="${pad}" x2="${w - pad}" y1="${ty}" y2="${ty}" stroke="var(--coral)" stroke-dasharray="4 3" stroke-width="1.5"/>
    <text x="${w - pad}" y="${ty - 4}" text-anchor="end" font-size="10" font-weight="800" fill="var(--coral-deep)">Mục tiêu ${vnd(p.target * 1e6)}</text>
    <text x="${pad}" y="${h - 4}" font-size="10" font-weight="700" fill="var(--muted)">Năm 1</text><text x="${w - pad}" y="${h - 4}" text-anchor="end" font-size="10" font-weight="700" fill="var(--muted)">Năm ${years}</text></svg>
    <div class="legend"><span><i style="background:var(--locked-deep)"></i>Tiền bạn góp</span><span><i style="background:var(--jade)"></i>Giá trị minh họa</span></div></div>`;
}
function vTools() {
  const seg = `<div class="seg" role="group" aria-label="Công cụ"><button data-toolseg="planner" aria-pressed="${S.toolSeg === "planner"}">Lập kế hoạch</button><button data-toolseg="compound" aria-pressed="${S.toolSeg === "compound"}">Lãi kép 25 vs 45</button></div>`;
  let body;
  if (S.toolSeg === "planner") {
    const p = S.planner, months = monthsTo(p.initial * 1e6, p.monthly * 1e6, p.rate / 100, p.target * 1e6);
    const contributed = p.initial * 1e6 + p.monthly * 1e6 * (isFinite(months) ? months : 0);
    body = `<div class="card">
      <div class="goal-chips">${Object.entries(PRESETS).map(([k, v]) => `<button data-preset="${k}" aria-pressed="${p.kind === k}">${v.label}</button>`).join("")}</div>
      <div class="grid2">
        <label class="field" for="pTarget">Mục tiêu<span class="inp"><input id="pTarget" type="number" min="1" step="10" value="${p.target}" data-plan="target"><span>triệu</span></span></label>
        <label class="field" for="pMonthly">Mỗi tháng<span class="inp"><input id="pMonthly" type="number" min="0" step="1" value="${p.monthly}" data-plan="monthly"><span>triệu</span></span></label>
        <label class="field" for="pInitial">Đã có sẵn<span class="inp"><input id="pInitial" type="number" min="0" step="10" value="${p.initial}" data-plan="initial"><span>triệu</span></span></label>
        <label class="field" for="pRate">Lợi nhuận giả định: ${p.rate}%/năm<input id="pRate" type="range" min="0" max="20" step="1" value="${p.rate}" data-plan="rate"></label>
      </div>
      <div class="callout"><span class="lab">Thời gian ước tính</span><span class="big">${dur(months)}</span>
        ${isFinite(months) ? `<span style="font-size:13.5px">Bạn góp ${vnd(contributed)}, phần còn lại ${vnd(Math.max(0, p.target * 1e6 - contributed))} đến từ lãi kép.</span>` : `<span style="font-size:13.5px">Tăng số tiền góp mỗi tháng để kế hoạch khả thi.</span>`}</div>
      ${plannerChart(p)}
      <p class="src">${ic("doc")}${esc(PRESETS[p.kind]?.note || "")}</p>
      <button class="btn" data-act="saveGoal">Lưu mục tiêu</button>
      <p class="disc">Lợi nhuận là giả định, không phải cam kết. Kết quả thực tế có thể thấp hơn nhiều. Rà soát kế hoạch ít nhất mỗi năm một lần.</p>
    </div>`;
  } else {
    const c = S.cmp, a = fv(0, c.monthly * 1e6, c.rate / 100, 35 * 12), b = fv(0, c.monthly * 1e6, c.rate / 100, 15 * 12);
    const w = 320, h = 130, pad = 6, max = a;
    const line = (start) => Array.from({ length: 36 }, (_, i) => { const age = 25 + i; const m = Math.max(0, (age - start) * 12); const v = fv(0, c.monthly * 1e6, c.rate / 100, m); return `${(pad + (i / 35) * (w - 2 * pad)).toFixed(1)},${(h - 16 - (v / max) * (h - 26)).toFixed(1)}`; }).join(" ");
    body = `<div class="card">
      <b>An bắt đầu năm 25 tuổi, Bình năm 45 tuổi. Cùng góp đều đến 60 tuổi.</b>
      <div class="grid2">
        <label class="field" for="cMonthly">Mỗi tháng: ${c.monthly} triệu<input id="cMonthly" type="range" min="1" max="20" step="1" value="${c.monthly}" data-cmp="monthly"></label>
        <label class="field" for="cRate">Lợi nhuận giả định: ${c.rate}%/năm<input id="cRate" type="range" min="2" max="16" step="1" value="${c.rate}" data-cmp="rate"></label>
      </div>
      <div class="chartbox"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Giá trị tích lũy theo tuổi">
        <polyline points="${line(25)}" fill="none" stroke="var(--jade)" stroke-width="3"/><polyline points="${line(45)}" fill="none" stroke="var(--coral)" stroke-width="3"/>
        <text x="${pad}" y="${h - 3}" font-size="10" font-weight="700" fill="var(--muted)">25 tuổi</text><text x="${w - pad}" y="${h - 3}" text-anchor="end" font-size="10" font-weight="700" fill="var(--muted)">60 tuổi</text></svg>
        <div class="legend"><span><i style="background:var(--jade)"></i>An (từ 25)</span><span><i style="background:var(--coral)"></i>Bình (từ 45)</span></div></div>
      <div class="compare">
        <div class="cmp-row"><span>An góp ${vnd(c.monthly * 1e6 * 420)}</span><span class="track"><i style="width:100%;background:var(--jade)"></i></span><b>${vnd(a)}</b></div>
        <div class="cmp-row"><span>Bình góp ${vnd(c.monthly * 1e6 * 180)}</span><span class="track"><i style="width:${(b / a) * 100}%;background:var(--coral)"></i></span><b>${vnd(b)}</b></div>
      </div>
      <div class="callout"><span class="lab">Chênh lệch</span><span style="font-size:14px">An chỉ góp nhiều hơn ${(420 / 180).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} lần nhưng có nhiều hơn <b>${(a / b).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} lần</b>. Đó là giá của 20 năm trì hoãn. Nhưng bắt đầu ở tuổi 60 vẫn tốt hơn không bắt đầu.</span></div>
      <p class="src">${ic("doc")}Câu chuyện nhà đầu tư 60 tuổi · DCA là gì</p>
      <p class="disc">Minh họa với lợi nhuận giả định cố định. Thực tế có năm tăng, năm giảm.</p></div>`;
  }
  return `${statusBar()}<div class="scroll"><div class="page-h"><h2>Công cụ</h2><p>Thử với con số của chính bạn. Mọi lợi nhuận đều là giả định.</p></div>${seg}${body}</div>${tabBar()}`;
}

/* ---------- leaderboard ---------- */
const PEOPLE = [["Rồng Tích Sản (bạn)", "explore", null], ["Cá Chép Hóa Rồng", "grow", 412], ["Nhà Đầu Tư Chậm", "study", 366], ["DCA Mỗi Sáng", "save", 301], ["Sói Già Đà Lạt", "analyze", 244], ["Mẹ Bỉm Tích Sản", "gift", 198], ["Kỹ Sư Kiên Nhẫn", "fight", 176], ["Lãi Kép Mỗi Ngày", "trophy", 150], ["Bé Heo Đất", "save", 122], ["Tân Binh 2026", "celebrate", 95]];
function vLeague() {
  const rows = PEOPLE.map(([n, m, x]) => [n, m, x ?? S.weekXp, x == null]).sort((a, b) => b[2] - a[2]);
  const shield = (c, dim) => `<svg class="league ${dim ? "dim" : ""}" viewBox="0 0 42 46" aria-hidden="true"><path d="M21 2 38 8v14c0 11-7.5 18.5-17 22C11.5 40.5 4 33 4 22V8z" fill="${c}"/><path d="M21 12l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="var(--surface)" opacity=".9"/></svg>`;
  const list = rows.map((r, i) => `${i === 5 ? `<li style="padding:0"><div class="zone" style="width:100%;margin:2px 0">Vùng lên hạng</div></li>` : ""}<li class="${r[3] ? "me" : ""}"><span class="rk ${i < 3 ? "top" : ""}">${i + 1}</span>${mascot(r[1], 38)}<span class="who">${esc(r[0])}</span><span class="pts">${r[2]} điểm</span></li>`).join("");
  return `${statusBar()}<div class="scroll">
    <div class="leagues">${shield("var(--gold-deep)", 1)}${shield("var(--muted)", 1)}${shield("var(--gold)", 1)}${shield("var(--jade)")}${shield("var(--sky)", 1)}${shield("var(--violet)", 1)}</div>
    <div class="page-h" style="align-items:center;text-align:center;padding-top:6px"><h2>Hạng Ngọc Bích</h2><p>Top 5 lên Hạng Lam Ngọc · còn 3 ngày · chỉ hiển thị biệt danh</p></div>
    <ul class="lb">${list}</ul><div style="height:16px"></div></div>${tabBar()}`;
}

/* ---------- profile + quests ---------- */
function donut(p, color) { const r = 19, c = 2 * Math.PI * r; return `<svg class="donut" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="${r}" fill="none" stroke="var(--locked)" stroke-width="6"/><circle cx="24" cy="24" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 24 24)"/><text x="24" y="28" text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink)">${p}%</text></svg>`; }
function questRows() {
  const q = S.quests;
  const qbar = (v, m, c) => `<div class="qbar"><i style="width:${Math.min(100, (v / m) * 100)}%;${c ? `background:${c}` : ""}"></i><span>${Math.min(v, m)} / ${m}</span></div>`;
  return [["bolt", "Kiếm 20 XP", q.xp, 20, "var(--gold)"], ["target", "Hoàn thành 1 bài không sai câu nào", q.perfect, 1, "var(--jade)"], ["chat", "Đạt ≥ 4 điểm ở 1 tình huống luyện AI", q.practice, 1, "var(--sky)"]]
    .map(([i, t, v, m, c]) => `<div class="quest"><span class="qi" style="background:${c}">${ic(i)}</span><div class="body">${t}${qbar(v, m)}</div><span style="color:${v >= m ? "var(--gold-deep)" : "var(--locked-deep)"}">${ic("gift")}</span></div>`).join("");
}
function vProfile() {
  const r = S.risk && typeof S.risk.total === "number" ? S.risk : null, p = r ? PROFILES[riskBand(r)] : null;
  return `${statusBar()}<div class="scroll">
    <div class="prof-head">${mascot("explore", 56)}<div><h2 style="font-size:22px">${esc(S.nickname)}</h2><small>Tham gia tháng 10/2026 · mục tiêu ${S.goal || 10} phút/ngày</small></div></div>
    <div class="statgrid">
      <div class="sg"><span style="color:var(--gold-deep)">${ic("flame")}</span><div><b>${S.streak}</b><small>Ngày liên tiếp</small></div></div>
      <div class="sg"><span style="color:var(--sky)">${ic("bolt")}</span><div><b>${S.xp.toLocaleString("vi-VN")}</b><small>Tổng XP</small></div></div>
      <div class="sg"><span style="color:var(--jade)">${ic("shield")}</span><div><b>Ngọc Bích</b><small>Hạng hiện tại</small></div></div>
      <div class="sg"><span style="color:var(--coral)">${ic("target")}</span><div><b>91%</b><small>Chính xác 30 ngày</small></div></div>
    </div>
    <div class="section-label">Khẩu vị rủi ro</div>
    <div class="card">${p ? `<div class="cert">${mascot(p.mood, 52)}<div class="body"><b style="font-size:18px;color:var(--jade-deep)">${p.name}</b><small>${p.summary}</small></div></div><button class="btn ghost sm" data-go="riskResult">Xem chi tiết</button>` : `<p style="font-size:14px">Chưa tự đánh giá. 4 phút để biết nên học loại quỹ nào trước.</p><button class="btn sky sm" data-start="risk">Tự đánh giá ngay</button>`}</div>
    <div class="section-label">Mục tiêu của tôi</div>
    <div class="card">${S.goals.length ? S.goals.map((g) => `<div class="cert">${ic("flag")}<div class="body"><b>${esc(g.label)} · ${vnd(g.target * 1e6)}</b><small>${g.monthly} triệu/tháng · ${dur(monthsTo(g.initial * 1e6, g.monthly * 1e6, g.rate / 100, g.target * 1e6))}</small></div></div>`).join("") : `<p style="font-size:14px;color:var(--muted)">Chưa có mục tiêu. Mở Công cụ → Lập kế hoạch để tạo.</p>`}</div>
    <div class="section-label">Chứng nhận</div>
    <div class="card">${[["Hiểu mình", stageProgress("B"), "var(--jade)", "B"], ["Hiểu quỹ", stageProgress("C"), "var(--sky)", "C"], ["Nhà đầu tư DC hiểu biết", stageProgress("A"), "var(--gold-deep)", "A"]].map(([t, v, c]) => `<div class="cert">${donut(v, c)}<div class="body"><b>${t}</b><small>Hoàn thành chặng và đạt ≥ 80% bài kiểm tra cuối</small></div></div>`).join("")}</div>
    <div class="section-label">Cần ôn lại</div>
    <div class="card">${S.weak.slice(0, 3).map((w) => `<div class="cert"><span style="color:var(--coral)">${ic("flag")}</span><div class="body"><b>${esc(w.t)}</b><small>${esc(w.s)}</small></div></div>`).join("")}<button class="btn sky sm" data-start="case">Ôn tập nhanh 3 phút</button></div>
    <div class="section-label">Nhiệm vụ hôm nay</div>
    <div class="card">${questRows()}</div>
    <div class="section-label">Giao diện</div>
    <div class="card">${themeSwitch()}</div>
    <div class="card" style="background:var(--jade-soft);border-color:var(--jade-soft)"><b>Sẵn sàng bắt đầu?</b><span style="font-size:14px">Tạo mục tiêu \"Đầu tư theo mục tiêu\" và đọc tài liệu quỹ chính thức trên DragonX.</span><button class="btn sm" data-toast="Bản mẫu: nút này mở DragonX">Mở DragonX</button><p class="disc">Nội dung mang tính giáo dục, không phải khuyến nghị đầu tư. Kết quả quá khứ không bảo đảm tương lai.</p></div>
  </div>${tabBar()}`;
}
