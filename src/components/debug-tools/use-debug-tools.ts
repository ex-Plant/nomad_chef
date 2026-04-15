import { create } from "zustand";

type UseDebugToolsT = {
  gridVisible: boolean;
  toggleGrid: () => void;
  outlinesVisible: boolean;
  toggleOutlines: () => void;
  layersVisible: boolean;
  toggleLayers: () => void;
  screensVisible: boolean;
  toggleScreens: () => void;
};

export const useDebugTools = create<UseDebugToolsT>((set) => ({
  gridVisible: false,
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  outlinesVisible: false,
  toggleOutlines: () => set((s) => ({ outlinesVisible: !s.outlinesVisible })),
  layersVisible: false,
  toggleLayers: () => set((s) => ({ layersVisible: !s.layersVisible })),
  screensVisible: false,
  toggleScreens: () => set((s) => ({ screensVisible: !s.screensVisible })),
}));
