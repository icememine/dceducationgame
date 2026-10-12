import Link from "next/link";
import { getSegment } from "@content/index";
import { Disclaimer } from "@/components/disclaimer";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { getGoals, getLatestProfile, getUserState } from "@/db/queries";
import { monthsToTarget, formatDuration } from "@/features/goal-planner/finance";
import { PROFILE_INFO, type ProfileId } from "@/features/risk-profile/scoring";
import { getUserId } from "@/lib/auth";
import { formatVnd } from "@/lib/utils";

const GOAL_NAME: Record<string, string> = {
  "first-billion": "1 tỷ đầu tiên", education: "Du học cho con", retirement: "Nghỉ hưu", emergency: "Quỹ dự phòng", custom: "Mục tiêu riêng",
};

export default async function ProfilePage() {
  const userId = await getUserId();
  const [{ user, progress }, risk, goals] = await Promise.all([getUserState(userId), getLatestProfile(userId), getGoals(userId)]);
  const info = risk ? PROFILE_INFO[risk.profile as ProfileId] : undefined;
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
        <h2 className="text-lg font-extrabold">Khẩu vị rủi ro</h2>
        {info ? (
          <>
            <div className="flex items-center gap-3">
              <Mascot mood={info.mascot} size={64} />
              <div>
                <p className="font-display text-xl font-extrabold text-jade-deep">{info.name}</p>
                <p className="text-sm">{info.summary}</p>
              </div>
            </div>
            {risk?.capped && <p className="rounded-xl bg-gold-soft p-3 text-sm">Thời gian đầu tư hoặc khả năng tài chính đang giới hạn mức rủi ro phù hợp với bạn.</p>}
            <p className="text-sm font-bold">Nên học tiếp:</p>
            <ul className="flex flex-wrap gap-2">
              {info.studyUnits.map((id) => (
                <li key={id} className="rounded-full bg-sky-soft px-3 py-1 text-xs font-bold text-sky-deep">{fundTypes?.units.find((u) => u.id === id)?.title ?? id}</li>
              ))}
            </ul>
            <p className="text-sm">Quỹ DC nên đọc tài liệu: <b>{info.relevantFunds.join(", ")}</b></p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Làm bài tự đánh giá 4 phút trong chương trình &quot;Kế hoạch của tôi&quot;.</p>
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
