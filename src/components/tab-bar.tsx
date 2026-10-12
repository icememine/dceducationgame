"use client";

import { Calculator, Home, MessageCircle, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/learn", label: "Học", icon: Home },
  { href: "/tools", label: "Công cụ", icon: Calculator },
  { href: "/rong", label: "Hỏi Rồng", icon: MessageCircle },
  { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-10 grid grid-cols-5 border-t-2 border-line bg-surface">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold", active ? "text-jade-deep" : "text-muted")}
          >
            <Icon className={cn("h-6 w-6", active && "fill-jade-soft")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
