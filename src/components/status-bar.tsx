import { ChevronDown, Flame, Gift, Heart, Zap } from "lucide-react";
import Link from "next/link";
import type { Segment } from "@content/schema";

export function StatusBar({ segment, streak, xp, hearts }: { segment: Segment; streak: number; xp: number; hearts: number }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-line bg-surface px-4 py-2.5">
      <Link href="/segments" className="flex items-center gap-2 rounded-xl px-2 py-1 font-extrabold hover:bg-sunken">
        <span className="rounded-lg bg-jade px-1.5 py-0.5 text-xs text-white">{segment.code}</span>
        <span className="max-w-[9rem] truncate text-sm">{segment.title}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </Link>
      <div className="flex items-center gap-3 text-sm font-extrabold">
        <span className="flex items-center gap-1 text-gold-deep" title="Chuỗi ngày học"><Flame className="h-5 w-5 fill-current" />{streak}</span>
        <span className="flex items-center gap-1 text-sky" title="Tổng XP"><Zap className="h-5 w-5 fill-current" />{xp.toLocaleString("vi-VN")}</span>
        {segment.heartsEnabled && (
          <span className="flex items-center gap-1 text-coral" title="Tim"><Heart className="h-5 w-5 fill-current" />{hearts}</span>
        )}
        <Link href="/quests" aria-label="Nhiệm vụ hôm nay" className="text-violet"><Gift className="h-5 w-5" /></Link>
      </div>
    </header>
  );
}
