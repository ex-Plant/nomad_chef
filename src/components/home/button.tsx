import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/helpers/cn";

/* ─── Variants ────────────────────────────────────────── */

const buttonVariants = cva(
  "group inline-flex cursor-pointer items-center justify-center border font-geist text-sm font-medium uppercase tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        coral: "border-coral text-coral hover:bg-coral hover:text-white",
        "coral-solid":
          "border-coral bg-coral text-white hover:shadow-[0_4px_20px_rgba(255,99,22,0.35)]",
        blue: "border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white",
        "blue-solid":
          "border-electric-blue bg-electric-blue text-white hover:shadow-[0_4px_20px_rgba(25,62,244,0.35)]",
        yellow:
          "border-yellow text-yellow hover:bg-yellow hover:text-off-black",
        "yellow-solid":
          "border-yellow bg-yellow text-off-black hover:shadow-[0_4px_20px_rgba(229,245,93,0.35)]",
        pink: "border-pink text-pink hover:bg-pink hover:text-white",
        white: "border-white/60 text-white hover:bg-white hover:text-off-black",
        dark: "border-off-black/20 text-off-black hover:bg-off-black hover:text-white",
      },
      size: {
        default: "rounded-full px-8 py-4 gap-3",
        compact: "rounded-lg px-5 py-2.5 gap-2",
        icon: "rounded-full p-0 h-14 w-14",
        "icon-sm": "rounded-full p-0 h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "white",
      size: "default",
    },
  }
);

/* ─── Arrow circle ────────────────────────────────────── */

const ARROW_SIZES = {
  default: { circle: "h-7 w-7", icon: 14 },
  compact: { circle: "h-5 w-5", icon: 12 },
} as const;

/* ─── Types ───────────────────────────────────────────── */

type ButtonPropsT = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    readonly asChild?: boolean;
    readonly withArrow?: boolean;
  };

/* ─── Component ───────────────────────────────────────── */

function Button({
  className,
  variant,
  size,
  asChild = false,
  withArrow = false,
  children,
  ...props
}: ButtonPropsT) {
  const Comp = asChild ? Slot : "button";
  const arrowSize = size === "compact" ? ARROW_SIZES.compact : ARROW_SIZES.default;

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {withArrow && (
        <span
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-500",
            arrowSize.circle,
            "bg-current/10",
          )}
        >
          <ArrowRight size={arrowSize.icon} strokeWidth={2.5} aria-hidden="true" />
        </span>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonPropsT };
