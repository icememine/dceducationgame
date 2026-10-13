"use client";

import { useState } from "react";
import { AGE_RULE, FEE_RANGES } from "@content/tools/presets";
import { formatVnd } from "@/lib/utils";
import { ageRule, dca, dcaPrices, feeImpact, type DcaPath } from "./calc";
import { Bars, Choice, Footnote, Highlight, MillionField, pct, Slider } from "./ui";

const PATHS = [
  { id: "up", label: "Tăng dần" },
  { id: "dip", label: "Giảm rồi hồi" },
  { id: "flat", label: "Đi ngang" },
] as const;

function PriceChart({ prices }: { prices: number[] }) {
  const w = 320, h = 110, pad = 6;
  const max = Math.max(...prices) * 1.05, min = Math.min(...prices) * 0.95;
  const pts = prices.map((p, i) => `${(pad + (i / (prices.length - 1)) * (w - 2 * pad)).toFixed(1)},${(h - pad - ((p - min) / (max - min)) * (h - 2 * pad)).toFixed(1)}`).join(" ");
  return (
    <div className="rounded-2xl border-2 border-line p-3">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Giá CCQ minh họa theo tháng" className="w-full">
        <polyline points={pts} fill="none" stroke="rgb(var(--sky))" strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      <p className="text-xs font-bold text-muted">Giá CCQ minh họa trong 24 tháng, không phải dữ liệu quỹ thật</p>
    </div>
  );
}

/** "Mô phỏng DCA": monthly investing vs the same total invested at the start. */
export function DcaTool() {
  const [path, setPath] = useState<DcaPath>("dip");
  const [monthly, setMonthly] = useState(5_000_000);
  const prices = dcaPrices(path);
  const r = dca(prices, monthly);
  const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;
  return (
    <div className="flex flex-col gap-4">
      <Choice label="Kịch bản giá" value={path} options={PATHS} onChange={setPath} />
      <PriceChart prices={prices} />
      <MillionField id="dca-monthly" label="Góp mỗi tháng" value={monthly} onChange={setMonthly} />
      <Highlight label="Giá vốn bình quân của bạn" value={vnd(r.avgCost)}>
        Giá trung bình của 24 tháng là {vnd(r.avgPrice)}. Góp đều giúp mua nhiều CCQ hơn khi giá thấp, nên giá vốn thường thấp hơn giá trung bình.
      </Highlight>
      <Bars format={formatVnd} rows={[
        { label: "Đã góp", value: r.invested, color: "rgb(var(--muted))" },
        { label: "Góp đều (DCA)", value: r.value, color: "rgb(var(--jade))" },
        { label: "Một lần từ đầu", value: r.lumpValue, color: "rgb(var(--gold))" },
      ]} />
      <p className="text-sm">
        {r.lumpValue > r.value
          ? "Khi giá tăng gần như liên tục, đầu tư một lần từ đầu cho kết quả cao hơn: DCA không phải lúc nào cũng thắng."
          : "Khi giá giảm hoặc dao động, góp đều giúp bạn mua được nhiều CCQ ở vùng giá thấp."}{" "}
        Vốn từ thu nhập hằng tháng hợp với góp đều; đã có vốn sẵn thì có thể đầu tư một lần hoặc chia đợt.
      </p>
      <Footnote sourceId="amdd-dca">Giá minh họa, chưa gồm phí và thuế. Không phải cam kết lợi nhuận.</Footnote>
    </div>
  );
}

/** "Tác động của phí": same money and gross return, two yearly costs. */
export function FeeImpactTool() {
  const [amount, setAmount] = useState(500_000_000);
  const [years, setYears] = useState(20);
  const [gross, setGross] = useState(12);
  const [low, setLow] = useState(5);
  const [high, setHigh] = useState(20);
  const r = feeImpact({ amount, years, gross: gross / 100, feeLow: low / 1000, feeHigh: high / 1000 });
  const fee = (v: number) => `${(v / 10).toLocaleString("vi-VN")}%/năm`;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <MillionField id="fee-amount" label="Số tiền đầu tư" value={amount} onChange={setAmount} />
        <Slider id="fee-years" label="Thời gian" value={years} min={1} max={30} onChange={setYears} format={(v) => `${v} năm`} />
        <Slider id="fee-gross" label="Lợi nhuận trước phí (giả định)" value={gross} min={4} max={16} onChange={setGross} format={(v) => `${v}%/năm`} />
        <div />
        <Slider id="fee-low" label="Chi phí thấp" value={low} min={1} max={15} onChange={setLow} format={fee} />
        <Slider id="fee-high" label="Chi phí cao" value={high} min={5} max={30} onChange={setHigh} format={fee} />
      </div>
      <Highlight label={`Sau ${years} năm, khoảng chênh`} value={formatVnd(Math.abs(r.gap))} tone={r.gap > 0 ? "gold" : "jade"}>
        Chỉ {((high - low) / 10).toLocaleString("vi-VN")}% mỗi năm, nhưng phí cũng bị lãi kép theo thời gian.
      </Highlight>
      <Bars format={formatVnd} rows={[
        { label: `Phí ${fee(low)}`, value: r.low, color: "rgb(var(--jade))" },
        { label: `Phí ${fee(high)}`, value: r.high, color: "rgb(var(--coral))" },
      ]} />
      <p className="text-sm">
        Khung phổ biến tại Việt Nam: quỹ thụ động khoảng {pct(FEE_RANGES.passive.min)}–{pct(FEE_RANGES.passive.max)}/năm, quỹ chủ động khoảng{" "}
        {pct(FEE_RANGES.active.min)}–{pct(FEE_RANGES.active.max)}/năm. Phí cao hơn chỉ đáng khi kết quả sau phí bù được khoảng chênh.
      </p>
      <Footnote sourceId={FEE_RANGES.sourceId} />
    </div>
  );
}

/** "100 − tuổi": reference equity weight by age. */
export function AgeRuleTool() {
  const [age, setAge] = useState(30);
  const [bold, setBold] = useState(false);
  const base = bold ? AGE_RULE.bold : AGE_RULE.base;
  const equity = ageRule(age, base);
  return (
    <div className="flex flex-col gap-4">
      <Slider id="age" label="Tuổi của bạn" value={age} min={18} max={80} onChange={setAge} format={(v) => `${v} tuổi`} />
      <Choice label="Quy tắc" value={bold ? "bold" : "base"} onChange={(v) => setBold(v === "bold")}
        options={[{ id: "base", label: `${AGE_RULE.base} − tuổi` }, { id: "bold", label: `${AGE_RULE.bold} − tuổi (chấp nhận rủi ro cao hơn)` }]} />
      <div className="overflow-hidden rounded-2xl border-2 border-line">
        <div className="flex h-10 text-sm font-extrabold text-white">
          {equity > 0 && <div className="flex items-center justify-center bg-coral" style={{ width: `${equity * 100}%` }}>{equity >= 0.15 && `Cổ phiếu ${pct(equity, 0)}`}</div>}
          {equity < 1 && <div className="flex items-center justify-center bg-sky" style={{ width: `${(1 - equity) * 100}%` }}>{equity <= 0.85 && `Thu nhập cố định ${pct(1 - equity, 0)}`}</div>}
        </div>
      </div>
      <p className="text-sm">
        {base} − {age} = <b>{pct(equity, 0)}</b> cổ phiếu, phần còn lại là tài sản thu nhập cố định. Đây chỉ là điểm xuất phát: thời gian đến ngày cần
        tiền, khoản dự phòng và khẩu vị rủi ro của bạn quan trọng không kém tuổi.
      </p>
      <Footnote sourceId={AGE_RULE.sourceId}>Quy tắc tham khảo, không phải khuyến nghị phân bổ cho riêng bạn.</Footnote>
    </div>
  );
}
