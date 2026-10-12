import type { Unit } from "@content/schema";

// Literal class names so Tailwind's JIT keeps them.
export const unitColor: Record<Unit["color"], { bg: string; text: string; soft: string; shadow: string }> = {
  jade: { bg: "bg-jade", text: "text-jade-deep", soft: "bg-jade-soft", shadow: "shadow-[0_6px_0_rgb(var(--jade-deep))]" },
  sky: { bg: "bg-sky", text: "text-sky-deep", soft: "bg-sky-soft", shadow: "shadow-[0_6px_0_rgb(var(--sky-deep))]" },
  gold: { bg: "bg-gold", text: "text-gold-deep", soft: "bg-gold-soft", shadow: "shadow-[0_6px_0_rgb(var(--gold-deep))]" },
  coral: { bg: "bg-coral", text: "text-coral-deep", soft: "bg-coral-soft", shadow: "shadow-[0_6px_0_rgb(var(--coral-deep))]" },
  violet: { bg: "bg-violet", text: "text-violet-deep", soft: "bg-violet-soft", shadow: "shadow-[0_6px_0_rgb(var(--violet-deep))]" },
};
