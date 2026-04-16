import { FadeUp } from "@/components/shared/fade-up";

type ColorT = "coral" | "blue" | "yellow" | "pink" | "dark" | "white";

const COLOR_MAP: Record<
  ColorT,
  { border: string; text: string; line: string }
> = {
  coral: {
    border: "border-coral",
    text: "text-coral",
    line: "bg-coral",
  },
  blue: {
    border: "border-electric-blue",
    text: "text-electric-blue",
    line: "bg-electric-blue",
  },
  yellow: {
    border: "border-yellow",
    text: "text-yellow",
    line: "bg-yellow",
  },
  pink: {
    border: "border-pink",
    text: "text-pink",
    line: "bg-pink",
  },
  dark: {
    border: "border-off-black/20",
    text: "text-off-black/60",
    line: "bg-off-black/20",
  },
  white: {
    border: "border-white/30",
    text: "text-muted-on-dark",
    line: "bg-white/30",
  },
} as const;

type EyebrowTagPropsT = {
  readonly children: React.ReactNode;
  readonly color?: ColorT;
  readonly withLine?: boolean;
  readonly lineColor?: ColorT;
  readonly className?: string;
  readonly duration?: number;
};

export function EyebrowTag({
  children,
  color = "dark",
  withLine = true,
  lineColor,
  className = "mb-12 sm:mb-16",
  duration,
}: EyebrowTagPropsT) {
  const { border, text } = COLOR_MAP[color];
  const lineBg = COLOR_MAP[lineColor ?? color].line;

  const tag = (
    <span
      className={`rounded-lg border ${border} px-4 py-1.5 text-label-xs ${text}`}
    >
      {children}
    </span>
  );

  const content = withLine ? (
    <div className="flex items-center gap-4">
      {tag}
      <div className={`h-px flex-1 ${lineBg}`} />
    </div>
  ) : (
    tag
  );

  return (
    <FadeUp className={className} duration={duration}>
      {content}
    </FadeUp>
  );
}
