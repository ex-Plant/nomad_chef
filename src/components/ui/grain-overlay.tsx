const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

type GrainOverlayPropsT = {
  /** "fixed" covers the viewport (global overlay), "absolute" covers the nearest relative parent */
  position?: "fixed" | "absolute";
  /** Tailwind z-index class, e.g. "z-0", "z-10", "z-50" */
  zIndex?: string;
  /** Tailwind opacity class, e.g. "opacity-[0.35]" */
  opacity?: string;
  className?: string;
};

export function GrainOverlay({
  position = "absolute",
  zIndex = "z-0",
  opacity = "opacity-[0.35]",
  className = "",
}: GrainOverlayPropsT) {
  return (
    <div
      className={`pointer-events-none inset-0 ${position} ${zIndex} ${opacity} ${className}`}
      style={{
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
      aria-hidden="true"
    />
  );
}
