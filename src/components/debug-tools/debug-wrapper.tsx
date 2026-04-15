"use client";

import { type ReactNode } from "react";
import { cn } from "@/helpers/cn";
import { GridOverlay } from "@/components/debug-tools/grid-overlay";
import { DebugToolsTriggers } from "@/components/debug-tools/debug-tools-triggers";
import { DebugScreens } from "@/components/debug-tools/debug-screens";
import { useDebugTools } from "@/components/debug-tools/use-debug-tools";

type DebugWrapperPropsT = {
  readonly children: ReactNode;
};

export function DebugWrapper({ children }: DebugWrapperPropsT) {
  const gridVisible = useDebugTools((s) => s.gridVisible);
  const outlinesVisible = useDebugTools((s) => s.outlinesVisible);
  const layersVisible = useDebugTools((s) => s.layersVisible);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <>
      {isDev && gridVisible && <GridOverlay />}
      <div
        id="debug_wrapper"
        className={cn(
          "relative flex min-h-0 flex-1 flex-col",
          outlinesVisible && "**:outline **:outline-lime-300",
          layersVisible && "**:bg-[hsla(0,11%,2%,0)]",
        )}
      >
        {children}
        {isDev && <DebugToolsTriggers />}
        {isDev && <DebugScreens />}
      </div>
    </>
  );
}
