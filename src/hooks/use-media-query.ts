import { useSyncExternalStore } from "react";

type UseMediaQueryOptionsT = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptionsT = {}
): boolean {
  function getSnapshot() {
    return window.matchMedia(query).matches;
  }

  function getServerSnapshot() {
    if (initializeWithValue && !IS_SERVER) return getSnapshot();
    return defaultValue;
  }

  function subscribe(onChange: () => void) {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* Tailwind v4 default breakpoints */
export const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

export type BreakpointT = keyof typeof BREAKPOINTS;

export function useBreakpoint(bp: BreakpointT): boolean {
  return useMediaQuery(BREAKPOINTS[bp]);
}
