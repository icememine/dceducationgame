"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useTransition } from "react";
import { setTheme } from "@/actions/theme";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { id: Theme; label: string; note: string; icon: typeof Sun }[] = [
  { id: "light", label: "Sáng", note: "Mặc định", icon: Sun },
  { id: "dark", label: "Tối", note: "Dịu mắt khi trời tối", icon: Moon },
];

export function ThemeSettings({ initial }: { initial: Theme }) {
  const [theme, setLocal] = useState(initial);
  const [pending, start] = useTransition();
  const pick = (t: Theme) => {
    setLocal(t);
    document.documentElement.dataset.theme = t; // instant; the cookie keeps it for the next visit
    start(() => setTheme(t));
  };
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4" aria-busy={pending}>
      <h2 className="text-[17px] font-bold">Giao diện</h2>
      <div role="radiogroup" aria-label="Giao diện" className="grid grid-cols-2 gap-2.5">
        {OPTIONS.map(({ id, label, note, icon: Icon }) => (
          <button key={id} type="button" role="radio" aria-checked={theme === id} onClick={() => pick(id)}
            className={cn("flex items-center gap-3 rounded-[14px] border p-3 text-left", theme === id ? "border-jade bg-jade-soft" : "border-line bg-surface hover:bg-sunken")}>
            <Icon className={cn("h-5 w-5", theme === id ? "text-jade" : "text-muted")} />
            <span className="flex flex-col"><span className="text-sm font-semibold">{label}</span><span className="text-xs text-muted">{note}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
