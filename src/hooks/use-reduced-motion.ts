import { useMotionStore } from "@/stores/motion-store";

/* Selector — use everywhere to gate animations. Zustand selector form so
   components only re-render when reducedMotion actually flips. */
export function useReducedMotion(): boolean {
  return useMotionStore((s) => s.reducedMotion);
}
