import { cn } from "@/helpers/cn";

// Same artwork as the nav's mobile toggle. We always render in the "open" pose
// (rotated 45° with the tail hidden) so it reads as an X close affordance.
const PATH =
  "m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70";
const OPEN_DASH = "59.75 105.25 60 300";

type CloseTogglePropsT = {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  /** Tailwind text-* class controlling stroke colour. Default: text-coral. */
  iconClassName?: string;
  /** Pixel width of the SVG. Default: 48. */
  size?: number;
};

export function CloseToggle({
  onClick,
  ariaLabel = "Zamknij",
  className,
  iconClassName = "text-coral",
  size = 48,
}: CloseTogglePropsT) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex cursor-pointer transition-transform duration-300 ease-brand hover:scale-110 active:scale-95",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        stroke="currentColor"
        fill="none"
        viewBox="-10 -10 105 120"
        width={size}
        className={cn("translate-[-2px_-2px] rotate-45", iconClassName)}
      >
        <path
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={PATH}
          style={{ strokeDasharray: OPEN_DASH }}
        />
      </svg>
    </button>
  );
}
