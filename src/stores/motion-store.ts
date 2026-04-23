import { create } from "zustand";

type MotionStateT = {
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
};

/* Session-only — landing page, no persistence. If a user flips the toggle
   on mobile and comes back later, they start fresh with animations on. */
export const useMotionStore = create<MotionStateT>((set) => ({
  reducedMotion: false,
  setReducedMotion: (v) => set({ reducedMotion: v }),
}));
