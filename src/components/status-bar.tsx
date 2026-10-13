import { ChevronDown, Gift, Heart } from "lucide-react";
import Link from "next/link";
import type { Segment } from "@content/schema";

/** Top bar: the programme switcher, plus quests and notifications. Streak and points live on the Học and Hồ sơ screens. */
export function StatusBar({ segment, hearts, bell }: { segment: Segment; hearts: number; bell?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-page/95 px-4 py-3 backdrop-blur">
      <Link href="/segments" className="flex min-w-0 items-center gap-1.5 rounded-xl py-1 hover:opacity-80">
        <span className="truncate text-xl font-bold">{segment.title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </Link>
      <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-muted">
        {segment.heartsEnabled && (
          <span className="flex items-center gap-1 tabular" title="Lượt sai còn lại"><Heart className="h-4 w-4" />{hearts}</span>
        )}
        <Link href="/quests" aria-label="Nhiệm vụ hôm nay" className="ml-1 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-line bg-surface text-ink"><Gift className="h-[18px] w-[18px]" /></Link>
        {bell}
      </div>
    </header>
  );
}
