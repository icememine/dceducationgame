import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlanCardByToken } from "@/features/plan-card/queries";
import { PlanCardView } from "@/features/plan-card/plan-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bản kế hoạch đầu tư · Rồng DC Academy",
  description: "Kế hoạch học và đầu tư, thông tin tham khảo, không phải khuyến nghị đầu tư.",
  robots: { index: false, follow: false },
};

/** Public, read-only plan card. Shows only what the card model exposes (no user id). */
export default async function PublicPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card = await getPlanCardByToken(token);
  if (!card) notFound();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PlanCardView card={card} />
      <Link href="/" className="text-center text-sm font-bold text-sky">
        Học đầu tư 5 phút mỗi ngày cùng Rồng DC
      </Link>
    </main>
  );
}
