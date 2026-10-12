import Link from "next/link";
import { redirect } from "next/navigation";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { getUserState } from "@/db/queries";
import { getUserId } from "@/lib/auth";

export default async function WelcomePage() {
  const { user } = await getUserState(await getUserId());
  if (user.onboardedAt) redirect("/learn");

  return (
    <main className="flex flex-1 flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Mascot mood="explore" size={180} />
        <h1 className="text-3xl font-extrabold">Học đầu tư 5 phút mỗi ngày</h1>
        <p className="max-w-xs text-muted">
          Hiểu quỹ của Dragon Capital, biết khẩu vị rủi ro của mình và chọn đúng loại quỹ cho mục tiêu. Mỗi bài là vài câu hỏi
          ngắn, có nguồn rõ ràng.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button asChild><Link href="/onboarding">Bắt đầu</Link></Button>
      </div>
    </main>
  );
}
