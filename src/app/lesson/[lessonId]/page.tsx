import { notFound, redirect } from "next/navigation";
import { findLesson } from "@content/index";
import { getCompletedLessonIds, getUserState, pathStatus } from "@/db/queries";
import { toClientChallenge } from "@/features/lesson-engine/grade";
import { LessonPlayer } from "@/features/lesson-engine/player";
import { getUserId } from "@/lib/auth";

// Render is side-effect free: the session row is created by the player on mount, so a
// revalidation (or a prefetch) of this route never spawns a new session.
export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const loc = findLesson(lessonId);
  if (!loc) notFound();

  const userId = await getUserId();
  const [{ progress }, completed] = await Promise.all([getUserState(userId), getCompletedLessonIds(userId)]);
  if (pathStatus(loc.segment, completed).get(lessonId) === "locked") redirect("/learn");

  return (
    <LessonPlayer
      key={lessonId}
      lessonId={lessonId}
      lessonTitle={loc.lesson.title}
      challenges={loc.lesson.challenges.map(toClientChallenge)}
      hearts={progress.hearts}
      heartsEnabled={loc.segment.heartsEnabled && loc.lesson.kind !== "profile"}
    />
  );
}
