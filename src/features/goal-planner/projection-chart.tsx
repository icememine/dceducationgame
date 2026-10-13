import { formatVnd } from "@/lib/utils";
import { projection, type PlanInput } from "./finance";

/** Yearly bars: what you put in (grey) inside what it could become (jade). */
export function ProjectionChart({ plan, years, target }: { plan: PlanInput; years: number; target?: number }) {
  const pts = projection(plan, years);
  const max = Math.max(...pts.map((p) => p.value), target ?? 0, 1);
  return (
    <>
      <div className="flex h-28 items-end gap-1" role="img" aria-label="Biểu đồ tích lũy theo năm">
        {pts.slice(1).map((p) => (
          <div key={p.year} className="relative flex-1" title={`Năm ${p.year}: ${formatVnd(p.value)}`}>
            <div className="w-full rounded-t bg-jade" style={{ height: `${(p.value / max) * 112}px` }} />
            <div className="absolute bottom-0 w-full rounded-t bg-locked-deep/70" style={{ height: `${(p.contributed / max) * 112}px` }} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        <span className="font-bold text-locked-deep">■</span> Vốn góp · <span className="font-bold text-jade-deep">■</span> Giá trị minh họa. Giả định, không phải cam kết.
      </p>
    </>
  );
}
