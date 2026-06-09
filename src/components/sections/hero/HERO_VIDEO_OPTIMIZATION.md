# Hero Video — Shipped Setup

What the hero (`hero.tsx`) actually serves, and the encoding lessons behind it.

## Shipped media

Two MP4 variants in `public/` (CDN-served, immutable cache, swapped via redeploy):

| Viewport                              | File                                 |
| ------------------------------------- | ------------------------------------ |
| Portrait mobile (`≤767px portrait`)   | `/videos/hero_vid_mobile_crf20.mp4`  |
| Everything else (desktop/tablet/land) | `/videos/hero_vid_desktop_crf20.mp4` |
| Poster — mobile                       | `/videos/hero_poster_mobile.jpeg`    |
| Poster — desktop                      | `/videos/hero_poster_desktop.jpeg`   |

Both videos: H.264, `-pix_fmt yuv420p`, `-movflags +faststart`, audio stripped (`-an`).

## Encoding lessons (why CRF 20, not a bitrate)

- **Use CRF, never a fixed bitrate.** A fixed `-b:v` target starves high-motion
  footage (drone/overhead shots here) and produces visible artifacts. CRF is a
  quality target; file size floats with scene complexity.
- CRF 20 is the shipped quality floor for this footage — lower numbers gave no
  visible gain, higher numbers broke down on motion.
- `+faststart` moves the moov atom to the front so playback starts on the first
  chunks instead of after a full download.

Encoding recipe:

```bash
ffmpeg -i <src> \
  -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -movflags +faststart -an \
  <out>.mp4
```

## Delivery — JS source selection, not `<source media>`

`<source media>` inside `<video>` is unreliable across browsers (Chrome/iOS
Safari sometimes pick the first decodable source regardless of the media query).
So the hero assigns `video.src` **client-side after mount** based on a
`matchMedia("(orientation: portrait) and (max-width: 767px)")` check. The server
HTML embeds no `src`, so the browser never preloads the wrong variant before
hydration can correct it.

## Loader gating

The coral loader overlay covers the hero until the video genuinely renders
frames. `useVideoReady` (`src/hooks/use-video-ready.ts`) resolves `isReady` on
the `playing` event (the most honest signal), on `error`, on a caught
`NotAllowedError` (iOS Low Power Mode autoplay block), or a timeout fallback.
The page is scroll-locked (`useScrollLock`) while the loader is up. Poster image
shows underneath via `next/image` (`priority`) and is also the permanent
fallback for any browser that can't play the video.

## Parallax

GSAP `ScrollTrigger` scrubs the background container `scale` 1 → 1.5 across the
hero's scroll span. Skipped entirely when `prefers-reduced-motion` is set.
