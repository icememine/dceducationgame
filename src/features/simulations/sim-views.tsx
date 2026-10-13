"use client";

import { Context, type Draft, type ViewProps } from "@/features/lesson-engine/challenge-views";
import { Button } from "@/components/ui/button";
import { cn, formatVnd } from "@/lib/utils";
import {
  decisionMonth,
  DROPS,
  dropAt,
  monthPrices,
  NAV,
  REACTION_MONTHLY,
  REACTION_MONTHS,
  REACTIONS,
  scoreTiming,
  simulateReactions,
  TIMING_DAYS,
  TIMING_ROUNDS,
  type Reaction,
} from "./sims";

const W = 320;
const pct = (x: number, digits = 1) => `${(x * 100).toLocaleString("vi-VN", { maximumFractionDigits: digits })}%`;

function NavChart({ upto }: { upto: number }) {
  const h = 130, pad = 6;
  const max = Math.max(...NAV) * 1.05, min = Math.min(...NAV) * 0.9;
  const x = (m: number) => pad + (m / (REACTION_MONTHS - 1)) * (W - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - 2 * pad);
  const pts = NAV.slice(0, upto + 1).map((v, m) => `${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Biểu đồ NAV minh họa" className="w-full rounded-2xl border border-line bg-surface">
      <polygon points={`${x(0)},${h - pad} ${pts} ${x(upto)},${h - pad}`} fill="rgb(var(--jade-soft))" />
      <polyline points={pts} fill="none" stroke="rgb(var(--jade))" strokeWidth={2.5} strokeLinejoin="round" />
      {DROPS.map((_, i) => decisionMonth(i) <= upto && <circle key={i} cx={x(decisionMonth(i))} cy={y(NAV[decisionMonth(i)])} r={5} fill="rgb(var(--coral))" />)}
      <text x={W - pad} y={12} textAnchor="end" fontSize={10} fontWeight={700} fill="rgb(var(--muted))">Tháng {upto + 1}/{REACTION_MONTHS} · minh họa</text>
    </svg>
  );
}

function Bars({ rows }: { rows: { label: string; value: number; cls: string; text: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-2">
          <span className="font-bold">{r.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-locked"><i className={cn("block h-full rounded-full", r.cls)} style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <b>{r.text}</b>
        </div>
      ))}
    </div>
  );
}

/** "Ba phản ứng khi quỹ giảm": decide at three drawdowns, then compare with the three pure habits. */
export function ReactionSimView({ c, draft, setDraft, locked }: ViewProps<"reaction_sim">) {
  const choices = draft.reactions ?? [];
  const step = choices.length;
  if (step < DROPS.length) {
    const m = decisionMonth(step);
    return (
      <>
        <p className="text-xs font-extrabold uppercase tracking-widest text-coral-deep">Ra quyết định · đợt giảm {step + 1}/{DROPS.length}</p>
        {step === 0 && <Context text={c.context} />}
        <h2 className="text-xl font-extrabold">Tháng {m + 1}: quỹ đã giảm {pct(dropAt(step), 0)} so với đỉnh gần nhất. Bạn làm gì?</h2>
        <NavChart upto={m} />
        <p className="text-sm text-muted">Đã góp {formatVnd((m + 1) * REACTION_MONTHLY)}</p>
        <div className="flex flex-col gap-2">
          {(Object.keys(REACTIONS) as Reaction[]).map((k) => (
            <Button key={k} variant="ghost" disabled={locked} className="normal-case tracking-normal text-ink" onClick={() => setDraft({ reactions: [...choices, k] } satisfies Draft)}>
              {REACTIONS[k]}
            </Button>
          ))}
        </div>
      </>
    );
  }
  const mine = simulateReactions(choices).value;
  const keep = simulateReactions(["keep", "keep", "keep"]).value;
  const pause = simulateReactions(["pause", "pause", "pause"]).value;
  const sell = simulateReactions(["sell", "sell", "sell"]).value;
  return (
    <>
      <p className="text-xs font-extrabold uppercase tracking-widest text-coral-deep">Kết quả sau 10 năm · minh họa</p>
      <h2 className="text-xl font-extrabold">Cùng góp {formatVnd(REACTION_MONTHLY * REACTION_MONTHS)}, bạn có {formatVnd(mine)}</h2>
      <NavChart upto={REACTION_MONTHS - 1} />
      <Bars
        rows={[
          { label: "Bạn", value: mine, cls: "bg-sky", text: formatVnd(mine) },
          { label: "Luôn kiên trì", value: keep, cls: "bg-jade", text: formatVnd(keep) },
          { label: "Luôn tạm dừng", value: pause, cls: "bg-gold", text: formatVnd(pause) },
          { label: "Bán rồi mua lại", value: sell, cls: "bg-coral", text: formatVnd(sell) },
        ]}
      />
      <p className="text-xs text-muted">Lựa chọn của bạn: {choices.map((k) => REACTIONS[k]).join(" → ")}</p>
    </>
  );
}

function TimingChart({ prices, upto, picked, revealed }: { prices: number[]; upto: number; picked?: number; revealed: boolean }) {
  const h = 140, pad = 8, n = prices.length;
  const max = Math.max(...prices) * 1.01, min = Math.min(...prices) * 0.99;
  const x = (i: number) => pad + (i / (n - 1)) * (W - 2 * pad);
  const y = (v: number) => h - 22 - ((v - min) / (max - min)) * (h - 22 - pad);
  const shown = prices.slice(0, upto + 1);
  const low = prices.indexOf(Math.min(...prices));
  const fill = (i: number) => (i === picked ? "rgb(var(--sky))" : revealed && i === low ? "rgb(var(--jade))" : revealed && i === 0 ? "rgb(var(--gold))" : "rgb(var(--ink))");
  return (
    <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Giá CCQ trong tháng" className="w-full rounded-2xl border border-line bg-surface">
      {!revealed && <rect x={x(upto) + 4} y={0} width={Math.max(0, W - pad - x(upto) - 4)} height={h - 20} rx={6} fill="rgb(var(--locked))" opacity={0.6} />}
      <polyline points={shown.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none" stroke="rgb(var(--ink))" strokeWidth={2} strokeLinejoin="round" />
      {shown.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === picked || (!revealed && i === upto) ? 6 : 3.5} fill={fill(i)} />)}
      <text x={pad} y={h - 6} fontSize={10} fontWeight={700} fill="rgb(var(--muted))">Ngày 1</text>
      <text x={W - pad} y={h - 6} textAnchor="end" fontSize={10} fontWeight={700} fill="rgb(var(--muted))">Ngày {TIMING_DAYS}</text>
    </svg>
  );
}

/** "Nhà tiên tri": each month, see prices one day at a time and pick a day to buy. */
export function TimingGameView({ c, draft, setDraft, locked }: ViewProps<"timing_game">) {
  const g = draft.timing ?? { round: 0, day: 0, picks: [], revealed: false };
  const set = (patch: Partial<typeof g>) => setDraft({ timing: { ...g, ...patch } });

  if (g.picks.length === TIMING_ROUNDS && !g.revealed) {
    const s = scoreTiming(g.picks);
    return (
      <>
        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-deep">Kết quả {TIMING_ROUNDS} tháng</p>
        <h2 className="text-xl font-extrabold">Bạn mua {s.vsDayOne >= 0 ? "rẻ hơn" : "đắt hơn"} người mua ngày 1 khoảng {pct(Math.abs(s.vsDayOne))}</h2>
        <Bars
          rows={[
            { label: "Bạn", value: s.mine, cls: "bg-sky", text: `${Math.round(s.mine).toLocaleString("vi-VN")} CCQ` },
            { label: "Mua ngày 1", value: s.dayOne, cls: "bg-gold", text: `${Math.round(s.dayOne).toLocaleString("vi-VN")} CCQ` },
            { label: "Luôn mua đáy", value: s.oracle, cls: "bg-jade", text: `${Math.round(s.oracle).toLocaleString("vi-VN")} CCQ` },
          ]}
        />
        <p className="rounded-2xl bg-sunken p-3 text-sm">Ngay cả người tháng nào cũng mua đúng đáy chỉ hơn người mua ngày 1 khoảng {pct(s.oracleVsDayOne)}.</p>
      </>
    );
  }

  const prices = monthPrices(g.round);
  if (g.revealed) {
    const d = g.picks[g.round];
    const low = prices.indexOf(Math.min(...prices));
    return (
      <>
        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-deep">Trò chơi dữ liệu · tháng {g.round + 1}/{TIMING_ROUNDS}</p>
        <h2 className="text-xl font-extrabold">Bạn mua ngày {d + 1}. Đây là cả tháng:</h2>
        <TimingChart prices={prices} upto={TIMING_DAYS - 1} picked={d} revealed />
        <p className="text-xs text-muted">Xanh dương: ngày bạn mua · vàng: ngày 1 · xanh lá: đáy (ngày {low + 1}).</p>
        <Button variant="sky" disabled={locked} onClick={() => set({ round: g.round + 1 < TIMING_ROUNDS ? g.round + 1 : g.round, day: 0, revealed: false })}>
          {g.round + 1 < TIMING_ROUNDS ? "Tháng tiếp theo" : "Xem kết quả"}
        </Button>
      </>
    );
  }

  const change = g.day ? prices[g.day] / prices[g.day - 1] - 1 : 0;
  return (
    <>
      <p className="text-xs font-extrabold uppercase tracking-widest text-sky-deep">Trò chơi dữ liệu · tháng {g.round + 1}/{TIMING_ROUNDS}</p>
      {g.round === 0 && g.day === 0 && <Context text={c.context} />}
      <h2 className="text-xl font-extrabold">
        Ngày {g.day + 1}: giá {Math.round(prices[g.day]).toLocaleString("vi-VN")} đ{g.day ? ` (${change >= 0 ? "+" : "−"}${pct(Math.abs(change))} hôm qua)` : ""}. Mua 10 triệu hôm nay hay chờ?
      </h2>
      <TimingChart prices={prices} upto={g.day} revealed={false} />
      <p className="text-xs text-muted">Như ngoài đời, bạn không thấy trước những ngày còn lại. Ngày {TIMING_DAYS} là hạn cuối.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button disabled={locked} onClick={() => set({ picks: [...g.picks, g.day], revealed: true })}>Mua hôm nay</Button>
        <Button variant="ghost" disabled={locked || g.day >= TIMING_DAYS - 1} onClick={() => set({ day: g.day + 1 })}>Chờ thêm</Button>
      </div>
    </>
  );
}
