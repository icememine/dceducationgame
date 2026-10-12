import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

// The prototype's chunky "3D" buttons: a solid bottom shadow that collapses on press.
const buttonVariants = cva(
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-extrabold uppercase tracking-wider transition-[transform,box-shadow] duration-75 active:translate-y-[3px] disabled:pointer-events-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sky",
  {
    variants: {
      variant: {
        primary: "bg-jade text-white shadow-[0_4px_0_rgb(var(--jade-deep))] active:shadow-[0_1px_0_rgb(var(--jade-deep))]",
        gold: "bg-gold text-white shadow-[0_4px_0_rgb(var(--gold-deep))] active:shadow-[0_1px_0_rgb(var(--gold-deep))]",
        coral: "bg-coral text-white shadow-[0_4px_0_rgb(var(--coral-deep))] active:shadow-[0_1px_0_rgb(var(--coral-deep))]",
        sky: "bg-sky text-white shadow-[0_4px_0_rgb(var(--sky-deep))] active:shadow-[0_1px_0_rgb(var(--sky-deep))]",
        ghost: "border-2 border-line bg-surface text-sky shadow-[0_4px_0_rgb(var(--line))] active:shadow-[0_1px_0_rgb(var(--line))]",
        locked: "bg-locked text-muted shadow-[0_4px_0_rgb(var(--locked-deep))]",
        link: "w-auto bg-transparent p-2 text-[13px] text-muted shadow-none active:translate-y-0",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, asChild, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} disabled={disabled} className={cn(buttonVariants({ variant: disabled ? "locked" : variant }), className)} {...props} />;
});
Button.displayName = "Button";
