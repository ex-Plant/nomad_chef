"use client";

import { useEffect, useState } from "react";
import { useDebugTools } from "@/components/debug-tools/use-debug-tools";

const BREAKPOINTS = [
  { name: "sm", min: 640 },
  { name: "md", min: 768 },
  { name: "lg", min: 1024 },
  { name: "xl", min: 1280 },
  { name: "2xl", min: 1536 },
] as const;

function getBreakpointLabel(width: number): string {
  for (let i = BREAKPOINTS.length - 1; i >= 0; i--) {
    if (width >= BREAKPOINTS[i].min) {
      const upper = BREAKPOINTS[i + 1]?.min;
      return `${BREAKPOINTS[i].name} (${BREAKPOINTS[i].min}px${upper ? ` – ${upper - 1}px` : "+"})`;
    }
  }
  return `xs (0 – ${BREAKPOINTS[0].min - 1}px)`;
}

export function DebugScreens() {
  const screensVisible = useDebugTools((s) => s.screensVisible);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (process.env.NODE_ENV !== "development" || width === 0 || !screensVisible) return null;

  return (
    <div className="fixed bottom-14 right-4 z-[10001] flex items-center gap-2 rounded-full bg-black/80 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm">
      <span>{width}px</span>
      <span className="text-white/50">&middot;</span>
      <span>{getBreakpointLabel(width)}</span>
    </div>
  );
}
