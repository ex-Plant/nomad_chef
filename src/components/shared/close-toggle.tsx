import { cn } from "@/helpers/cn";

type CloseTogglePropsT = {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  /** Tailwind text-* class controlling stroke colour. Default: text-coral. */
  iconClassName?: string;
  /** Pixel width of the SVG. Default: 40. */
  size?: number;
};

export function CloseToggle({
  onClick,
  ariaLabel = "Zamknij",
  className,
  iconClassName = "text-coral",
  size = 40,
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
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        className={iconClassName}
      >
        <path
          d="M6 6 L18 18 M18 6 L6 18"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
