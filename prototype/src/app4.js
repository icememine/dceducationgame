
/* ---------- render ---------- */
let lastKey = "";
function render() {
  const key = S.screen + ":" + S.tab + ":" + S.stage + ":" + (S.toolSeg || "");
  const prevScroll = app.querySelector(".scroll");
  const top = prevScroll ? prevScroll.scrollTop : 0;
  let html = "";
  switch (S.screen) {
    case "welcome": html = vWelcome(); break;
    case "journey": html = vJourney(); break;
    case "goal": html = vGoal(); break;
    case "riskintro": html = vRiskIntro(); break;
    case "riskResult": html = vRiskResult(); break;
    case "lesson": html = T.lesson ? vLesson() : vLearn(); break;
    case "result": html = vResult(); break;
    case "aichat": html = T.ai ? vAiChat() : vAiList(); break;
    case "rong": html = vRong(); break;
    default: html = { learn: vLearn, ai: vAiList, tools: vTools, league: vLeague, profile: vProfile }[S.tab]();
  }
  app.innerHTML = html + vModal() + vToast();
  renderIndex();
  const sc = app.querySelector(".scroll");
  if (sc && key === lastKey && S.screen !== "lesson") sc.scrollTop = top;
  const chat = document.getElementById("chatScroll");
  if (chat) chat.scrollTop = chat.scrollHeight;
  if (S.screen === "main" && S.tab === "learn" && !T.scrolledPath) {
    T.scrolledPath = true;
    const cur = app.querySelector(".node.current");
    if (cur) cur.scrollIntoView({ block: "center" });
  }
  if (S.screen === "result" && !T.confettiDone) { T.confettiDone = true; confetti(); }
  lastKey = key;
  save();
}
function go(target) {
  T.modal = null; T.popover = null;
  if (target === "learn") { S.screen = "main"; S.tab = "learn"; T.scrolledPath = false; T.lesson = null; }
  else S.screen = target;
  render();
}

/* ---------- flow index ---------- */
const FLOWS = [
  { group: "Bắt đầu", items: [["welcome", "Chào mừng"], ["journey", "Chọn hành trình"], ["goal", "Mục tiêu mỗi ngày"], ["risk", "Tự đánh giá rủi ro"], ["riskResult", "Hồ sơ rủi ro của bạn"]] },
  { group: "Học", items: [["learn", "Lộ trình 3 chặng"], ["lesson:compound", "Bài: Lãi kép, đoán số"], ["lesson:reactions", "Bài: Ba phản ứng khi giảm"], ["lesson:timing", "Bài: Trò chơi Nhà tiên tri"], ["lesson:c1f-nav", "Bài: NAV và NAV/CCQ"], ["lesson:b7a-my-plan", "Bài: Bản kế hoạch của tôi"], ["lesson:case", "Bài: Hồ sơ hỗ trợ"], ["result", "Hoàn thành bài"], ["hearts", "Hết tim"]] },
  { group: "Công cụ", items: [["planner", "Lập kế hoạch mục tiêu"], ["compoundTool", "Lãi kép: 25 hay 45 tuổi"]] },
  { group: "AI", items: [["ai", "Luyện tình huống AI"], ["aichat", "Tình huống: bán hết khi giảm", "sub"], ["rong", "Hỏi Rồng"]] },
  { group: "Thi đua & hồ sơ", items: [["quests", "Nhiệm vụ hôm nay"], ["league", "Giải đấu tuần"], ["profile", "Hồ sơ & chứng nhận"]] },
];
function isCurrent(k) {
  if (k.startsWith("lesson:")) return S.screen === "lesson" && T.lesson?.id === k.slice(7) && !T.modal;
  if (k === "risk") return S.screen === "lesson" && T.lesson?.id === "risk";
  if (k === "hearts") return T.modal === "hearts";
  if (k === "quests") return T.modal === "quests";
  if (k === "planner" || k === "compoundTool") return S.screen === "main" && S.tab === "tools" && S.toolSeg === (k === "planner" ? "planner" : "compound");
  if (["learn", "ai", "league", "profile"].includes(k)) return S.screen === "main" && S.tab === k && !T.modal;
  return S.screen === k && !T.modal;
}
function renderIndex() {
  let n = 0;
  document.getElementById("flowIndex").innerHTML = FLOWS.map((g) => `<div class="group"><div class="group-label">${g.group}</div>${g.items.map(([k, l, sub]) => `<button class="flow-link${sub ? " sub" : ""}" data-jump="${k}" aria-current="${isCurrent(k)}"><span class="n">${sub ? "↳" : ++n}</span>${l}</button>`).join("")}</div>`).join("");
}
document.getElementById("flowIndex").addEventListener("click", (e) => {
  const b = e.target.closest("[data-jump]");
  if (!b) return;
  const k = b.dataset.jump;
  T.modal = null; T.popover = null;
  if (k.startsWith("lesson:")) { const id = k.slice(7); S.stage = LESSONS[id].stage; startLesson(id); }
  else if (k === "risk") startLesson("risk");
  else if (k === "hearts") { S.stage = "C"; startLesson("c1f-nav"); T.lesson.hearts = 0; S.hearts = 0; T.modal = "hearts"; }
  else if (k === "result") { T.result = T.result || null; T.confettiDone = false; S.screen = "result"; }
  else if (k === "planner" || k === "compoundTool") { S.screen = "main"; S.tab = "tools"; S.toolSeg = k === "planner" ? "planner" : "compound"; }
  else if (k === "aichat") openScenario("panic-spouse");
  else if (k === "quests") { if (S.screen !== "main") { S.screen = "main"; S.tab = "learn"; } T.modal = "quests"; }
  else if (["learn", "ai", "league", "profile"].includes(k)) { S.screen = "main"; S.tab = k; if (k === "learn") T.scrolledPath = false; }
  else S.screen = k;
  render();
});
document.getElementById("resetBtn").addEventListener("click", () => {
  try { localStorage.removeItem(KEY); } catch {}
  S = fresh(); T = { lesson: null, modal: null, popover: null, ai: null, rong: { turns: [], busy: false }, result: null, toast: null, scrolledPath: false };
  render();
});

/* ---------- events ---------- */
app.addEventListener("click", (e) => {
  const t = e.target.closest("button,[data-close],[data-day]");
  if (!t) { if (T.popover) { T.popover = null; render(); } return; }
  const d = t.dataset;
  if (d.close !== undefined && (t.tagName === "BUTTON" || e.target === t)) { T.modal = null; render(); return; }
  if (d.close !== undefined) return;
  if (d.go) return go(d.go);
  if (d.tab) { S.screen = "main"; S.tab = d.tab; T.modal = null; T.popover = null; T.ai = d.tab === "ai" ? null : T.ai; if (d.tab === "learn") T.scrolledPath = false; return render(); }
  if (d.journey) { S.journey = d.journey; S.stage = JOURNEYS.find((j) => j[0] === d.journey)[1]; return render(); }
  if (d.goal) { S.goal = +d.goal; return render(); }
  if (d.start) { S.stage = LESSONS[d.start].stage; startLesson(d.start); return render(); }
  if (d.modal) { T.modal = d.modal; return render(); }
  if (d.guide) { T.modal = "guide:" + d.guide; return render(); }
  if (d.stage) { S.stage = d.stage; T.modal = null; S.screen = "main"; S.tab = "learn"; T.scrolledPath = false; return render(); }
  if (d.node) { T.popover = T.popover === d.node ? null : d.node; return render(); }
  if (d.scen) { openScenario(d.scen); return render(); }
  if (d.say) return sendPractice(d.say);
  if (d.ask) return askRong(d.ask);
  if (d.toolseg) { S.toolSeg = d.toolseg; return render(); }
  if (d.preset) { const p = PRESETS[d.preset]; S.planner = { kind: d.preset, target: p.target, monthly: p.monthly, initial: p.initial, rate: p.rate }; return render(); }
  if (d.riskdec) return decideRisk(d.riskdec, false);
  if (d.toast) return toast(d.toast);
  const L = T.lesson;
  if (L && S.screen === "lesson") {
    const q = curItem();
    if (d.ans !== undefined && !L.checked) { L.ans = +d.ans; return render(); }
    if (d.prof !== undefined) { L.profile[q.idx] = +d.prof; return render(); }
    if (d.ml !== undefined && !L.checked) { L.match.sel = +d.ml; L.match.bad = null; return render(); }
    if (d.mr !== undefined && !L.checked) {
      const j = +d.mr, sel = L.match.sel;
      if (sel == null) return;
      if (q.pairs[sel] === j) { L.match.done[sel] = j; L.match.sel = null; L.match.bad = null; }
      else { L.match.bad = [sel, j]; L.match.errors++; L.match.sel = null; setTimeout(() => { if (T.lesson === L) { L.match.bad = null; render(); } }, 450); }
      return render();
    }
    if (d.pick !== undefined && !L.checked) { L.picked.push(+d.pick); return render(); }
    if (d.unpick !== undefined && !L.checked) { L.picked = L.picked.filter((x) => x !== +d.unpick); return render(); }
    if (d.decide) { L.dec.choices.push(d.decide); L.dec.step++; return render(); }
  }
  switch (d.act) {
    case "check": grade(); return render();
    case "next": next(); return render();
    case "buyToday": { const G = L.game; G.picked = G.day ?? 0; G.revealed = true; G.picks.push(G.picked); return render(); }
    case "waitDay": { const G = L.game; G.day = Math.min(19, (G.day ?? 0) + 1); return render(); }
    case "nextRound": { const G = L.game; G.round++; G.day = 0; G.revealed = false; G.picked = null; return render(); }
    case "riskConfirm": return decideRisk(T.riskChoice, T.riskAck);
    case "refill": T.modal = null; S.hearts = 1; L.hearts = 1; next(); toast("+1 tim nhờ ôn bài cũ"); return render();
    case "coach": return coach();
    case "saveGoal": S.goals.unshift({ label: PRESETS[S.planner.kind]?.label || "Mục tiêu riêng", ...S.planner }); S.goals = S.goals.slice(0, 4); return toast("Đã lưu mục tiêu vào hồ sơ");
  }
});
app.addEventListener("input", (e) => {
  const L = T.lesson;
  if (e.target.id === "estIn" && L) { L.ans = Number(e.target.value); const v = app.querySelector(".est .val"); if (v) v.textContent = `${L.ans.toLocaleString("vi-VN")} ${curItem().unit}`; }
  if (e.target.id === "practiceIn" && T.ai) T.ai.draft = e.target.value;
  if (e.target.id === "rongIn") T.rong.draft = e.target.value;
  if (e.target.id === "riskAck") { T.riskAck = e.target.checked; render(); }
});
app.addEventListener("change", (e) => {
  const k = e.target.dataset;
  if (k.plan) { S.planner[k.plan] = Math.max(0, Number(e.target.value) || 0); render(); }
  if (k.cmp) { S.cmp[k.cmp] = Number(e.target.value); render(); }
});
app.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "practiceForm") sendPractice(document.getElementById("practiceIn").value);
  if (e.target.id === "rongForm") askRong(document.getElementById("rongIn").value);
});
app.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && (e.target.id === "practiceIn" || e.target.id === "rongIn")) { e.preventDefault(); e.target.form.requestSubmit(); return; }
  if (e.key === "Enter" && S.screen === "lesson" && e.target.tagName !== "TEXTAREA") {
    const b = app.querySelector('[data-act="check"]:not([disabled]),[data-act="next"]');
    if (b) { e.preventDefault(); b.click(); }
  }
});

/* ---------- boot ---------- */
if (S.screen === "lesson" || S.screen === "aichat" || S.screen === "result") { S.screen = "main"; }
render();
(async () => {
  try { if (window.claude && typeof window.claude.use === "function") sample = await window.claude.use("sample"); } catch { sample = null; }
  setAi(sample ? "on" : "off");
  render();
})();
})();
