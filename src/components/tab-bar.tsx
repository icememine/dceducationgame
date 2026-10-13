"use client";

import { BarChart3, BookOpen, Calculator, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/learn", label: "Học", icon: BookOpen },
  { href: "/tools", label: "Công cụ", icon: Calculator },
  { href: "/rong", label: "Hỏi Rồng", icon: MessageCircle },
  { href: "/leaderboard", label: "Xếp hạng", icon: BarChart3 },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-10 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "font-bold text-jade" : "font-medium text-muted")}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
