import Link from "next/link";
import { MascotIcon } from "@/components/mascot";
import { getSegment } from "@content/index";
import { Disclaimer } from "@/components/disclaimer";
import { ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGoals, getLatestProfile, getSegmentProgress, getUserState } from "@/db/queries";
import { BADGES, badgeInfo } from "@/features/badges/badges";
import { getUserBadges, syncBadges } from "@/features/badges/sync";
import { getReviewOverview } from "@/features/review/queries";
import { monthsToTarget, formatDuration } from "@/features/goal-planner/finance";
import { profileInfo, type RiskResult } from "@content/risk";
import { RiskConfirm, RiskScale } from "@/features/risk-profile/risk-result";
import { getUserId } from "@/lib/auth";
import { formatVnd } from "@/lib/utils";

const GOAL_NAME: Record<string, string> = {
  "first-billion": "1 tỷ đầu tiên", education: "Du học cho con", retirement: "Nghỉ hưu", emergency: "Quỹ dự phòng", custom: "Mục tiêu riêng",
};

export default async function ProfilePage() {
  const userId = await getUserId();
  await syncBadges(userId); // picks up milestones reached outside lessons (goal saved, risk confirmed, promotion)
  const [{ user, progress }, risk, goals, review, badges, segProgress] = await Promise.all([
    getUserState(userId),
    getLatestProfile(userId),
    getGoals(userId),
    getReviewOverview(userId),
    getUserBadges(userId),
    getSegmentProgress(userId),
  ]);
  const lessonsDone = segProgress.reduce((n, s) => n + s.done, 0);
  const lessonsTotal = segProgress.reduce((n, s) => n + s.total, 0);
  const plan = goals[0];
  const earned = new Set(badges.map((b) => b.badgeId));
  const monthly = badges.filter((b) => b.badgeId.startsWith("monthly:"));
  // Results from before the framework (no framework version) are treated as "not assessed yet".
  const current = risk?.frameworkVersion ? risk : undefined;
  const info = current ? profileInfo(current.finalProfile ?? current.profile) : undefined;
  const fundTypes = getSegment("fund-types");

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-8 pt-4">
      <div className="flex items-center gap-3.5">
        <MascotIcon mood={user.avatar} size={52} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-bold">{user.nickname}</h1>
          <p className="text-[13px] text-muted">Mục tiêu học {user.dailyGoalMinutes} phút mỗi ngày</p>
        </div>
        <Link href="/profile/settings" aria-label="Cài đặt" className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-line bg-surface"><Settings className="h-[18px] w-[18px]" /></Link>
      </div>

      {plan ? (
        <section className="flex flex-col gap-3.5 rounded-2xl border border-hero-line bg-hero p-[18px] text-hero-ink">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-hero-accent">Kế hoạch · {GOAL_NAME[plan.kind] ?? plan.kind}</span>
            <Link href="/profile/plan" className="text-[13px] font-semibold text-hero-accent">Xem bản kế hoạch</Link>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[32px] font-bold leading-tight tracking-tight tabular">{formatVnd(plan.target)}</span>
            <span className="text-sm text-hero-muted">sau {formatDuration(monthsToTarget(plan, plan.target))}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-0.5 rounded-xl bg-black/20 p-3"><span className="text-xs text-hero-muted">Góp mỗi tháng</span><span className="text-[17px] font-bold tabular">{formatVnd(plan.monthly)}</span></div>
            <div className="flex flex-col gap-0.5 rounded-xl bg-black/20 p-3"><span className="text-xs text-hero-muted">Lợi suất giả định</span><span className="text-[17px] font-bold tabular">{Math.round(plan.annualReturn * 100)}% / năm</span></div>
          </div>
          <span className="text-xs text-hero-muted">Minh hoạ theo giả định, không phải cam kết lợi nhuận.</span>
        </section>
      ) : (
        <Link href="/tools?tool=planner" className="flex items-center gap-3 rounded-2xl border border-hero-line bg-hero p-[18px] text-hero-ink">
          <span className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-hero-accent">Kế hoạch đầu tư</span>
            <span className="text-[17px] font-bold">Chưa có mục tiêu</span>
            <span className="text-[13px] text-hero-muted">Đặt một mục tiêu để xem cần góp bao nhiêu mỗi tháng.</span>
          </span>
          <ChevronRight className="h-5 w-5 text-hero-muted" />
        </Link>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Hồ sơ rủi ro</span>
        {current && !current.decision ? (
          // Assessed but not yet confirmed (framework §5): confirm here.
          <RiskConfirm riskId={current.id} result={current.dimensions as RiskResult} continueHref="/profile" />
        ) : info && current ? (
          <>
            <div className="flex items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[22px] font-bold leading-tight">{info.name}</span>
                <span className="text-[13px] text-muted">{info.summary}</span>
              </div>
              <RiskScale profile={info.id} className="w-[100px]" />
            </div>
            {current.decision === "higher" && <p className="text-xs text-muted">Bạn đã chọn mức cao hơn kết quả đánh giá và đã xác nhận.</p>}
            {current.decision === "lower" && <p className="text-xs text-muted">Bạn đã chọn mức thấp hơn kết quả đánh giá.</p>}
            <p className="text-[13px]">Nên học tiếp:</p>
            <ul className="flex flex-wrap gap-2">
              {info.studyUnits.map((id) => (
                <li key={id} className="rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky-deep">{fundTypes?.units.find((u) => u.id === id)?.title ?? id}</li>
              ))}
            </ul>
            <Link href="/lesson/b1-risk-check" className="self-start text-[13px] font-semibold text-jade">Đánh giá lại</Link>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Làm bài đánh giá 7 câu, 2–3 phút, trong chặng &quot;Hiểu mình&quot;.</p>
            <Button asChild><Link href="/lesson/b1-risk-check">Tự đánh giá ngay</Link></Button>
          </>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        {[
          ["Bài học", <>{lessonsDone}<span className="text-xs font-medium text-muted">/{lessonsTotal}</span></>],
          ["Chuỗi ngày", progress.streak],
          ["Điểm", progress.xp.toLocaleString("vi-VN")],
        ].map(([label, value]) => (
          <div key={label as string} className="flex flex-col gap-0.5 rounded-[14px] border border-line bg-surface p-3">
            <span className="text-[11px] text-muted">{label}</span>
            <span className="text-xl font-bold tabular">{value}</span>
          </div>
        ))}
      </section>

      {goals.length > 1 && (
        <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Các mục tiêu khác</span>
          {goals.slice(1).map((g) => (
            <div key={g.id} className="flex justify-between gap-2 rounded-xl bg-sunken p-3 text-sm">
              <span className="font-semibold">{GOAL_NAME[g.kind] ?? g.kind} · {formatVnd(g.target)}</span>
              <span className="text-muted">{formatVnd(g.monthly)}/tháng · {formatDuration(monthsToTarget(g, g.target))}</span>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Cần ôn lại</h2>
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

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-[17px] font-bold">Huy hiệu · {BADGES.filter((b) => earned.has(b.id)).length}/{BADGES.length}</h2>
        <ul className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => (
            <li key={b.id} className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center ${earned.has(b.id) ? "bg-gold-soft" : "bg-sunken opacity-60"}`} title={b.description}>
              <MascotIcon mood={b.mascot} size={40} tone={earned.has(b.id) ? "gold" : "plain"} className={earned.has(b.id) ? undefined : "grayscale"} />
              <span className="text-xs font-extrabold leading-tight">{b.title}</span>
            </li>
          ))}
          {monthly.map((m) => {
            const info = badgeInfo(m.badgeId)!;
            return (
              <li key={m.badgeId} className="flex flex-col items-center gap-1.5 rounded-xl bg-violet-soft p-2.5 text-center" title={info.description}>
                <MascotIcon mood={info.mascot} size={40} tone="violet" />
                <span className="text-xs font-extrabold leading-tight">{info.title}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
        <Link href="/profile/plan" className="flex items-center justify-between border-b border-line px-4 py-3.5 text-sm hover:bg-sunken"><span>Bản kế hoạch đầu tư</span><ChevronRight className="h-4 w-4 text-muted" /></Link>
        <Link href="/leaderboard" className="flex items-center justify-between border-b border-line px-4 py-3.5 text-sm hover:bg-sunken"><span>Nhóm xếp hạng tuần</span><ChevronRight className="h-4 w-4 text-muted" /></Link>
        <Link href="/profile/settings" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-sunken"><span>Cài đặt · giao diện, nhắc học</span><ChevronRight className="h-4 w-4 text-muted" /></Link>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-jade-soft p-4">
        <h2 className="text-[17px] font-bold">Sẵn sàng bắt đầu?</h2>
        <p className="text-sm">Mở tài khoản và tìm hiểu tài liệu quỹ chính thức trên DragonX.</p>
        <Button asChild><a href={process.env.NEXT_PUBLIC_DRAGONX_URL ?? "#"} target="_blank" rel="noreferrer">Mở DragonX</a></Button>
        <Disclaimer />
      </section>
    </div>
  );
}
