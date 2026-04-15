"use client";

import { DebugToolsCheckbox } from "@/components/debug-tools/debug-tools-checkbox";
import { useDebugTools } from "@/components/debug-tools/use-debug-tools";

export function DebugToolsTriggers() {
  const gridVisible = useDebugTools((s) => s.gridVisible);
  const outlinesVisible = useDebugTools((s) => s.outlinesVisible);
  const layersVisible = useDebugTools((s) => s.layersVisible);
  const screensVisible = useDebugTools((s) => s.screensVisible);
  const toggleGrid = useDebugTools((s) => s.toggleGrid);
  const toggleOutlines = useDebugTools((s) => s.toggleOutlines);
  const toggleLayers = useDebugTools((s) => s.toggleLayers);
  const toggleScreens = useDebugTools((s) => s.toggleScreens);

  return (
    <div className="fixed bottom-4 right-4 z-[10001] flex gap-4 rounded-lg bg-black/80 px-4 py-2 backdrop-blur-sm">
      <DebugToolsCheckbox toggleFunc={toggleGrid} currentVal={gridVisible} label="grid" />
      <DebugToolsCheckbox toggleFunc={toggleOutlines} currentVal={outlinesVisible} label="outlines" />
      <DebugToolsCheckbox toggleFunc={toggleLayers} currentVal={layersVisible} label="layers" />
      <DebugToolsCheckbox toggleFunc={toggleScreens} currentVal={screensVisible} label="screens" />
    </div>
  );
}
