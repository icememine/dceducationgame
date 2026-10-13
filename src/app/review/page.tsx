import { findChallenge } from "@content/index";
import { getUserState } from "@/db/queries";
import { toClientChallenge } from "@/features/lesson-engine/grade";
import { getDueReviewIds } from "@/features/review/queries";
import { getUserId } from "@/lib/auth";
import { ReviewSession } from "./review-session";

export const metadata = { title: "Ôn tập" };

/** Spaced-repetition session: up to 10 questions that are due, from any lesson. */
export default async function ReviewPage() {
  const userId = await getUserId();
  const [{ progress }, ids] = await Promise.all([getUserState(userId), getDueReviewIds(userId)]);
  return <ReviewSession ids={ids} challenges={ids.map((id) => toClientChallenge(findChallenge(id)!.challenge))} hearts={progress.hearts} />;
}
