import Link from "next/link";
import { getSegment } from "@content/index";
import { Disclaimer } from "@/components/disclaimer";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { getGoals, getLatestProfile, getUserState } from "@/db/queries";
import { BADGES, badgeInfo } from "@/features/badges/badges";
import { getUserBadges, syncBadges } from "@/features/badges/sync";
import { getReviewOverview } from "@/features/review/queries";
import { monthsToTarget, formatDuration } from "@/features/goal-planner/finance";
import { profileInfo, type RiskResult } from "@content/risk";
import { ProfileCard, RiskConfirm } from "@/features/risk-profile/risk-result";
import { getUserId } from "@/lib/auth";
import { formatVnd } from "@/lib/utils";

const GOAL_NAME: Record<string, string> = {
  "first-billion": "1 tỷ đầu tiên", education: "Du học cho con", retirement: "Nghỉ hưu", emergency: "Quỹ dự phòng", custom: "Mục tiêu riêng",
};

export default async function ProfilePage() {
  const userId = await getUserId();
  await syncBadges(userId); // picks up milestones reached outside lessons (goal saved, risk confirmed, promotion)
  const [{ user, progress }, risk, goals, review, badges] = await Promise.all([
    getUserState(userId),
    getLatestProfile(userId),
    getGoals(userId),
    getReviewOverview(userId),
    getUserBadges(userId),
  ]);
  const earned = new Set(badges.map((b) => b.badgeId));
  const monthly = badges.filter((b) => b.badgeId.startsWith("monthly:"));
  // Results from before the framework (no framework version) are treated as "not assessed yet".
  const current = risk?.frameworkVersion ? risk : undefined;
  const info = current ? profileInfo(current.finalProfile ?? current.profile) : undefined;
  const fundTypes = getSegment("fund-types");

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center gap-4">
        <Mascot mood={user.avatar} size={72} />
        <div>
          <h1 className="text-2xl font-extrabold">{user.nickname}</h1>
          <p className="text-sm text-muted">{progress.xp} XP · chuỗi {progress.streak} ngày · mục tiêu {user.dailyGoalMinutes} phút/ngày</p>
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border-2 border-line p-4">
        <h2 className="text-lg font-extrabold">Hồ sơ rủi ro</h2>
        {current && !current.decision ? (
          // Assessed but not yet confirmed (framework §5): confirm here.
          <RiskConfirm riskId={current.id} result={current.dimensions as RiskResult} continueHref="/profile" />
        ) : info && current ? (
          <>
            <ProfileCard profile={info.id} decision={current.decision} />
            <p className="text-sm font-bold">Nên học tiếp:</p>
            <ul className="flex flex-wrap gap-2">
              {info.studyUnits.map((id) => (
                <li key={id} className="rounded-full bg-sky-soft px-3 py-1 text-xs font-bold text-sky-deep">{fundTypes?.units.find((u) => u.id === id)?.title ?? id}</li>
              ))}
            </ul>
            <Button variant="ghost" asChild><Link href="/lesson/b1-risk-check">Đánh giá lại</Link></Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Làm bài đánh giá 7 câu, 2–3 phút, trong chặng &quot;Hiểu mình&quot;.</p>
            <Button variant="sky" asChild><Link href="/lesson/b1-risk-check">Tự đánh giá ngay</Link></Button>
          </>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border-2 border-line p-4">
        <h2 className="text-lg font-extrabold">Mục tiêu của tôi</h2>
        {goals.length === 0 && <p className="text-sm text-muted">Chưa có mục tiêu. Thử công cụ lập kế hoạch trong Phần 2 · Đặt mục tiêu.</p>}
        {goals.map((g) => (
          <div key={g.id} className="flex justify-between rounded-xl bg-sunken p-3 text-sm">
            <span className="font-bold">{GOAL_NAME[g.kind] ?? g.kind} · {formatVnd(g.target)}</span>
            <span className="text-muted">{formatVnd(g.monthly)}/tháng · {formatDuration(monthsToTarget(g, g.target))}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border-2 border-line p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Cần ôn lại</h2>
          <span className="text-xs font-bold text-muted">{review.learning} câu đang ôn · {review.retired} câu đã thuộc</span>
        </div>
        {review.recent.length === 0 ? (
          <p className="text-sm text-muted">Chưa có câu nào. Câu bạn trả lời sai sẽ hiện ở đây và quay lại sau 1, 3, 7, 21 ngày.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {review.recent.map((r) => (
              <li key={r.challengeId} className="rounded-xl bg-sunken p-3 text-sm">
                <p className="font-bold">{r.prompt}</p>
                <p className="text-xs text-muted">{r.lessonTitle}</p>
              </li>
            ))}
          </ul>
        )}
        {review.due > 0 && <Button variant="gold" asChild><Link href="/review">Ôn tập ngay · {review.due} câu</Link></Button>}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border-2 border-line p-4">
        <h2 className="text-lg font-extrabold">Huy hiệu · {BADGES.filter((b) => earned.has(b.id)).length}/{BADGES.length}</h2>
        <ul className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => (
            <li key={b.id} className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center ${earned.has(b.id) ? "bg-gold-soft" : "bg-sunken opacity-50 grayscale"}`} title={b.description}>
              <Mascot mood={b.mascot} size={44} />
              <span className="text-xs font-extrabold leading-tight">{b.title}</span>
            </li>
          ))}
          {monthly.map((m) => {
            const info = badgeInfo(m.badgeId)!;
            return (
              <li key={m.badgeId} className="flex flex-col items-center gap-1 rounded-xl bg-violet-soft p-2 text-center" title={info.description}>
                <Mascot mood={info.mascot} size={44} />
                <span className="text-xs font-extrabold leading-tight">{info.title}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Button variant="ghost" asChild><Link href="/profile/plan">Bản kế hoạch đầu tư</Link></Button>
        <Button variant="ghost" asChild><Link href="/profile/settings">Nhắc học & thông báo</Link></Button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-jade-soft p-4">
        <h2 className="text-lg font-extrabold">Sẵn sàng bắt đầu?</h2>
        <p className="text-sm">Mở tài khoản và tìm hiểu tài liệu quỹ chính thức trên DragonX.</p>
        <Button asChild><a href={process.env.NEXT_PUBLIC_DRAGONX_URL ?? "#"} target="_blank" rel="noreferrer">Mở DragonX</a></Button>
        <Disclaimer />
      </section>
    </div>
  );
}
