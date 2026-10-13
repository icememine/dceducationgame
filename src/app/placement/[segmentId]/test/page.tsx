import { notFound } from "next/navigation";
import { getSegment } from "@content/index";
import { getUserState } from "@/db/queries";
import { toClientChallenge } from "@/features/lesson-engine/grade";
import { LessonPlayer } from "@/features/lesson-engine/player";
import { placementItems } from "@/features/placement/placement";
import { getUserId } from "@/lib/auth";

export const metadata = { title: "Kiểm tra xếp lớp" };

export default async function PlacementTest({ params }: { params: Promise<{ segmentId: string }> }) {
  const { segmentId } = await params;
  const segment = getSegment(segmentId);
  if (!segment) notFound();
  const { progress } = await getUserState(await getUserId());
  return (
    <LessonPlayer
      key={segmentId}
      source={{ kind: "placement", segmentId }}
      lessonTitle={`Kiểm tra xếp lớp: ${segment.title}`}
      challenges={placementItems(segment).map((i) => toClientChallenge(i.challenge))}
      hearts={progress.hearts}
      heartsEnabled={false}
    />
  );
}
