
/* ---------- lesson engine ---------- */
function startLesson(id) {
  const L = LESSONS[id];
  T.lesson = { id, order: L.items.map((_, i) => i), pos: 0, ans: null, checked: null, mistakes: new Set(), solved: new Set(), t0: Date.now(),
    hearts: S.hearts, match: { sel: null, done: {}, bad: null, errors: 0 }, picked: [], profile: {}, dec: { step: 0, choices: [] }, game: { round: 0, picks: [], picked: null, revealed: false } };
  if (STAGE_META[L.stage].hearts && S.hearts === 0) S.hearts = 5;
  S.screen = "lesson"; T.modal = null; T.popover = null;
}
const curItem = () => LESSONS[T.lesson.id].items[T.lesson.order[T.lesson.pos]];
const usesHearts = () => STAGE_META[LESSONS[T.lesson.id].stage].hearts && !LESSONS[T.lesson.id].profile;

function vItem(q) {
  const L = T.lesson, lock = L.checked ? "disabled" : "";
  const optCls = (i) => (!L.checked || q.answer == null ? "" : i === q.answer ? "right" : L.ans === i ? "wrong" : "");
  const perm = shuffle(q.options || [], LESSONS[L.id].code + (q.prompt || ""));
  switch (q.type) {
    case "story":
      return `<div class="story">${mascot(q.mood || "study", 130)}<h2>${esc(q.title)}</h2><p>${esc(q.body)}</p>${q.src ? `<span class="src">${ic("doc")}Nguồn: <b>${esc(q.src)}</b></span>` : ""}</div>`;
    case "select": case "scenario": {
      const opts = `<div class="opts">${perm.map((orig, k) => `<button class="opt ${optCls(orig)}" data-ans="${orig}" aria-pressed="${L.ans === orig}" ${lock}><span class="key">${String.fromCharCode(65 + k)}</span><span>${esc(q.options[orig])}</span></button>`).join("")}</div>`;
      if (q.type === "scenario") {
        const chat = `<div class="chat"><div class="avatar">${esc(q.who[0])}</div><div class="say"><small>${esc(q.who)} · ${esc(q.meta)}</small>${esc(q.says)}</div></div>`;
        return `<div class="q-kind">${esc(q.kind)}</div><h2>${esc(q.prompt)}</h2>${chat}${opts}`;
      }
      // Quiz formula: context → one question → three options (insight shows after checking).
      return `<div class="q-kind">${esc(PATTERN[q.pattern] || q.kind)}</div><div class="ctx">${esc(q.context)}</div>${q.seesaw ? seesaw() : ""}<h2>${esc(q.prompt)}</h2>${opts}`;
    }
    case "estimate": {
      const v = L.ans ?? q.start;
      const reveal = L.checked ? estimateBars(q) : "";
      return `<div class="q-kind">${esc(PATTERN[q.pattern] || q.kind)}</div><div class="ctx">${esc(q.context)}</div><h2>${esc(q.prompt)}</h2>
        <div class="est"><span class="val">${Number(v).toLocaleString("vi-VN")} ${esc(q.unit)}</span>
        <input id="estIn" type="range" min="${q.min}" max="${q.max}" step="${q.step}" value="${v}" ${lock} aria-label="Ước đoán của bạn">
        <span class="scale"><span>${q.min} ${q.unit}</span><span>${q.max} ${q.unit}</span></span></div>${reveal}`;
    }
    case "match": {
      const Mt = L.match, doneR = Object.values(Mt.done);
      const right = shuffle(q.right, "m" + q.prompt);
      return `<div class="q-kind">${esc(q.kind)}</div><h2>${esc(q.prompt)}</h2><div class="match">
        <div class="col">${q.left.map((t, i) => `<button class="tile ${Mt.done[i] !== undefined ? "ok" : ""} ${Mt.bad && Mt.bad[0] === i ? "bad" : ""}" data-ml="${i}" aria-pressed="${Mt.sel === i}" ${Mt.done[i] !== undefined ? "disabled" : ""}>${esc(t)}</button>`).join("")}</div>
        <div class="col">${right.map((j) => `<button class="tile ${doneR.includes(j) ? "ok" : ""} ${Mt.bad && Mt.bad[1] === j ? "bad" : ""}" data-mr="${j}" ${doneR.includes(j) ? "disabled" : ""}>${esc(q.right[j])}</button>`).join("")}</div></div>
        <p class="src">Chọn một ô bên trái, rồi ô tương ứng bên phải.</p>`;
    }
    case "order": {
      const pool = shuffle(q.items, "o" + q.prompt).filter((i) => !L.picked.includes(i));
      const cls = (i, pos) => (!L.checked ? "" : i === pos ? "right" : "wrong");
      return `<div class="q-kind">${esc(q.kind)}</div><h2>${esc(q.prompt)}</h2>
        <div class="order-slot" aria-label="Thứ tự bạn chọn">${L.picked.map((i, pos) => `<button class="opt ${cls(i, pos)}" data-unpick="${i}" ${lock}><span class="key">${pos + 1}</span><span>${esc(q.items[i])}</span></button>`).join("") || `<span class="src" style="padding:6px">Chạm các mục bên dưới theo thứ tự.</span>`}</div>
        <div class="opts">${pool.map((i) => `<button class="opt" data-pick="${i}" ${lock}><span>${esc(q.items[i])}</span></button>`).join("")}</div>`;
    }
    case "spot":
      return `<div class="q-kind">${esc(q.kind)}</div><h2>${esc(q.prompt)}</h2><div class="spot">${q.sentences.map((s, i) => `<button class="sent ${!L.checked ? "" : i === q.answer ? "wrong" : L.ans === i ? "wrong" : ""}" data-ans="${i}" aria-pressed="${L.ans === i}" ${lock}>${esc(s)}</button>`).join("")}</div><p class="src">Chạm vào câu bạn cho là sai.</p>`;
    case "profile": {
      const sel = L.profile[q.idx];
      return `<div class="q-kind" style="color:var(--jade-deep)">Tự đánh giá · không có đáp án sai</div><h2>${esc(q.prompt)}</h2>
        <div class="opts">${q.options.map((o, i) => `<button class="opt" data-prof="${i}" aria-pressed="${sel === i}"><span class="key">${i + 1}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
    }
    case "decision": return vDecision();
    case "game": return vGame();
  }
  return "";
}
function seesaw() {
  return `<div class="chartbox"><svg viewBox="0 0 320 110" role="img" aria-label="Lãi suất tăng, giá trái phiếu giảm">
    <polygon points="160,92 148,108 172,108" fill="var(--muted)"/>
    <line x1="40" y1="56" x2="280" y2="92" stroke="var(--ink)" stroke-width="6" stroke-linecap="round" transform="rotate(-6 160 74)"/>
    <rect x="34" y="20" width="84" height="30" rx="8" fill="var(--coral)"/><text x="76" y="40" text-anchor="middle" font-size="12" font-weight="800" fill="var(--on-accent)">Lãi suất ↑</text>
    <rect x="206" y="58" width="96" height="30" rx="8" fill="var(--sky)"/><text x="254" y="78" text-anchor="middle" font-size="12" font-weight="800" fill="var(--on-accent)">Giá trái phiếu ↓</text></svg></div>`;
}
function estimateBars(q) {
  const max = Math.max(...q.reveal.map((r) => r[1]));
  return `<div class="compare">${q.reveal.map(([y, v]) => `<div class="cmp-row"><span>Sau ${y} năm</span><span class="track"><i style="width:${(v / max) * 100}%;background:var(--jade)"></i></span><b>${v.toLocaleString("vi-VN")} tỷ</b></div>`).join("")}
    <div class="cmp-row"><span>Bạn đoán</span><span class="track"><i style="width:${Math.min(100, (T.lesson.ans / max) * 100)}%;background:var(--sky)"></i></span><b>${Number(T.lesson.ans).toLocaleString("vi-VN")} tỷ</b></div></div>`;
}
const CHOICE_LABEL = { keep: "Tiếp tục góp đều", pause: "Tạm dừng góp, chờ hồi phục", sell: "Bán hết, khi nào hồi lại mới mua" };
function vDecision() {
  const D = T.lesson.dec;
  if (D.step < 3) {
    const m = decisionMonth(D.step);
    const peak = Math.max(...NAV.slice(0, DROPS[D.step].s + 1));
    const drop = 1 - NAV[m] / peak;
    return `<div class="q-kind">Ra quyết định · đợt giảm ${D.step + 1}/3</div>
      <h2>Tháng ${m + 1}: quỹ đã giảm ${pct(drop, 0)} so với đỉnh gần nhất. Bạn làm gì?</h2>${navChart(m)}
      <div class="tally"><div><b>${vnd((m + 1) * 10e6)}</b><small>Đã góp</small></div><div><b>${D.choices.filter((c) => c === "keep").length}</b><small>Lần kiên trì</small></div><div><b>${D.choices.filter((c) => c !== "keep").length}</b><small>Lần thay đổi</small></div></div>
      <div class="decision-opts">${Object.entries(CHOICE_LABEL).map(([k, v]) => `<button class="opt" data-decide="${k}">${esc(v)}</button>`).join("")}</div>`;
  }
  const mine = simulate(D.choices), keep = simulate(["keep", "keep", "keep"]), pause = simulate(["pause", "pause", "pause"]), sell = simulate(["sell", "sell", "sell"]);
  const max = Math.max(mine.value, keep.value, pause.value, sell.value);
  const row = (l, v, c) => `<div class="cmp-row"><span>${l}</span><span class="track"><i style="width:${(v / max) * 100}%;background:${c}"></i></span><b>${vnd(v)}</b></div>`;
  return `<div class="q-kind">Kết quả sau 10 năm · minh họa</div><h2>Cùng góp ${vnd(1.2e9)}, bạn có ${vnd(mine.value)}</h2>${navChart(119)}
    <div class="compare">${row("Bạn", mine.value, "var(--sky)")}${row("Luôn kiên trì", keep.value, "var(--jade)")}${row("Luôn tạm dừng", pause.value, "var(--gold)")}${row("Luôn bán rồi mua", sell.value, "var(--coral)")}</div>
    <p class="src">Lựa chọn của bạn: ${D.choices.map((c) => esc(CHOICE_LABEL[c])).join(" → ")}</p>`;
}
function vGame() {
  const G = T.lesson.game, ROUNDS = 5;
  if (G.round >= ROUNDS) {
    let mine = 0, sched = 0, oracle = 0;
    G.picks.forEach((d, r) => { const p = monthPrices(r); mine += 10e6 / p[d]; sched += 10e6 / p[0]; oracle += 10e6 / Math.min(...p); });
    const diff = mine / sched - 1, odiff = oracle / sched - 1;
    return `<div class="q-kind">Kết quả 5 tháng</div><h2>Bạn mua ${diff >= 0 ? "rẻ hơn" : "đắt hơn"} người mua ngày 1 khoảng ${pct(Math.abs(diff))}</h2>
      <div class="compare">
        <div class="cmp-row"><span>Bạn</span><span class="track"><i style="width:${(mine / oracle) * 100}%;background:var(--sky)"></i></span><b>${(mine).toFixed(0)} CCQ</b></div>
        <div class="cmp-row"><span>Mua ngày 1</span><span class="track"><i style="width:${(sched / oracle) * 100}%;background:var(--gold)"></i></span><b>${sched.toFixed(0)} CCQ</b></div>
        <div class="cmp-row"><span>Luôn mua đáy</span><span class="track"><i style="width:100%;background:var(--jade)"></i></span><b>${oracle.toFixed(0)} CCQ</b></div></div>
      <div class="ctx">Ngay cả người tháng nào cũng mua đúng đáy chỉ hơn người mua ngày 1 khoảng ${pct(odiff)} trong 5 tháng này. Còn công sức đoán ngày thì tốn hơn nhiều.</div>`;
  }
  const prices = monthPrices(G.round);
  const day = G.day ?? 0;
  if (G.revealed) {
    const d = G.picked, minI = prices.indexOf(Math.min(...prices));
    return `<div class="q-kind">Trò chơi dữ liệu · tháng ${G.round + 1}/${ROUNDS}</div><h2>Bạn mua ngày ${d + 1}. Đây là cả tháng:</h2>
      ${timingChart(prices, d, true, 19)}<p class="src">Chấm xanh dương: ngày bạn mua · vàng: ngày 1 · xanh lá: đáy của tháng.</p>
      <div class="tally"><div><b>${prices[d].toFixed(0)}</b><small>Giá bạn mua</small></div><div><b>${prices[0].toFixed(0)}</b><small>Giá ngày 1</small></div><div><b>${prices[minI].toFixed(0)}</b><small>Đáy (ngày ${minI + 1})</small></div></div>
      <button class="btn sky sm" data-act="nextRound">${G.round + 1 < ROUNDS ? "Tháng tiếp theo" : "Xem kết quả"}</button>`;
  }
  const change = day ? prices[day] / prices[day - 1] - 1 : 0;
  return `<div class="q-kind">Trò chơi dữ liệu · tháng ${G.round + 1}/${ROUNDS}</div>
    <h2>Ngày ${day + 1}: giá ${prices[day].toFixed(0)} đ${day ? ` (${change >= 0 ? "+" : "−"}${pct(Math.abs(change))} hôm qua)` : ""}. Mua 10 triệu hôm nay hay chờ?</h2>
    ${timingChart(prices, null, false, day)}
    <p class="src">Như ngoài đời, bạn không thấy trước những ngày còn lại. Ngày 20 là hạn cuối.</p>
    <div class="grid2"><button class="btn" data-act="buyToday">Mua hôm nay</button><button class="btn ghost" data-act="waitDay" ${day >= 19 ? "disabled" : ""}>Chờ thêm</button></div>`;
}

function vLesson() {
  const L = T.lesson, q = curItem(), meta = LESSONS[L.id];
  const n = meta.items.length, p = Math.round((L.solved.size / n) * 100);
  const retry = L.mistakes.has(L.order[L.pos]) && !L.checked && L.order.indexOf(L.order[L.pos]) !== L.pos;
  return `<div class="lesson-top"><button class="iconbtn" data-modal="exit" aria-label="Thoát bài học">${ic("x")}</button>
      <div class="bar"><i style="width:${Math.max(p, 3)}%"></i></div>
      ${usesHearts() ? `<span class="stat heart">${ic("heart")}${L.hearts}</span>` : `<span class="chip" title="Chặng Hiểu mình không trừ tim">∞</span>`}</div>
    <div class="scroll"><div class="q">${retry ? `<div class="q-kind" style="color:var(--coral-deep)">Làm lại câu sai</div>` : ""}${vItem(q)}</div></div>${vFoot(q)}`;
}
function ready(q) {
  const L = T.lesson;
  switch (q.type) {
    case "story": return true;
    case "match": return Object.keys(L.match.done).length === q.left.length;
    case "order": return L.picked.length === q.items.length;
    case "profile": return L.profile[q.idx] != null;
    case "decision": return L.dec.step >= 3;
    case "game": return L.game.round >= 5;
    case "estimate": return true;
    default: return L.ans != null;
  }
}
function vFoot(q) {
  const L = T.lesson;
  if (!L.checked) {
    const label = q.type === "story" || q.type === "profile" ? "Tiếp tục" : q.type === "decision" || q.type === "game" ? "Xem nhận xét" : "Kiểm tra";
    return `<div class="foot"><button class="btn" data-act="check" ${ready(q) ? "" : "disabled"}>${label}</button></div>`;
  }
  const k = L.checked;
  let head = k === "right" ? ["Chính xác!", "Tuyệt vời!", "Rất tốt!"][L.pos % 3] : k === "wrong" ? "Chưa đúng" : q.type === "estimate" ? "Chưa sát lắm" : "Điều dữ liệu cho thấy";
  let correct = "";
  if (k === "wrong") {
    correct = q.type === "order" ? q.items.join(" → ") : q.type === "spot" ? q.sentences[q.answer] : q.options?.[q.answer] || "";
  }
  let explain = q.explain || "";
  if (q.type === "decision") explain = "Trong mô phỏng này, mỗi lần tạm dừng hoặc bán ra đều bỏ lỡ những tháng giá rẻ nhất. Với dữ liệu thật DCDS 2016–2026: kiên trì ~2,21 tỷ, tạm dừng ~2,16 tỷ, bán rồi mua lại ~1,85 tỷ.";
  if (q.type === "game") explain = "Trên 22 năm dữ liệu DCDS (265 tháng), người tháng nào cũng mua đúng đáy chỉ hơn người mua theo lịch khoảng 2,7%. Thời gian ở trong thị trường quan trọng hơn chọn ngày.";
  const src = q.type === "decision" ? SRC.dcds10 : q.type === "game" ? SRC.petrol + " · " + SRC.best : q.src;
  return `<div class="foot ${k}" role="status">
    <div class="fb-head"><span class="dot">${ic(k === "right" ? "check" : k === "wrong" ? "x" : "sparkle")}</span>${head}</div>
    <div class="fb-body">${correct ? `<p style="margin-bottom:6px">Đáp án đúng: <b>${esc(correct)}</b></p>` : ""}<p><b>Điều cần nhớ:</b> ${esc(explain)}</p></div>
    ${src ? `<div class="src">${ic("doc")}Nguồn: <b>${esc(src)}</b></div>` : ""}
    <button class="btn ${k === "wrong" ? "wrongbtn" : k === "info" ? "infobtn" : ""}" data-act="next">Tiếp tục</button></div>`;
}
function grade() {
  const L = T.lesson, q = curItem(), idx = L.order[L.pos];
  if (q.type === "story" || q.type === "profile") { L.solved.add(idx); return next(); }
  let ok = null;
  if (q.type === "select" || q.type === "scenario" || q.type === "spot") ok = L.ans === q.answer;
  else if (q.type === "order") ok = L.picked.every((v, i) => v === i);
  else if (q.type === "match") { ok = true; if (L.match.errors) L.mistakes.add(idx); }
  else if (q.type === "estimate") { if (L.ans == null) L.ans = q.start; ok = Math.abs(L.ans - q.answer) / q.answer <= q.tol ? true : null; }
  if (ok === null) { L.checked = "info"; L.solved.add(idx); return; }
  L.checked = ok ? "right" : "wrong";
  if (ok) L.solved.add(idx);
  else {
    L.mistakes.add(idx); L.order.push(idx);
    if (usesHearts()) L.hearts = Math.max(0, L.hearts - 1);
    S.weak.unshift({ t: (q.prompt || "").slice(0, 60), s: (q.src || "") + " · vừa sai" });
    S.weak = S.weak.slice(0, 5);
  }
}
function next() {
  const L = T.lesson;
  if (usesHearts() && L.hearts === 0) { S.hearts = 0; T.modal = "hearts"; return; }
  L.pos++; L.ans = null; L.checked = null; L.match = { sel: null, done: {}, bad: null, errors: 0 }; L.picked = [];
  if (L.pos >= L.order.length) finish();
}
function finish() {
  const L = T.lesson, meta = LESSONS[L.id], perfect = L.mistakes.size === 0;
  const secs = Math.round((Date.now() - L.t0) / 1000);
  const already = isDone(meta.code);
  const xp = already ? 5 : meta.xp + (perfect && !meta.profile ? 5 : 0);
  if (!already) S.done.push(meta.code);
  S.xp += xp; S.weekXp += xp; S.hearts = usesHearts() ? L.hearts : S.hearts;
  S.quests.xp += xp; if (perfect && !meta.profile) S.quests.perfect = 1;
  if (!S.studiedToday) { S.streak++; S.studiedToday = true; }
  const graded = meta.items.filter((q) => !["story", "profile", "decision", "game", "estimate"].includes(q.type)).length;
  T.result = { xp, acc: graded ? Math.round(((graded - [...L.mistakes].length) / graded) * 100) : 100, time: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`, perfect, title: meta.title };
  if (meta.profile) { S.risk = scoreRisk(L.profile); S.screen = "riskResult"; T.lesson = null; toast(`+${xp} XP · đã lưu hồ sơ rủi ro`); return; }
  S.screen = "result"; T.lesson = null;
}
function vResult() {
  const R = T.result || { xp: 20, acc: 100, time: "2:41", perfect: true, title: "1 tỷ trong 30 năm" };
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return `<div class="result">${mascot(R.perfect ? "trophy" : "celebrate", 140)}
    <h2>${R.perfect ? "Hoàn hảo, không sai câu nào!" : "Hoàn thành bài học!"}</h2><p style="color:var(--muted)">${esc(R.title)}</p>
    <div class="tiles"><div class="rt g"><div class="lab">Tổng XP</div><div class="val">+${R.xp}</div></div><div class="rt j"><div class="lab">Chính xác</div><div class="val">${R.acc}%</div></div><div class="rt s"><div class="lab">Thời gian</div><div class="val">${R.time}</div></div></div>
    <div class="card" style="margin:0;width:100%;align-items:center"><div style="display:flex;align-items:center;gap:6px;font-family:var(--f-display);font-size:20px;font-weight:800;color:var(--gold-deep)">${ic("flame")}Chuỗi ${S.streak} ngày</div>
      <div class="streak-week">${days.map((d, i) => `<div class="day ${i <= 3 ? "on" : ""}"><i>${i <= 3 ? ic("check", "ico") : ""}</i>${d}</div>`).join("")}</div></div></div>
    <div class="foot"><button class="btn" data-go="learn">Tiếp tục</button><button class="linkbtn" data-tab="ai">Luyện tình huống với AI</button></div><canvas class="confetti" id="confetti"></canvas>`;
}
function confetti() {
  const c = document.getElementById("confetti");
  if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = c.getBoundingClientRect(); c.width = r.width; c.height = r.height; const x = c.getContext("2d");
  const cs = getComputedStyle(document.documentElement); const cols = ["--jade", "--gold", "--sky", "--coral"].map((v) => cs.getPropertyValue(v).trim());
  const P = Array.from({ length: 90 }, () => ({ x: r.width / 2, y: r.height * 0.3, vx: (Math.random() - 0.5) * 9, vy: Math.random() * -9 - 3, s: Math.random() * 6 + 4, c: cols[(Math.random() * 4) | 0], a: Math.random() * 6 }));
  let f = 0;
  (function t() { x.clearRect(0, 0, c.width, c.height); P.forEach((p) => { p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.a += 0.15; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (++f < 110 && document.getElementById("confetti") === c) requestAnimationFrame(t); else x.clearRect(0, 0, c.width, c.height); })();
}

/* ---------- AI: practice + Hỏi Rồng ---------- */
const STARTERS = {
  "panic-spouse": ["Mình đầu tư cho mục tiêu 10 năm, giảm tạm thời chưa phải lỗ thật. Mình giữ kế hoạch nhé.", "Ừ, bán hết đi cho yên tâm.", "Để em xem lại kế hoạch và khoản dự phòng rồi mình bàn tiếp."],
  "scam-call": ["Tôi không đọc OTP. Tôi sẽ cúp máy và gọi lại tổng đài chính thức.", "Mã của em là 482913, em kiểm tra nhanh giúp chị nhé.", "Bạn gửi tôi đường link để tôi tự mở khóa nhé."],
  "gold-neighbour": ["Vàng có chu kỳ, em giữ phân bổ của mình, có thể để một phần nhỏ vào vàng thôi.", "Chuẩn luôn, mai em rút hết quỹ ra mua vàng.", "Anh mua vàng từ năm nào ạ? So sánh cùng giai đoạn mới công bằng."],
  "guaranteed-return": ["Không có khoản đầu tư nào cam kết 20% mà không rủi ro. Tôi không chuyển tiền.", "Ok em, gửi số tài khoản đi, anh chuyển luôn cho kịp.", "Bên em là công ty nào, được UBCKNN cấp phép không?"],
  "tet-bonus": ["Mình để riêng tiền tiêu Tết, phần còn lại đầu tư ngay vào mục tiêu.", "Cứ để đó tính sau, ra Giêng rồi tính.", "Chia đôi: một nửa tiêu, một nửa đầu tư theo kế hoạch."],
};
const OPEN_SCEN = ["panic-spouse", "scam-call", "gold-neighbour", "guaranteed-return", "tet-bonus"];
const GENERIC_STARTERS = ["Mình sẽ xem lại mục tiêu và kế hoạch trước khi quyết định.", "Ừ, làm theo lời bạn luôn cho nhanh.", "Để mình hỏi kênh hỗ trợ chính thức của Dragon Capital."];
const FALLBACK_PERSONA = ["Nhưng lỡ mất thêm thì sao? Người ta ai cũng làm vậy mà.", "Thôi được, nhưng bạn có chắc không? Mình vẫn thấy lo."];

function excerpt(refs) {
  const out = [];
  for (const r of refs) {
    if (r.startsWith("faq:")) DATA.lib.filter((e) => e.from.includes(r)).forEach((e) => out.push(`${e.q} — ${e.a}`));
    else { const title = DATA.sources[r]; DATA.facts.filter((f) => f.startsWith(`[${title}]`)).forEach((f) => out.push(f)); }
  }
  return [...new Set(out)].join("\n");
}
/** Voice guide (content/ai/rong-voice.md) split by "## " sections; edit the file, rebuild the prototype. */
const VOICE = Object.fromEntries(DATA.voice.split(/^## /m).slice(1).map((p) => [p.slice(0, p.indexOf("\n")).trim(), p.slice(p.indexOf("\n") + 1).trim()]));
const voiceFor = (...names) => names.filter((n) => VOICE[n]).map((n) => `${n.toUpperCase()}:\n${VOICE[n]}`).join("\n\n");
const RULES = `QUY TẮC BẮT BUỘC (luôn ưu tiên hơn hướng dẫn giọng điệu):\n${DATA.rules.map((r) => "- " + r).join("\n")}`;
/** Hỏi Rồng's library: the merged Q&A (by category), the fund facts table, and article key points. */
const LIB = () => `THƯ VIỆN HỎI ĐÁP (theo chủ đề):\n${DATA.lib.map((e) => `[${e.c}] ${e.q}\n${e.a}`).join("\n")}\n\nSỐ LIỆU QUỸ (phí, thuế, lịch giao dịch):\n${DATA.fundFacts}\n\nTHUẬT NGỮ:\n${DATA.glossary.join("\n")}\n\nBÀI VIẾT (ý chính):\n${DATA.facts.join("\n")}`;

function openScenario(id) {
  const sc = DATA.scen.find((s) => s.id === id);
  T.ai = { id, turns: [{ role: "them", text: sc.opener }], busy: false, coach: null, draft: "", note: "" };
  S.screen = "aichat";
}
function personaInput(sc) {
  const rules = `Bạn đang đóng một vai trong bài luyện tập của ứng dụng giáo dục đầu tư Rồng DC Academy (Dragon Capital, Việt Nam).
Vai của bạn: ${sc.persona}.
Tình huống: ${sc.title}.
Quy tắc cố định:
- Giữ vai, không nói mình là AI. Nếu người dùng trả lời thuyết phục và an toàn, hãy dịu xuống hoặc hỏi lại một câu hợp lý.
- Không đưa số liệu cụ thể về quỹ hay lợi nhuận.
HƯỚNG DẪN GIỌNG ĐIỆU:
${voiceFor("Nhân vật đóng vai")}
Chỉ viết lời thoại tiếp theo của bạn. Hãy bắt đầu bằng câu mở đầu.`;
  const turns = [{ role: "user", content: rules }];
  for (const t of T.ai.turns) turns.push({ role: t.role === "them" ? "assistant" : "user", content: t.text });
  return turns;
}
async function sendPractice(text) {
  const A = T.ai, sc = DATA.scen.find((s) => s.id === A.id);
  if (!text.trim() || A.busy) return;
  A.turns.push({ role: "me", text: text.trim() }); A.draft = "";
  const mine = A.turns.filter((t) => t.role === "me").length;
  if (mine >= 2) { render(); return coach(); }
  A.busy = true; A.turns.push({ role: "them", text: "…", live: true }); render();
  const live = A.turns[A.turns.length - 1];
  const input = personaInput(sc); input.pop(); // drop the placeholder
  try {
    if (!sample || aiState === "off") throw { code: "offline" };
    const { text: reply } = await sample(input, { modelTier: "quick", cache: false, onText: ({ text: t }) => { live.text = t; render(); } });
    live.text = reply;
  } catch (e) {
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed", "offline"].includes(e.code)) setAi("off");
    live.text = FALLBACK_PERSONA[0];
    A.note = e.code === "rate_limited" ? "AI đang bận, dùng câu soạn sẵn." : aiState === "off" ? "Bản soạn sẵn: AI chưa được bật cho trang này." : "";
  }
  live.live = false; A.busy = false; render();
}
async function coach() {
  const A = T.ai, sc = DATA.scen.find((s) => s.id === A.id);
  A.busy = true; A.coach = { loading: true }; render();
  const transcript = A.turns.map((t) => `${t.role === "them" ? "Vai (AI)" : "Nhà đầu tư"}: ${t.text}`).join("\n");
  const prompt = `Bạn là huấn luyện viên của Rồng DC Academy (ứng dụng giáo dục đầu tư của Dragon Capital). Chấm các câu trả lời của NHÀ ĐẦU TƯ CÁ NHÂN trong bài luyện tình huống.
Tình huống: ${sc.title}
Vai do AI đóng: ${sc.persona}
Câu trả lời tốt sẽ:
${sc.goodResponse.map((g) => "- " + g).join("\n")}
Cờ đỏ cần bắt:
${sc.redFlags.map((g) => "- " + g).join("\n")}
Tài liệu tham chiếu (chỉ dựa vào đây):
${excerpt(sc.sources)}

Hội thoại:
${transcript}

Chấm 3 tiêu chí, mỗi tiêu chí từ 1 đến 5:
- plan: Bám kế hoạch (quay về mục tiêu, thời gian đầu tư, phân bổ thay vì phản ứng cảm xúc)
- knowledge: Hiểu đúng kiến thức
- safety: An toàn và tỉnh táo (không lộ OTP/PIN, không chuyển tiền vào tài khoản cá nhân, không tin cam kết lợi nhuận)
${RULES}
HƯỚNG DẪN GIỌNG ĐIỆU:
${voiceFor("Chung", "Huấn luyện viên")}
"flagged" là các cụm từ NGUYÊN VĂN trong câu của nhà đầu tư có vấn đề (có thể là mảng rỗng).
Chỉ trả lời một JSON đúng dạng: {"plan":4,"knowledge":3,"safety":5,"praise":"…","fix":"…","betterReply":"…","flagged":["…"]}`;
  let result;
  try {
    if (!sample || aiState === "off") throw { code: "offline" };
    const j = await sample.json(prompt, { modelTier: "default" });
    const clamp = (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 3)));
    result = { plan: clamp(j.plan), knowledge: clamp(j.knowledge), safety: clamp(j.safety), praise: String(j.praise || ""), fix: String(j.fix || ""), betterReply: String(j.betterReply || ""), flagged: Array.isArray(j.flagged) ? j.flagged.map(String).filter(Boolean) : [], ai: true };
  } catch (e) {
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed", "offline"].includes(e.code)) setAi("off");
    result = heuristicCoach(sc, A.turns.filter((t) => t.role === "me").map((t) => t.text).join(" "));
  }
  A.coach = result; A.busy = false;
  if (Math.min(result.plan, result.knowledge, result.safety) >= 4) S.quests.practice = 1;
  S.xp += 10; S.weekXp += 10; S.quests.xp += 10;
  render();
}
function heuristicCoach(sc, text) {
  const t = text.toLowerCase();
  const bad = [/\b\d{6}\b/, /otp là/, /bán hết/, /chuyển luôn/, /rút hết/, /để đó tính sau/, /làm theo lời bạn/, /gửi số tài khoản/, /chắc chắn/].filter((r) => r.test(t));
  const good = [/kế hoạch/, /mục tiêu/, /dài hạn/, /chính thức/, /không đọc otp|không chuyển|không cung cấp/, /phân bổ/, /dự phòng/, /chu kỳ/].filter((r) => r.test(t));
  const flagged = text.split(/(?<=[.!?])\s+/).filter((s) => bad.some((r) => r.test(s.toLowerCase())));
  const safety = bad.length ? 2 : 5, plan = Math.min(5, 2 + good.length), knowledge = Math.min(5, 2 + Math.ceil(good.length / 2));
  return { plan, knowledge, safety, flagged, ai: false,
    praise: good.length ? "Bạn đã quay về kế hoạch và mục tiêu của mình thay vì phản ứng theo cảm xúc." : "Bạn đã trả lời được tình huống.",
    fix: bad.length ? `Cờ đỏ: ${sc.redFlags[0]}. ${sc.goodResponse[0]}.` : `Thêm một ý: ${sc.goodResponse[sc.goodResponse.length - 1].toLowerCase()}.`,
    betterReply: STARTERS[sc.id]?.[0] || GENERIC_STARTERS[0] };
}
function vAiList() {
  return `${statusBar()}<div class="scroll">
    <div class="page-h"><span class="chip" style="align-self:flex-start;background:var(--violet-soft);color:var(--violet-deep)">${ic("sparkle", "ico")} AI đóng vai</span><h2>Luyện tình huống</h2><p>AI đóng vai những người và áp lực bạn sẽ gặp. Bạn trả lời bằng lời của mình, huấn luyện viên chấm theo tài liệu Dragon Capital. Không ai bảo bạn mua hay bán gì.</p></div>
    <div class="seg"><button aria-pressed="true">Luyện tình huống</button><button data-go="rong">Hỏi Rồng</button></div>
    ${aiBanner()}
    ${DATA.scen.filter((s) => s.mode === "investor").map((s) => { const open = OPEN_SCEN.includes(s.id) || unlocked(s.unlockAfter); return `<button class="scen ${open ? "" : "locked"}" data-scen="${s.id}"><span class="avatar" style="background:${open ? "var(--coral)" : "var(--locked-deep)"}">${open ? esc(s.persona.trim()[0]) : ic("lock")}</span><span class="body"><b>${esc(s.title)}</b><small>${open ? esc(s.persona) : "Mở sau bài " + esc(s.unlockAfter) + " · bản mẫu cho thử trước"}</small></span><span style="color:var(--muted)">${ic("next")}</span></button>`; }).join("")}
    <div class="section-label" style="margin-top:14px">Chế độ chuyên viên</div>
    ${DATA.scen.filter((s) => s.mode === "staff").map((s) => `<button class="scen" data-scen="${s.id}"><span class="avatar" style="background:var(--sky)">${esc(s.persona.trim()[0])}</span><span class="body"><b>${esc(s.title)}</b><small>Dùng cùng công cụ để đào tạo đội ngũ tư vấn</small></span></button>`).join("")}
    <div style="height:14px"></div></div>${tabBar()}`;
}
const aiBanner = () => (aiState === "on" ? `<div class="banner on">Đã kết nối Claude. Lần đầu gửi, trình xem sẽ hỏi bạn cho phép dùng Claude trên tài khoản của bạn.</div>` : aiState === "off" ? `<div class="banner">AI chưa bật cho trang này. Bạn vẫn thử được luồng với câu trả lời soạn sẵn.</div>` : `<div class="banner">Đang kết nối AI…</div>`);
function pips(v) { return `<span class="pips ${v <= 2 ? "warn" : v === 3 ? "mid" : ""}">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= v ? "on" : ""}"></i>`).join("")}</span>`; }
function markFlags(text, flags) {
  let out = esc(text);
  for (const f of flags || []) { const e = esc(f); if (e && out.includes(e)) out = out.replace(e, `<mark>${e}</mark>`); }
  return out;
}
function vAiChat() {
  const A = T.ai, sc = DATA.scen.find((s) => s.id === A.id);
  const flags = A.coach && !A.coach.loading ? A.coach.flagged : [];
  const thread = A.turns.map((t) => `<div class="msg ${t.role === "me" ? "me" : "them"} ${t.live && t.text === "…" ? "typing" : ""}">${t.role === "me" ? markFlags(t.text, flags) : esc(t.text === "…" ? "Đang nhập…" : t.text)}</div>`).join("");
  const mine = A.turns.filter((t) => t.role === "me").length;
  let coachCard = "";
  if (A.coach?.loading) coachCard = `<div class="coach"><h3>${ic("sparkle")}Huấn luyện viên đang chấm…</h3><p class="src">Đối chiếu câu trả lời với FAQ và bài viết.</p></div>`;
  else if (A.coach) {
    const c = A.coach;
    coachCard = `<div class="coach"><h3>${ic("sparkle")}Nhận xét của huấn luyện viên</h3>
      <div class="score"><span>Bám kế hoạch</span>${pips(c.plan)}<span>Hiểu đúng kiến thức</span>${pips(c.knowledge)}<span>An toàn & tỉnh táo</span>${pips(c.safety)}</div>
      ${c.praise ? `<p style="font-size:14px"><b>Tốt:</b> ${esc(c.praise)}</p>` : ""}${c.fix ? `<p style="font-size:14px"><b>Cần sửa:</b> ${esc(c.fix)}</p>` : ""}
      ${c.betterReply ? `<div class="better"><b>Thử nói:</b> “${esc(c.betterReply)}”</div>` : ""}
      ${c.ai ? "" : `<p class="src">Chấm tự động (không có AI)</p>`}
      <div class="grid2"><button class="btn ghost sm" data-scen="${sc.id}">Làm lại</button><button class="btn sm" data-tab="ai">Tình huống khác</button></div></div>`;
  }
  const starters = (STARTERS[sc.id] || GENERIC_STARTERS);
  const canAct = !A.busy && !A.coach;
  return `<div class="lesson-top"><button class="iconbtn" data-tab="ai" aria-label="Quay lại">${ic("back")}</button><b style="flex:1;font-family:var(--f-display);font-size:17px">${esc(sc.title)}</b></div>
    <div class="persona"><span class="avatar" style="background:${sc.mode === "staff" ? "var(--sky)" : "var(--coral)"}">${esc(sc.persona.trim()[0])}</span><div><b>${esc(sc.persona)}</b><small>${sc.mode === "staff" ? "Chế độ chuyên viên" : "AI đóng vai · bạn trả lời 2 lượt, rồi nhận nhận xét"}</small></div></div>
    <div class="scroll" id="chatScroll">${A.note ? `<div class="banner">${esc(A.note)}</div>` : ""}<div class="thread">${thread}</div>${coachCard}</div>
    ${canAct ? `<div class="starters">${starters.map((s) => `<button data-say="${esc(s)}">${esc(s)}</button>`).join("")}</div>
    <form class="compose" id="practiceForm"><textarea id="practiceIn" rows="1" placeholder="Bạn sẽ trả lời thế nào?" aria-label="Câu trả lời của bạn">${esc(A.draft)}</textarea><button class="btn sky" type="submit" aria-label="Gửi">${ic("send")}</button></form>
    ${mine >= 1 ? `<div style="padding:0 12px 10px"><button class="linkbtn" data-act="coach" style="width:100%">Kết thúc và nhận nhận xét</button></div>` : ""}` : ""}`;
}

const RONG_SUGGEST = ["Bán quỹ sau 2 năm thì mất phí và thuế gì?", "Đặt lệnh lúc mấy giờ thì kịp phiên?", "Bao lâu thì nhận được tiền bán?", "Mình nên mua quỹ nào bây giờ?", "Nhận được OTP lạ thì làm gì?"];
function vRong() {
  const R = T.rong;
  const thread = R.turns.map((t) => {
    if (t.role === "me") return `<div class="msg me">${esc(t.text)}</div>`;
    // Answers never carry a source line; strip one defensively if the model adds it anyway.
    const body = t.text.replace(/\n?\s*Nguồn\s*:[^\n]*\s*$/i, "");
    return `<div class="msg rong ${t.live && !t.text ? "typing" : ""}">${esc(body || "Rồng đang tra thư viện…")}</div>`;
  }).join("");
  return `<div class="lesson-top"><button class="iconbtn" data-go="learn" aria-label="Quay lại">${ic("back")}</button>${mascot("study", 36)}<b style="flex:1;font-family:var(--f-display);font-size:18px">Hỏi Rồng</b></div>
    <div class="scroll" id="chatScroll">${aiBanner()}
      <div class="thread"><div class="msg rong">Chào anh/chị! Rồng trả lời dựa trên thư viện hỏi đáp của Dragon Capital: phí, thuế, lịch giao dịch, tài khoản và kiến thức đầu tư. Rồng không khuyên mua bán quỹ cụ thể, và không bao giờ hỏi PIN hay OTP của bạn.</div>${thread}</div></div>
    ${!R.busy ? `<div class="starters">${RONG_SUGGEST.map((s) => `<button data-ask="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}
    <form class="compose" id="rongForm"><textarea id="rongIn" rows="1" placeholder="Hỏi về quỹ, phí, giao dịch, kế hoạch…" aria-label="Câu hỏi" ${R.busy ? "disabled" : ""}>${esc(R.draft || "")}</textarea><button class="btn" type="submit" aria-label="Gửi" ${R.busy ? "disabled" : ""}>${ic("send")}</button></form>`;
}
function offlineAnswer(q) {
  const words = (s) => s.toLowerCase().normalize("NFC").split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1);
  const qw = new Set(words(q));
  let best = null, bestScore = 0;
  for (const e of DATA.lib) {
    const asked = Math.max(...[e.q, ...(e.alt || [])].map((x) => words(x).filter((w) => qw.has(w)).length));
    const s = asked * 2 + words(e.a).filter((w) => qw.has(w)).length * 0.3;
    if (s > bestScore) { bestScore = s; best = e; }
  }
  const advice = /nên (mua|chọn) quỹ nào|mua quỹ nào/i.test(q) ? "Rồng không chọn quỹ thay anh/chị. " : "";
  if (!best || bestScore < 2) return "Rồng chưa có thông tin cho câu này trong thư viện. Bạn có thể liên hệ CSKH@dragoncapital.com, kèm mã lệnh nếu có (không gửi PIN hay OTP).";
  return `${advice}${best.a.length > 1400 ? best.a.slice(0, 1400).replace(/\s\S*$/, "") + "…" : best.a}\n(Bản soạn sẵn: câu trả lời gần nhất trong thư viện.)`;
}
async function askRong(q) {
  const R = T.rong;
  if (!q.trim() || R.busy) return;
  R.turns.push({ role: "me", text: q.trim() }); R.draft = "";
  const live = { role: "rong", text: "", live: true };
  R.turns.push(live); R.busy = true; render();
  const rules = `Bạn là Rồng, trợ lý học tập của Rồng DC Academy, ứng dụng giáo dục đầu tư của Dragon Capital Việt Nam. Bạn trả lời câu hỏi của nhà đầu tư cá nhân.

${RULES}

HƯỚNG DẪN GIỌNG ĐIỆU:
${voiceFor("Chung", "Hỏi Rồng", "Ví dụ")}

THƯ VIỆN:
${LIB()}`;
  const turns = [{ role: "user", content: rules }];
  R.turns.slice(-7, -1).forEach((t) => turns.push({ role: t.role === "me" ? "user" : "assistant", content: t.text || "…" }));
  try {
    if (!sample || aiState === "off") throw { code: "offline" };
    const { text } = await sample(turns, { cache: false, onText: ({ text: t }) => { live.text = t; render(); } });
    live.text = text;
  } catch (e) {
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed", "offline"].includes(e.code)) setAi("off");
    live.text = e.code === "rate_limited" ? "Rồng đang bận một chút, anh/chị thử lại sau nhé." : offlineAnswer(q);
  }
  live.live = false; R.busy = false; render();
}

/* ---------- modals + toast ---------- */
function vModal() {
  const m = T.modal;
  if (!m) return "";
  if (m === "exit") return `<div class="scrim" data-close><div class="sheet">${mascot("sad", 90)}<h3>Khoan đã, đừng bỏ cuộc!</h3><p>Bạn sẽ mất tiến độ của bài này.</p><div class="wide"><button class="btn" data-close>Học tiếp</button><button class="linkbtn" style="color:var(--coral)" data-go="learn">Kết thúc bài</button></div></div></div>`;
  if (m === "hearts") return `<div class="scrim"><div class="sheet">${mascot("sad", 90)}<h3>Bạn đã hết tim</h3><p>Tim hồi lại 1 tim mỗi 4 giờ. Ôn lại một bài đã học để nhận tim ngay. Rồng DC không bán tim.</p><div class="wide"><button class="btn sky" data-act="refill">Ôn bài cũ · +1 tim</button><button class="linkbtn" data-go="learn">Để sau</button></div></div></div>`;
  if (m === "stages") return `<div class="scrim" data-close><div class="sheet left"><h3>Hành trình của bạn</h3><p>Hiểu mình trước, rồi hiểu quỹ, rồi mới đến sản phẩm DC.</p><div class="wide">${STAGES.map((s, i) => `<button class="row-btn" data-stage="${s.code}" aria-pressed="${S.stage === s.code}">${mascot(["grow", "study", "analyze"][i], 44)}<span style="flex:1"><span>Chặng ${i + 1} · ${esc(s.title)}</span><small>${esc(s.subtitle)}</small><span class="prog"><i style="width:${stageProgress(s.code)}%"></i></span></span></button>`).join("")}</div></div></div>`;
  if (m === "quests") return `<div class="scrim" data-close><div class="sheet left"><h3>Nhiệm vụ hôm nay</h3><p>Làm mới sau 14 giờ.</p><div class="wide">${questRows()}</div>
    <div class="card monthly" style="margin:6px 0 0"><span class="chip" style="background:rgba(255,255,255,.2);color:var(--on-accent);align-self:flex-start">Tháng 10</span><b style="font-family:var(--f-display);font-size:18px">Hoàn thành chặng Hiểu mình</b><span style="font-size:13.5px;opacity:.95">Nhận chứng nhận "Hiểu mình" và huy hiệu Rồng Kỷ Luật.</span></div>
    <button class="btn" data-close>Đã hiểu</button></div></div>`;
  if (m.startsWith("guide:")) {
    const code = m.slice(6), u = STAGES.flatMap((s) => s.units).find((x) => x.code === code);
    return `<div class="scrim" data-close><div class="sheet left"><h3>Sổ tay ${esc(u.code)} · ${esc(u.title)}</h3><p>${esc(u.why)}</p>${u.lessons.map((l) => `<div class="ctx"><b>${esc(l.code)} ${esc(l.title)}</b><br><span style="font-size:13.5px">${esc(l.goal)}</span></div>`).join("")}<button class="btn" data-close>Đã hiểu</button></div></div>`;
  }
  return "";
}
function toast(msg) { T.toast = msg; render(); setTimeout(() => { if (T.toast === msg) { T.toast = null; render(); } }, 2200); }
const vToast = () => (T.toast ? `<div style="position:absolute;left:16px;right:16px;bottom:84px;z-index:30;background:var(--ink);color:var(--surface);border-radius:14px;padding:10px 14px;font-weight:800;font-size:14px;text-align:center" role="status">${esc(T.toast)}</div>` : "");
