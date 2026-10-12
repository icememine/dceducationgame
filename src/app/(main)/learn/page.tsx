import { BookOpen, Check, Lock, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { unitColor } from "@/components/unit-colors";
import { getCompletedLessonIds, getUserState, pathStatus } from "@/db/queries";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Zig-zag offsets for path nodes (px), same rhythm as the prototype.
const ZIG = [0, -56, -80, -56, 0, 56, 80, 56];

export default async function LearnPage() {
  const userId = await getUserId();
  const { activeSegment } = await getUserState(userId);
  const status = pathStatus(activeSegment, await getCompletedLessonIds(userId));

  return (
    <div className="flex flex-col gap-2 pb-8">
      {activeSegment.units.map((unit, ui) => {
        const c = unitColor[unit.color];
        const unitLocked = unit.lessons.every((l) => status.get(l.id) === "locked");
        return (
          <section key={unit.id} aria-labelledby={unit.id}>
            <div className={cn("mx-4 mt-4 flex items-center justify-between rounded-2xl p-4 text-white", unitLocked ? "bg-locked-deep" : c.bg)}>
              <div>
                <h2 id={unit.id} className="text-lg font-extrabold">{unit.title}</h2>
                <p className="text-sm font-semibold opacity-90">{unit.description}</p>
              </div>
              <BookOpen className="h-6 w-6 shrink-0 opacity-90" aria-label="Sổ tay" />
            </div>
            <ol className="relative flex flex-col items-center gap-5 py-6">
              {unit.lessons.map((lesson, li) => {
                const st = status.get(lesson.id)!;
                const Icon = st === "locked" ? Lock : lesson.kind === "checkpoint" ? Trophy : st === "done" ? Check : Star;
                const node = (
                  <span
                    className={cn(
                      "flex h-[70px] w-[70px] items-center justify-center rounded-full text-white",
                      st === "locked" ? "bg-locked text-locked-deep shadow-[0_6px_0_rgb(var(--locked-deep))]" : st === "done" ? "bg-gold shadow-[0_6px_0_rgb(var(--gold-deep))]" : cn(c.bg, c.shadow),
                    )}
                  >
                    <Icon className="h-8 w-8" strokeWidth={3} />
                  </span>
                );
                return (
                  <li key={lesson.id} className="relative flex flex-col items-center" style={{ transform: `translateX(${ZIG[(li + ui) % ZIG.length]}px)` }}>
                    {st === "current" && (
                      <span className="mb-2 rounded-xl border-2 border-line bg-surface px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-jade-deep">Bắt đầu</span>
                    )}
                    {st === "locked" ? (
                      <span aria-label={`${lesson.title} (đang khoá)`}>{node}</span>
                    ) : (
                      <Link href={`/lesson/${lesson.id}`} aria-label={`${lesson.title}${st === "done" ? " (ôn tập)" : ""}`}>{node}</Link>
                    )}
                    <span className="mt-2 max-w-[9rem] text-center text-xs font-bold text-muted">{lesson.title}</span>
                  </li>
                );
              })}
              <Mascot mood={unit.mascot} size={84} className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2" />
            </ol>
          </section>
        );
      })}
    </div>
  );
}
