import { useEffect, useRef, useState } from "react";

type UseVideoReadyOptionsT = {
  /** Fallback ms after which we unblock regardless (autoplay block, slow net, error). */
  timeoutMs?: number;
  /** If false, hook returns isReady=true immediately (e.g. no video to wait for). */
  enabled?: boolean;
};

/**
 * Gate UI on a video actually rendering frames.
 * Fires ready on `playing` (most honest signal), `error`, or timeout fallback.
 */
export function useVideoReady({
  timeoutMs,
  enabled = true,
}: UseVideoReadyOptionsT = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInternalReady, setIsInternalReady] = useState(false);

  const isReady = !enabled || isInternalReady;

  useEffect(() => {
    if (!enabled) return;

    let settled = false;

    const commitReady = () => {
      if (settled) return;
      settled = true;
      setIsInternalReady(true);
    };

    const video = videoRef.current;
    if (!video) {
      commitReady();
      return;
    }

    // Already playing (HMR / cached)
    if (!video.paused && video.readyState >= 3) {
      commitReady();
    } else {
      video.addEventListener("playing", commitReady);
      video.addEventListener("error", commitReady);
    }
    const timeoutId = setTimeout(commitReady, timeoutMs);

    return () => {
      video.removeEventListener("playing", commitReady);
      video.removeEventListener("error", commitReady);
      clearTimeout(timeoutId);
    };
  }, [enabled, timeoutMs]);

  return { videoRef, isReady };
}
