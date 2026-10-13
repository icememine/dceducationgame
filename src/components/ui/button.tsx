import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

// Flat, calm buttons: one filled primary (navy in light, mint in dark), tinted accents, an outline.
const buttonVariants = cva(
  "inline-flex w-full items-center justify-center gap-2 rounded-[14px] px-5 py-3.5 text-[15px] font-bold transition-colors duration-100 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-ink hover:opacity-90",
        gold: "bg-gold text-on-accent hover:opacity-90",
        coral: "bg-coral text-on-accent hover:opacity-90",
        sky: "bg-sky text-on-accent hover:opacity-90",
        ghost: "border border-line-strong bg-surface text-ink hover:bg-sunken",
        locked: "bg-sunken text-muted",
        link: "w-auto bg-transparent p-2 text-[13px] font-semibold text-muted hover:text-ink",
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
