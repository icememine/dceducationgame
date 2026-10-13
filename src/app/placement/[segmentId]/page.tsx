import Link from "next/link";
import { notFound } from "next/navigation";
import { getSegment } from "@content/index";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { placementItems } from "@/features/placement/placement";
import { getLatestPlacement } from "@/features/placement/queries";
import { getUserId } from "@/lib/auth";

export const metadata = { title: "Kiểm tra xếp lớp" };

export default async function PlacementIntro({ params }: { params: Promise<{ segmentId: string }> }) {
  const { segmentId } = await params;
  const segment = getSegment(segmentId);
  if (!segment) notFound();
  const last = await getLatestPlacement(await getUserId(), segmentId);
  const n = placementItems(segment).length;
  return (
    <main className="flex flex-1 flex-col justify-between gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-soft"><ClipboardCheck className="h-8 w-8 text-sky" /></span>
        <h1 className="text-2xl font-extrabold">Kiểm tra xếp lớp: {segment.title}</h1>
        <p className="text-muted">
          {n} câu, mỗi phần một câu. Trả lời đúng liên tiếp từ đầu thì các bài của những phần đó sẽ mở sẵn, bạn bắt đầu học từ phần còn chưa chắc.
          Không trừ tim, không làm mất tiến độ đã có.
        </p>
        {last && <p className="text-sm font-bold text-jade-deep">Lần trước: đúng {last.score}/{last.total} câu.</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Button asChild><Link href={`/placement/${segment.id}/test`}>Bắt đầu kiểm tra</Link></Button>
        <Button variant="ghost" asChild><Link href="/learn">Học từ đầu</Link></Button>
      </div>
    </main>
  );
}
