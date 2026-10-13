import type { Metadata } from "next";
import Link from "next/link";
import { getOwnPlan } from "@/features/plan-card/queries";
import { PlanSharePanel } from "@/features/plan-card/share-panel";
import { getUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "Bản kế hoạch đầu tư · Rồng DC Academy", robots: { index: false } };

export default async function PlanPage() {
  const userId = await getUserId();
  const [shown, hidden] = await Promise.all([getOwnPlan(userId, false), getOwnPlan(userId, true)]);
  if (!shown || !hidden) return null;
  return (
    <div className="flex flex-col gap-4 p-4">
      <Link href="/profile" className="text-sm font-bold text-sky">‹ Hồ sơ</Link>
      <h1 className="text-2xl font-extrabold">Bản kế hoạch đầu tư</h1>
      <p className="text-sm text-muted">Tóm tắt hồ sơ rủi ro và mục tiêu của bạn trên một tấm thẻ để lưu lại hoặc gửi người thân.</p>
      <PlanSharePanel shown={shown.card} hidden={hidden.card} token={shown.token} />
    </div>
  );
}
