"use client";

import { useState } from "react";
import { MARKET_SCENARIOS, MARKET_SCENARIOS_SOURCE } from "@content/tools/presets";
import { formatVnd } from "@/lib/utils";
import { mixReturn, rebalance, recoveryNeeded } from "./calc";
import { Bars, Choice, Footnote, Highlight, MillionField, pct, signedPct, Slider } from "./ui";

/** "Hồi phục sau sụt giảm": a fall of X% needs a rise of Y% to break even. */
export function DrawdownTool() {
  const [drop, setDrop] = useState(30);
  const need = recoveryNeeded(drop / 100);
  return (
    <div className="flex flex-col gap-4">
      <Slider id="dd" label="Danh mục giảm" value={drop} min={5} max={80} step={2.5} onChange={setDrop} format={(v) => `−${v.toLocaleString("vi-VN")}%`} />
      <Highlight label="Cần tăng để về lại điểm hòa vốn" value={`+${pct(need, 0)}`} tone={need > 0.5 ? "coral" : "gold"}>
        100 triệu giảm {drop.toLocaleString("vi-VN")}% còn {formatVnd(100e6 * (1 - drop / 100))}; phải tăng {formatVnd(100e6 * (drop / 100))} mới về lại 100 triệu.
      </Highlight>
      <Bars format={(v) => `+${pct(v, 0)}`} rows={[10, 20, 30, 50].map((d) => ({ label: `Giảm ${d}%`, value: recoveryNeeded(d / 100), color: d === Math.round(drop) ? "rgb(var(--coral))" : "rgb(var(--muted))" }))} />
      <p className="text-sm">Mức giảm càng sâu, mức tăng cần để hồi phục càng lớn hơn nhiều. Vì vậy hạn chế mức sụt giảm tối đa giúp danh mục phục hồi nhanh hơn và bạn dễ giữ kỷ luật hơn.</p>
      <Footnote sourceId={MARKET_SCENARIOS_SOURCE}>Phép tính minh họa.</Footnote>
    </div>
  );
}

/** "Danh mục thử nghiệm": a stock/bond mix through the article's three scenarios. */
export function SandboxTool() {
  const [stock, setStock] = useState(50);
  const w = stock / 100;
  const rows = MARKET_SCENARIOS.map((s) => ({ ...s, mix: mixReturn(w, s) }));
  const worst = Math.min(...rows.map((r) => r.mix));
  return (
    <div className="flex flex-col gap-4">
      <Slider id="sb-stock" label="Tỷ trọng cổ phiếu" value={stock} min={0} max={100} step={10} onChange={setStock} format={(v) => `${v}% cổ phiếu · ${100 - v}% trái phiếu`} />
      <div className="overflow-hidden rounded-2xl border-2 border-line">
        <table className="w-full text-sm">
          <thead className="bg-sunken text-left"><tr><th className="p-2">Kịch bản 1 năm</th><th className="p-2 text-right">Cổ phiếu</th><th className="p-2 text-right">Trái phiếu</th><th className="p-2 text-right">Danh mục</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t-2 border-line">
                <td className="p-2 font-bold">{r.label}</td>
                <td className="p-2 text-right tabular-nums">{signedPct(r.stock, 0)}</td>
                <td className="p-2 text-right tabular-nums">{signedPct(r.bond, 0)}</td>
                <td className={`p-2 text-right font-extrabold tabular-nums ${r.mix < 0 ? "text-coral-deep" : "text-jade-deep"}`}>{signedPct(r.mix)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {worst < 0 ? (
        <Highlight label="Trong kịch bản sụt giảm" value={signedPct(worst)} tone="coral">
          Danh mục cần tăng khoảng <b>{pct(recoveryNeeded(-worst), 0)}</b> để hòa vốn. Bạn có giữ được kế hoạch nếu tài khoản giảm chừng này không?
        </Highlight>
      ) : (
        <Highlight label="Kịch bản xấu nhất" value={signedPct(worst)}>Danh mục ít cổ phiếu chịu sụt giảm nhẹ hơn, đổi lại tăng ít hơn khi thị trường tốt.</Highlight>
      )}
      <p className="text-sm">Danh mục 50/50 có thể kém hơn khi thị trường tăng mạnh, nhưng giảm lỗ đáng kể khi thị trường sụt giảm.</p>
      <Footnote sourceId={MARKET_SCENARIOS_SOURCE}>Ba kịch bản minh họa trong bài viết, không phải dự báo.</Footnote>
    </div>
  );
}

/** "Tái cân bằng": a target mix drifts after a scenario year; the trade that restores it. */
export function RebalanceTool() {
  const [amount, setAmount] = useState(100_000_000);
  const [stock, setStock] = useState(60);
  const [sid, setSid] = useState<(typeof MARKET_SCENARIOS)[number]["id"]>("up");
  const s = MARKET_SCENARIOS.find((x) => x.id === sid)!;
  const r = rebalance(amount, stock / 100, s);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <MillionField id="rb-amount" label="Danh mục ban đầu" value={amount} onChange={setAmount} />
        <Slider id="rb-stock" label="Tỷ trọng mục tiêu" value={stock} min={10} max={90} step={10} onChange={setStock} format={(v) => `${v}/${100 - v}`} />
      </div>
      <Choice label="Năm vừa qua thị trường" value={sid} options={MARKET_SCENARIOS} onChange={setSid} />
      <Bars format={formatVnd} rows={[
        { label: "Cổ phiếu", value: r.stock, color: "rgb(var(--coral))" },
        { label: "Trái phiếu", value: r.bond, color: "rgb(var(--sky))" },
      ]} />
      <Highlight label="Tỷ trọng cổ phiếu đã trôi thành" value={pct(r.drifted)} tone={Math.abs(r.drifted - stock / 100) > 0.05 ? "gold" : "jade"}>
        {Math.abs(r.sellStock) < 1
          ? "Danh mục vẫn đúng tỷ trọng mục tiêu."
          : r.sellStock > 0
            ? <>Để về lại {stock}/{100 - stock}: bán khoảng <b>{formatVnd(r.sellStock)}</b> cổ phiếu, mua thêm trái phiếu.</>
            : <>Để về lại {stock}/{100 - stock}: bán khoảng <b>{formatVnd(-r.sellStock)}</b> trái phiếu, mua thêm cổ phiếu.</>}
      </Highlight>
      <p className="text-sm">Tái cân bằng buộc danh mục chốt bớt phần đã tăng và mua thêm phần đang rẻ, theo kỷ luật thay vì cảm xúc. Quỹ cân bằng làm việc này thay bạn.</p>
      <Footnote sourceId={MARKET_SCENARIOS_SOURCE}>Kịch bản minh họa, chưa gồm phí và thuế khi bán.</Footnote>
    </div>
  );
}
