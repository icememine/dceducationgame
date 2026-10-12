import Link from "next/link";
import { getSegment } from "@content/index";
import { Disclaimer } from "@/components/disclaimer";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { getGoals, getLatestProfile, getUserState } from "@/db/queries";
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
  const [{ user, progress }, risk, goals] = await Promise.all([getUserState(userId), getLatestProfile(userId), getGoals(userId)]);
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

      <section className="flex flex-col gap-3 rounded-2xl bg-jade-soft p-4">
        <h2 className="text-lg font-extrabold">Sẵn sàng bắt đầu?</h2>
        <p className="text-sm">Mở tài khoản và tìm hiểu tài liệu quỹ chính thức trên DragonX.</p>
        <Button asChild><a href={process.env.NEXT_PUBLIC_DRAGONX_URL ?? "#"} target="_blank" rel="noreferrer">Mở DragonX</a></Button>
        <Disclaimer />
      </section>
    </div>
  );
}
