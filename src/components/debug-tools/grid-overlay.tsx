"use client";

import { cn } from "@/helpers/cn";

type GridOverlayPropsT = {
  /** "fixed" = full-page overlay, "absolute" = scoped to nearest positioned parent */
  readonly position?: "fixed" | "absolute";
  /** z-index — use to layer between background and content */
  readonly z?: number;
  /** Column color */
  readonly color?: string;
  /** Column border color */
  readonly borderColor?: string;
  readonly className?: string;
};

/**
 * Visual 12-column grid overlay.
 *
 * Full-page:  <GridOverlay />
 * Scoped:     <div className="relative"> <GridOverlay position="absolute" z={1} /> <content z={2} /> </div>
 * Under content, over bg:  <GridOverlay position="absolute" z={5} />
 */
export function GridOverlay({
  position = "fixed",
  z = 10000,
  color = "rgb(239 68 68 / 0.1)",
  borderColor = "rgb(255 255 255 / 0.2)",
  className,
}: GridOverlayPropsT) {
  return (
    <div
      className={cn(
        "pointer-events-none inset-0",
        position === "fixed" ? "fixed" : "absolute",
        className,
      )}
      style={{ zIndex: z }}
    >
      <div className="mx-auto h-full w-full px-6 md:px-12 lg:px-20">
        <div className="grid h-full grid-cols-1 md:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "col-span-1 h-full",
                i >= 1 && "hidden md:block",
              )}
              style={{ borderRight: `0.5px solid ${borderColor}`, borderLeft: i === 0 ? `0.5px solid ${borderColor}` : undefined }}
            >
              <div className="h-full" style={{ backgroundColor: color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
