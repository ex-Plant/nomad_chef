# Hero Video Optimization — Findings

Source file: `public/videos/Can_you_create_another_version_Veo_31_79044.mp4`
Original: 1920×1080, H.264, 24fps, 8s, **16.2 Mbps**, 15.5 MB, has AAC audio track.

## Reference: Shopify's hero (shopify.com/pl)

- 1920×1080, H.264, 24fps, 11.3s
- **1.28 Mbps**, 1.76 MB, no audio
- Delivered as `<video>` with `autoplay muted loop playsinline`, no `preload`
- Served from `cdn.shopify.com`, `cache-control: public, max-age=31557600`
- WebM alternative at 887 KB served first if browser supports it

Their footage is low-motion (static products, slow pans). Ours is drone/overhead with constant movement, so the same bitrate budget does not produce the same quality.

## Key lesson — bitrate vs CRF

- Targeting a fixed bitrate (e.g. `-b:v 1300k`) fails on high-motion footage — encoder runs out of budget and produces visible artifacts.
- Use **CRF** (Constant Rate Factor) instead. CRF is a quality target; file size varies with content complexity.
- Typical web range: CRF 22 (near-lossless) to CRF 28 (acceptable). Below CRF 28 quality drops fast on detailed footage.
- CRF ~32 was too aggressive for this footage → rejected.

## Encoding settings (all variants)

```bash
ffmpeg -i <src> \
  -c:v libx264 -preset slow -crf <CRF> \
  -vf "scale=<W>:-2" -r 24 -pix_fmt yuv420p \
  -movflags +faststart -an \
  <out>.mp4
```

- `-an` → strip audio (hero is muted, audio track is wasted bytes)
- `-movflags +faststart` → moves moov atom to front so playback starts on first chunks (not after full download)
- `-pix_fmt yuv420p` → Safari/iOS compatibility
- `-preset slow` → better compression at the cost of encoding time (we don't care, one-time job)
- `-r 24` → matches source framerate, no unnecessary interpolation

## Size matrix (width × CRF)

| Width | CRF 22 (near-lossless) | CRF 24 (very good) | CRF 26 (good) |
|------:|-----------------------:|-------------------:|--------------:|
|  375w |                 549 KB |             419 KB |        317 KB |
|  768w |                 1.6 MB |             1.2 MB |        917 KB |
| 1280w |                 3.5 MB |             2.7 MB |        2.0 MB |
| 1440w |                 4.3 MB |             3.3 MB |        2.5 MB |
| 1920w |                 8.0 MB |             5.9 MB |        4.4 MB |

Original reference: 15 MB.

## Breakpoints chosen

- `375w` — typical mobile
- `768w` — tablet
- `1280w` / `1440w` / `1920w` — desktop tier (cheap to add, lets smaller laptops avoid downloading 1920w)

## Delivery — how to serve the right size

`<video>` does **not** support `srcset`. Use `<source media="...">` instead:

```html
<video autoplay muted loop playsinline poster="/videos/hero-poster.jpg">
  <source media="(max-width: 480px)"  src="/videos/hero-375w-crf24.mp4"  type="video/mp4" />
  <source media="(max-width: 1024px)" src="/videos/hero-768w-crf24.mp4"  type="video/mp4" />
  <source media="(max-width: 1366px)" src="/videos/hero-1280w-crf24.mp4" type="video/mp4" />
  <source media="(max-width: 1600px)" src="/videos/hero-1440w-crf24.mp4" type="video/mp4" />
  <source                             src="/videos/hero-1920w-crf24.mp4" type="video/mp4" />
</video>
```

Quirks:
- Evaluated top-to-bottom, first match wins — order matters.
- Choice is made once on load, not re-evaluated on resize. Fine for real users.
- DPR caveat: a 375 CSS-px mobile viewport at 2× DPR has 750 physical pixels. Serving the 375w variant will look slightly soft on retina. Can be mitigated by serving the next tier up (768w) to high-DPR phones via `media="(max-width: 480px) and (min-resolution: 2dppx)"` — evaluate after we pick the CRF.

## Hosting — `public/` vs Payload

Chose `public/`. Trade-off:

- `public/` → served from Vercel's edge CDN, immutable cache headers, fast worldwide. Swapping the video requires a redeploy.
- Payload → flexible (client uploads via admin), but served from origin unless an additional CDN is configured. Weaker default caching.

For a hero video that changes rarely, `public/` is the right call.

## Open decisions

- [ ] Pick final CRF from {22, 24, 26} after visual comparison.
- [ ] Decide whether to also emit WebM variants (≈30–40% smaller than MP4 at same quality). Adds encoding time but halves bandwidth for Chrome/Firefox users.
- [ ] Poster frame currently 329 KB — re-encode smaller once CRF is locked.
- [ ] After picking, gate the hero text fade-in on `onCanPlay` with a 2s fallback timeout, so animations don't run over a still-loading video.
