import { setActiveSegment } from "@/actions/user";
import { getSegmentProgress, getUserState } from "@/db/queries";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

const BLURB: Record<string, string> = {
  "dc-funds": "Sản phẩm, giao dịch, hiệu suất và an toàn tài khoản trên DragonX.",
  "my-plan": "Tự đánh giá khẩu vị rủi ro, đặt mục tiêu và xây thói quen đầu tư đều đặn.",
  "fund-types": "Tiền tệ, trái phiếu, cổ phiếu, chỉ số, cân bằng: mỗi loại dùng khi nào.",
};

export default async function SegmentsPage() {
  const userId = await getUserId();
  const [{ activeSegment }, progress] = await Promise.all([getUserState(userId), getSegmentProgress(userId)]);
  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-2xl font-extrabold">Chọn chương trình học</h1>
      {progress.map(({ segment, done, total }) => (
        <form key={segment.id} action={setActiveSegment.bind(null, segment.id)}>
          <button
            className={cn(
              "flex w-full flex-col gap-2 rounded-2xl border-2 border-b-4 p-4 text-left",
              segment.id === activeSegment.id ? "border-jade bg-jade-soft" : "border-line bg-surface",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="rounded-lg bg-jade px-1.5 py-0.5 text-xs font-extrabold text-white">{segment.code}</span>
              <span className="font-display text-lg font-extrabold">{segment.title}</span>
            </span>
            <span className="text-sm text-muted">{BLURB[segment.id] ?? segment.subtitle}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-locked">
              <i className="block h-full rounded-full bg-jade" style={{ width: `${(done / total) * 100}%` }} />
            </span>
            <span className="text-xs font-bold text-muted">{done} / {total} bài</span>
          </button>
        </form>
      ))}
    </div>
  );
}
