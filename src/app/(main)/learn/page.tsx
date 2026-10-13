import { Check, ChevronRight, Lock, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { MascotIcon } from "@/components/mascot";
import { getPathStatus, getUserState } from "@/db/queries";
import { getLatestPlacement } from "@/features/placement/queries";
import { getReviewOverview } from "@/features/review/queries";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** Unit titles carry their own "Phần N · " prefix; the header shows the number as an overline instead. */
const bareTitle = (t: string) => t.replace(/^Phần\s+\d+\s*·\s*/, "");

/** Progress ring for the summary card; the percentage is also in the text next to it. */
function Ring({ pct }: { pct: number }) {
  const r = 27, c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`Hoàn thành ${pct}%`}>
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-line" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-jade" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 32 32)" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular">{pct}%</span>
    </div>
  );
}

export default async function LearnPage() {
  const userId = await getUserId();
  const { progress, activeSegment } = await getUserState(userId);
  const [status, review, placement] = await Promise.all([getPathStatus(userId, activeSegment), getReviewOverview(userId), getLatestPlacement(userId, activeSegment.id)]);
  const lessons = activeSegment.units.flatMap((u, ui) => u.lessons.map((l, li) => ({ lesson: l, unitIndex: ui, lessonIndex: li, mascot: u.mascot })));
  const done = lessons.filter(({ lesson }) => status.get(lesson.id) === "done").length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const next = lessons.find(({ lesson }) => status.get(lesson.id) === "current");

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-8 pt-4">
      <section className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
        <Ring pct={pct} />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold tabular">{done} trên {lessons.length} bài</span>
          <span className="text-[13px] text-muted tabular">Chuỗi {progress.streak} ngày · {progress.xp.toLocaleString("vi-VN")} điểm</span>
        </div>
      </section>

      {next && (
        <Link href={`/lesson/${next.lesson.id}`} className="flex flex-col gap-2.5 rounded-2xl border border-hero-line bg-hero p-4 text-hero-ink">
          <span className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-hero-accent">
            {done === 0 ? "Bắt đầu" : "Tiếp theo"} · Phần {next.unitIndex + 1}, bài {next.lessonIndex + 1}
          </span>
          <MascotIcon mood={next.mascot} size={44} className="-my-1 bg-white/10" />
          </span>
          <span className="text-[19px] font-bold leading-snug">{next.lesson.title}</span>
          <span className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-hero-muted">{next.lesson.challenges.length} câu · khoảng {next.lesson.minutes} phút</span>
            <span className="rounded-[10px] bg-hero-accent px-4 py-2 text-[13px] font-bold text-[#0E1421]">{done === 0 ? "Bắt đầu" : "Tiếp tục"}</span>
          </span>
        </Link>
      )}

      {review.due > 0 && (
        <Link href="/review" className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-gold-soft"><RotateCcw className="h-4 w-4 text-gold" /></span>
          <span className="flex-1 text-sm"><b className="font-semibold">Ôn lại {review.due} câu</b><span className="text-muted"> · những câu từng sai, đến hạn hôm nay</span></span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      )}
      {done === 0 && !placement && activeSegment.id !== "my-plan" && (
        <Link href={`/placement/${activeSegment.id}`} className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-sky-soft"><Trophy className="h-4 w-4 text-sky" /></span>
          <span className="flex-1 text-sm"><b className="font-semibold">Đã biết một phần?</b><span className="text-muted"> · làm bài kiểm tra xếp lớp để mở sẵn các phần bạn đã nắm</span></span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      )}

      {activeSegment.units.map((unit, ui) => {
        const total = unit.lessons.length;
        const unitDone = unit.lessons.filter((l) => status.get(l.id) === "done").length;
        const locked = unit.lessons.every((l) => status.get(l.id) === "locked");
        return (
          <section key={unit.id} aria-labelledby={unit.id} className="mt-3 flex flex-col gap-2.5">
            {/* Section header: overline + title on the page background, set apart from the white list card below. */}
            <header className="flex items-center justify-between gap-3 px-1">
              <MascotIcon mood={unit.mascot} size={40} tone={locked ? "plain" : "jade"} className={cn(locked && "opacity-60 grayscale")} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn("text-[11px] font-bold uppercase tracking-[0.1em]", locked ? "text-muted" : "text-jade")}>Phần {ui + 1}</span>
                <h2 id={unit.id} className={cn("text-[17px] font-bold leading-tight", locked && "text-muted")}>{bareTitle(unit.title)}</h2>
              </div>
              <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-xs font-semibold text-muted tabular">{unitDone} / {total} bài</span>
            </header>
            <ol className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
              {unit.lessons.map((lesson, li) => {
                const st = status.get(lesson.id)!;
                const isNext = next?.lesson.id === lesson.id;
                const mark =
                  st === "done" ? (
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-jade-soft"><Check className="h-3.5 w-3.5 text-jade" strokeWidth={3} /></span>
                  ) : st === "locked" ? (
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-sunken">
                      {lesson.kind === "checkpoint" ? <Lock className="h-3 w-3 text-muted" /> : <span className="text-[11px] font-bold text-muted">{li + 1}</span>}
                    </span>
                  ) : (
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border-2 border-jade text-[11px] font-bold text-jade">{li + 1}</span>
                  );
                const row = (
                  <>
                    {mark}
                    <span className={cn("flex-1 text-sm", isNext && "font-semibold", st === "locked" && "text-muted")}>
                      {lesson.title}
                      {lesson.kind === "checkpoint" && <span className="text-muted"> · kiểm tra</span>}
                    </span>
                    {st === "done" ? <span className="text-xs text-muted">Ôn lại</span> : st === "current" ? <span className="text-xs font-semibold text-jade tabular">{lesson.minutes} phút</span> : null}
                  </>
                );
                return (
                  <li key={lesson.id} className="border-b border-line last:border-b-0">
                    {st === "locked" ? (
                      <span aria-label={`${lesson.title} (đang khoá)`} className="flex items-center gap-3 px-3.5 py-3">{row}</span>
                    ) : (
                      <Link href={`/lesson/${lesson.id}`} aria-label={`${lesson.title}${st === "done" ? " (ôn tập)" : ""}`} className="flex items-center gap-3 px-3.5 py-3 hover:bg-sunken">{row}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
