/* Shared animation presets — single source of truth for motion timing */

export const EASE = [0.32, 0.72, 0, 1] as const;

export const DURATION = {
  fast: 0.5,
  default: 0.8,
  slow: 1.2,
} as const;

export const AUTOPLAY_INTERVAL = 10_000;

export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASE },
  default: { duration: DURATION.default, ease: EASE },
  slow: { duration: DURATION.slow, ease: EASE },
} as const;
