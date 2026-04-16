const COLOR_VARIANTS = {
  coral: { bg: "bg-coral", icon: "text-white" },
  "coral-outline": { bg: "border border-coral bg-transparent hover:bg-coral", icon: "text-coral hover:text-white" },
  blue: { bg: "bg-electric-blue", icon: "text-white" },
  "blue-outline": { bg: "border border-electric-blue bg-transparent hover:bg-electric-blue", icon: "text-electric-blue hover:text-white" },
  yellow: { bg: "bg-yellow", icon: "text-blue" },
  "yellow-outline": { bg: "border border-yellow bg-transparent hover:bg-yellow", icon: "text-yellow hover:text-off-black" },
  pink: { bg: "bg-pink", icon: "text-off-black" },
  dark: { bg: "bg-off-black", icon: "text-white" },
  white: { bg: "bg-white", icon: "text-off-black" },
  "white-outline": { bg: "border border-white/60 bg-transparent hover:bg-white", icon: "text-white hover:text-off-black" },
} as const;

const SIZE_VARIANTS = {
  sm: { button: "h-10 w-10", svg: 14 },
  md: { button: "h-14 w-14", svg: 20 },
  lg: { button: "h-18 w-18", svg: 24 },
} as const;

type ArrowButtonColorT = keyof typeof COLOR_VARIANTS;
type ArrowButtonSizeT = keyof typeof SIZE_VARIANTS;

type ArrowButtonPropsT = {
  readonly onClick: () => void;
  readonly direction?: "prev" | "next";
  readonly color?: ArrowButtonColorT;
  readonly size?: ArrowButtonSizeT;
  readonly ariaLabel?: string;
  readonly className?: string;
};

export function ArrowButton({
  onClick,
  direction = "next",
  color = "coral",
  size = "md",
  ariaLabel,
  className = "",
}: ArrowButtonPropsT) {
  const { bg, icon } = COLOR_VARIANTS[color];
  const { button, svg } = SIZE_VARIANTS[size];

  const label =
    ariaLabel ??
    (direction === "next" ? "Następny" : "Poprzedni");

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${bg} ${button} ${className}`}
    >
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 20 20"
        fill="none"
        className={`transition-colors duration-500 ${icon} ${direction === "prev" ? "rotate-180" : ""}`}
      >
        <path
          d="M4 10h12m0 0l-5-5m5 5l-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
