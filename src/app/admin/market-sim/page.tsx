import { requireAdmin } from "@/features/admin/auth";
import { MARKET_DROP_OPTIONS, marketDropNudge } from "@/features/notifications/rules";
import { SimForm } from "./sim-form";

export const metadata = { title: "Mô phỏng thị trường giảm" };

export default async function MarketSimPage() {
  await requireAdmin();
  const sample = marketDropNudge(20);
  return (
    <main className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Mô phỏng: thị trường giảm mạnh</h1>
      <p className="rounded-lg bg-gold-soft p-3 text-sm">
        <b>Chỉ là mô phỏng.</b> Ứng dụng chưa có dữ liệu thị trường, nên thông báo này không bao giờ tự gửi theo diễn biến thật.
        Dùng trang này để xem trước lời nhắc hoặc chạy một buổi luyện tập. Mọi tin đều có nhãn &quot;[Mô phỏng]&quot; và chỉ dẫn tới bài
        ôn kế hoạch, không gợi ý mua hay bán.
      </p>
      <div className="rounded-lg border border-line bg-surface p-3 text-sm">
        <p className="font-extrabold">{sample.title}</p>
        <p className="text-muted">{sample.body}</p>
        <p className="text-xs text-muted">Mở bài: {sample.href}</p>
      </div>
      <SimForm options={[...MARKET_DROP_OPTIONS]} />
    </main>
  );
}
