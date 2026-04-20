import { useEffect, useRef, useState } from "react";

type UseVideoReadyOptionsT = {
  /** Fallback ms after which we unblock regardless (autoplay block, slow net, error). */
  timeoutMs?: number;
  /** Minimum ms the loader stays visible, so cached/fast videos still show the coral gate. */
  minVisibleMs?: number;
  /** If false, hook returns isReady=true immediately (e.g. no video to wait for). */
  enabled?: boolean;
};

/**
 * Gate UI on a video actually rendering frames.
 * Fires ready on `playing` (most honest signal), `error`, or timeout fallback.
 * Always respects a minimum visible duration so the coral loader is perceivable
 * even when the video is cached and plays immediately.
 */
export function useVideoReady({
  timeoutMs = 3000,
  minVisibleMs = 0,
  enabled = true,
}: UseVideoReadyOptionsT = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      requestAnimationFrame(() => setIsReady(true));
      return;
    }

    const startedAt = performance.now();
    let settled = false;
    let minDelayId: number | undefined;

    const commitReady = () => {
      if (settled) return;
      settled = true;
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      minDelayId = window.setTimeout(() => setIsReady(true), remaining);
    };

    const video = videoRef.current;
    if (!video) {
      commitReady();
      return () => {
        if (minDelayId !== undefined) window.clearTimeout(minDelayId);
      };
    }

    // Already playing (HMR / cached) — still respect minVisibleMs via commitReady
    if (!video.paused && video.readyState >= 3) {
      commitReady();
    } else {
      video.addEventListener("playing", commitReady);
      video.addEventListener("error", commitReady);
    }
    const timeoutId = window.setTimeout(commitReady, timeoutMs);

    return () => {
      video.removeEventListener("playing", commitReady);
      video.removeEventListener("error", commitReady);
      window.clearTimeout(timeoutId);
      if (minDelayId !== undefined) window.clearTimeout(minDelayId);
    };
  }, [enabled, timeoutMs, minVisibleMs]);

  return { videoRef, isReady };
}
