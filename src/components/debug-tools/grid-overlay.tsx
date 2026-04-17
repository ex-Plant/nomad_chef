"use client";

import { cn } from "@/helpers/cn";

type GridOverlayPropsT = {
  /** "fixed" = full-page overlay, "absolute" = scoped to nearest positioned parent */
  position?: "fixed" | "absolute";
  /** z-index — use to layer between background and content */
  z?: number;
  className?: string;
};

/**
 * Visual grid overlay using fest-container + fest-grid.
 * Shows 4 cols on mobile, 8 on sm, 12 on md+.
 */
export function GridOverlay({
  position = "fixed",
  z = 10000,
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
      <div className="fest-container h-full">
        <div className="fest-grid h-full">
          {/* 4 columns — mobile */}
          <GridColumn />
          <GridColumn />
          <GridColumn />
          <GridColumn />
          {/* sm: 8 columns */}
          <GridColumn className="hidden sm:block" />
          <GridColumn className="hidden sm:block" />
          <GridColumn className="hidden sm:block" />
          <GridColumn className="hidden sm:block" />
          {/* md: 12 columns */}
          <GridColumn className="hidden md:block" />
          <GridColumn className="hidden md:block" />
          <GridColumn className="hidden md:block" />
          <GridColumn className="hidden md:block" />
        </div>
      </div>
    </div>
  );
}

function GridColumn({ className }: { className?: string }) {
  return (
    <div className={cn("col-span-1 border-[0.5px] border-black/20", className)}>
      <div className="h-full bg-red-500/10" />
    </div>
  );
}
