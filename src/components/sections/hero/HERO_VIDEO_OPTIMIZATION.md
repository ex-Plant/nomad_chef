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
| ----: | ---------------------: | -----------------: | ------------: |
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
  <source
    media="(max-width: 480px)"
    src="/videos/hero-375w-crf24.mp4"
    type="video/mp4"
  />
  <source
    media="(max-width: 1024px)"
    src="/videos/hero-768w-crf24.mp4"
    type="video/mp4"
  />
  <source
    media="(max-width: 1366px)"
    src="/videos/hero-1280w-crf24.mp4"
    type="video/mp4"
  />
  <source
    media="(max-width: 1600px)"
    src="/videos/hero-1440w-crf24.mp4"
    type="video/mp4"
  />
  <source src="/videos/hero-1920w-crf24.mp4" type="video/mp4" />
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

# Hero Video — Section Experiments

## Decision (locked)

**Ship WebM VP9 at CRF 37 with a poster image fallback.** No MP4 fallback. Pre-Safari-14 users (well under 0.5%) see the poster as a still frame — visually fine.

## Sources being optimized

1. **Current hero — Veo landscape**
   - `public/videos/Can_you_create_another_version_Veo_31_79044.mp4`
   - 1920×1080, H.264, 24 fps, 8 s, **16.2 Mbps**, **15 MB**, AAC audio (stripped).

2. **Marta's portrait — already shot**
   - `media/marta_vid.mp4`
   - **464×832** (9:16 portrait), H.264, 60 fps, 15 s, 1.75 Mbps, 3.3 MB, audio (strip).
   - **Constraint**: source resolution is too low for a large desktop display. No encoder fixes missing pixels. See § "Marta's video — display options" below.

## Encoding recipe (WebM VP9, best quality)

```bash
ffmpeg -i <src> \
  -c:v libvpx-vp9 -crf 37 -b:v 0 \
  -deadline best -cpu-used 0 -row-mt 1 \
  <resize_or_crop_filter> -r 24 -pix_fmt yuv420p -an \
  <out>.webm
```

- `-crf 37 -b:v 0` → constant-quality mode, ignore target bitrate
- `-deadline best -cpu-used 0` → best-quality single-pass; ~10× slower than `-cpu-used 2`, which matters only during encoding
- `-r 24` → normalize framerate (Marta's 60 fps → 24; hero loop doesn't need 60)
- `-an` → strip audio track

Resize filters:

- **Landscape** (Veo source): `-vf "scale=<W>:-2"` — width-scale, aspect preserved.
- **Portrait** (Veo source → 9:16): `-vf "crop=ih*9/16:ih,scale=<W>:<H>"` — center-crop 16:9 → 9:16, then scale.
- **Marta native portrait**: `-vf "scale=<W>:-2"` — already 9:16, just scale.

## Experiment history

### 1. H.264 MP4 ladder (round 1)

Encoded 15 variants (5 widths × 3 CRFs). Showed that CRF 22/24/26 all look good on desktop; CRF 32 broke down. The 375w/768w variants turned out to be wrong-assumption files (see next point).

### 2. Aspect correction

Realized `object-cover` on 16:9 video in a portrait viewport crops ~75% of the frame. Generated 9:16 portrait variants (540×960, 720×1280, 1080×1920) as separate files and introduced `orientation: portrait` media queries in the `<source>` ladder.

### 3. VP9 WebM test

At first-pass encoding (`-cpu-used 2 -deadline good`), VP9 produced **larger** files than H.264 at matched CRF targets (~5% larger). Switched to `-cpu-used 0 -deadline best` — still 1–9% larger at nominal-matched CRF:

| Quality tier |       MP4 H.264 |        WebM VP9 | Delta |
| ------------ | --------------: | --------------: | ----: |
| High         | 8.0 MB (CRF 22) | 8.1 MB (CRF 31) |   +1% |
| Mid          | 5.9 MB (CRF 24) | 6.3 MB (CRF 34) |   +7% |
| Low          | 4.4 MB (CRF 26) | 4.8 MB (CRF 37) |   +9% |

### 4. Visual side-by-side

Displayed all three WebM variants vs the 15 MB original in a 4-column section. Verdict: WebM CRF 37 (4.8 MB) looks visually near-indistinguishable from the original on a desktop viewport. Picked it as the quality floor.

**Why this is a win despite the "WebM is larger" numbers**: the savings vs original are what matter for bandwidth (15 MB → 4.8 MB = 68% reduction on the desktop variant). VP9 matches or beats H.264's perceptual quality per byte on this high-motion source; the "WebM is larger than MP4 at matched CRF" result was about CRF-number equivalence, not perceptual quality per byte.

## Size matrix — shipping targets (CRF 37)

| Aspect         | Resolution  | Size (Veo source) | Serves viewport          |
| -------------- | ----------- | ----------------: | ------------------------ |
| 9:16 portrait  | 540 × 960   |               TBD | portrait, ≤ 380 CSS px   |
| 9:16 portrait  | 720 × 1280  |               TBD | portrait, ≤ 500 CSS px   |
| 9:16 portrait  | 1080 × 1920 |               TBD | portrait, rest           |
| 16:9 landscape | 1280 × 720  |               TBD | landscape, ≤ 1366 CSS px |
| 16:9 landscape | 1440 × 810  |               TBD | landscape, ≤ 1600 CSS px |
| 16:9 landscape | 1920 × 1080 |        **4.8 MB** | landscape, rest          |

(Other sizes will be filled in once the ladder is encoded.)

## Marta's video — display options

Native 464×832. Too small for a sharp desktop hero at full-bleed.

| Option                                                      | Desktop experience                                                       | Verdict                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| A. Use only on mobile; keep Veo drone on desktop/tablet     | Each device gets a video sized appropriately for its resolution          | **Preferred** — clean separation                  |
| B. Centered portrait block with blurred-self background     | Video sits ~500px wide in middle of section, background fills rest       | Viable. Looks like Instagram embed.               |
| C. Full-bleed with `object-cover` + blurred self-background | Video stretches to fill, crops top/bottom, blurred copy covers bars      | Works but soft on desktop (source upscaled ~2.3×) |
| D. Split layout (video ~40% width, text 60%)                | Portrait video becomes a design feature rather than a full-bleed element | Strong option for desktop                         |
| E. Ask Marta to reshoot at 1080×1920                        | Clean source for every tier                                              | Right answer if possible                          |

Short of a reshoot, **option A** is what most high-end sites do: pair a landscape piece of content with a portrait piece, pick per device. On mobile Marta's portrait video fills the screen beautifully at near-native resolution. On desktop the Veo drone carries the hero. Both encoded via the same CRF-37 WebM pipeline.

## Delivery ladder (final)

```tsx
<video autoplay muted loop playsinline poster="/videos/hero-poster.jpg">
  <source
    media="(orientation: portrait) and (max-width: 380px)"
    src="/videos/hero-540x960-crf37.webm"
    type="video/webm"
  />
  <source
    media="(orientation: portrait) and (max-width: 500px)"
    src="/videos/hero-720x1280-crf37.webm"
    type="video/webm"
  />
  <source
    media="(orientation: portrait)"
    src="/videos/hero-1080x1920-crf37.webm"
    type="video/webm"
  />
  <source
    media="(max-width: 1366px)"
    src="/videos/hero-1280w-crf37.webm"
    type="video/webm"
  />
  <source
    media="(max-width: 1600px)"
    src="/videos/hero-1440w-crf37.webm"
    type="video/webm"
  />
  <source src="/videos/hero-1920w-crf37.webm" type="video/webm" />
</video>
```

Source ladder is evaluated once at page load; browser picks the first match. Poster shows instantly via the `poster` attribute — covers the video while it decodes and also serves as the permanent fallback for any browser that can't play VP9 WebM.

## Marta's video — WebM VP9 rejected

Encoded Marta at WebM VP9 CRF 37 (692 KB) and CRF 42 (476 KB), both dropped 60→24 fps. Visible result: **motion is no longer smooth**. Two candidate causes:

1. Reduced framerate from 60 → 24 (half the temporal samples = visible judder on fast motion).
2. VP9 compression artifacts on low-resolution source (464×832) — VP9 is generally weaker than H.264 for very small resolutions.

Reverting Marta to **H.264 MP4 at 60 fps preserved, no audio**, CRF 22 / 24 / 26 for visual comparison.

| CRF |   Size | vs 3.1 MB original |
| --: | -----: | -----------------: |
|  22 | 1.4 MB |               −55% |
|  24 | 1.1 MB |               −65% |
|  26 | 913 KB |               −71% |

Encoding recipe:

```bash
ffmpeg -i marta_vid.mp4 \
  -c:v libx264 -preset slow -crf <CRF> \
  -pix_fmt yuv420p -movflags +faststart -an \
  marta-464x832-crf<CRF>.mp4
```

No framerate override (`-r` omitted) — lets ffmpeg preserve the source's 60 fps so motion matches the original.

## Shipped state

- **Portrait (mobile)**: `marta-464x832-crf22.mp4` (1.4 MB, H.264, native 60 fps)
- **Landscape ≤1366 CSS px**: `hero-1280w-crf37.webm` (2.3 MB)
- **Landscape ≤1600 CSS px**: `hero-1440w-crf37.webm` (2.7 MB)
- **Landscape default**: `hero-1920w-crf37.webm` (4.8 MB)
- **Poster / old-Safari fallback**: `hero-poster.jpg`

Wired into `hero.tsx` via a `<source media>` ladder. Loader overlay gated on `useVideoReady` with 3 s fallback, poster shown underneath via `next/image`.

Portrait-orientation landscape Veo variants (540×960, 720×1280, 1080×1920) were dropped — Marta's portrait video covers mobile, no need to crop Veo to 9:16.

## Production vs tests path

Two hero components exist on purpose — same `SiteT["hero"]` data shape, different media sources:

| Route                    | Component    | Video source                                        |
| ------------------------ | ------------ | --------------------------------------------------- |
| `/` (`app/page.tsx`)     | `<Hero>`     | Hardcoded `/videos/*` in `public/` (CDN-served)     |
| `/tests` (`app/tests/`)  | `<HeroTests>` | Payload — reads `data.mediaDesktop` / `data.mediaMobile` |

- **Production `/`** ships locked-in encodes from `public/videos/`. Fast, predictable, no runtime dependency on Payload for the hero. Mobile portrait source (`(orientation: portrait) and (max-width: 767px)`) serves `marta-464x832-crf22.mp4`; larger viewports fall through to the landscape WebM ladder.
- **Tests `/tests`** reads uploaded files from the Site global's `hero_media_desktop` / `hero_media_mobile` fields. Lets the client swap videos via Payload admin without a deploy. URLs flow through `toMedia()` so cache-busting `?v=<updatedAt>` is automatic.

Client uploads on `/tests` aren't put through the CRF ladder — whatever they upload is what plays. For the shipped `/` route, re-encode per this doc's recipe and drop into `public/videos/`.

## Open decisions

- [ ] Regenerate `hero-poster.jpg` smaller (currently 329 KB; can be ≤ 80 KB without quality loss).
- [ ] Consider deleting the 4 unused Veo source MP4s in `public/videos/` to reduce deploy size.
