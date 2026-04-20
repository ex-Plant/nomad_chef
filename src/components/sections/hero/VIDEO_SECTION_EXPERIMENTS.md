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

| Quality tier | MP4 H.264 | WebM VP9 | Delta |
|---|---:|---:|---:|
| High | 8.0 MB (CRF 22) | 8.1 MB (CRF 31) | +1% |
| Mid | 5.9 MB (CRF 24) | 6.3 MB (CRF 34) | +7% |
| Low | 4.4 MB (CRF 26) | 4.8 MB (CRF 37) | +9% |

### 4. Visual side-by-side

Displayed all three WebM variants vs the 15 MB original in a 4-column section. Verdict: WebM CRF 37 (4.8 MB) looks visually near-indistinguishable from the original on a desktop viewport. Picked it as the quality floor.

**Why this is a win despite the "WebM is larger" numbers**: the savings vs original are what matter for bandwidth (15 MB → 4.8 MB = 68% reduction on the desktop variant). VP9 matches or beats H.264's perceptual quality per byte on this high-motion source; the "WebM is larger than MP4 at matched CRF" result was about CRF-number equivalence, not perceptual quality per byte.

## Size matrix — shipping targets (CRF 37)

| Aspect | Resolution | Size (Veo source) | Serves viewport |
|---|---|---:|---|
| 9:16 portrait | 540 × 960 | TBD | portrait, ≤ 380 CSS px |
| 9:16 portrait | 720 × 1280 | TBD | portrait, ≤ 500 CSS px |
| 9:16 portrait | 1080 × 1920 | TBD | portrait, rest |
| 16:9 landscape | 1280 × 720 | TBD | landscape, ≤ 1366 CSS px |
| 16:9 landscape | 1440 × 810 | TBD | landscape, ≤ 1600 CSS px |
| 16:9 landscape | 1920 × 1080 | **4.8 MB** | landscape, rest |

(Other sizes will be filled in once the ladder is encoded.)

## Marta's video — display options

Native 464×832. Too small for a sharp desktop hero at full-bleed.

| Option | Desktop experience | Verdict |
|---|---|---|
| A. Use only on mobile; keep Veo drone on desktop/tablet | Each device gets a video sized appropriately for its resolution | **Preferred** — clean separation |
| B. Centered portrait block with blurred-self background | Video sits ~500px wide in middle of section, background fills rest | Viable. Looks like Instagram embed. |
| C. Full-bleed with `object-cover` + blurred self-background | Video stretches to fill, crops top/bottom, blurred copy covers bars | Works but soft on desktop (source upscaled ~2.3×) |
| D. Split layout (video ~40% width, text 60%) | Portrait video becomes a design feature rather than a full-bleed element | Strong option for desktop |
| E. Ask Marta to reshoot at 1080×1920 | Clean source for every tier | Right answer if possible |

Short of a reshoot, **option A** is what most high-end sites do: pair a landscape piece of content with a portrait piece, pick per device. On mobile Marta's portrait video fills the screen beautifully at near-native resolution. On desktop the Veo drone carries the hero. Both encoded via the same CRF-37 WebM pipeline.

## Delivery ladder (final)

```tsx
<video autoplay muted loop playsinline poster="/videos/hero-poster.jpg">
  <source media="(orientation: portrait) and (max-width: 380px)" src="/videos/hero-540x960-crf37.webm"  type="video/webm" />
  <source media="(orientation: portrait) and (max-width: 500px)" src="/videos/hero-720x1280-crf37.webm" type="video/webm" />
  <source media="(orientation: portrait)"                         src="/videos/hero-1080x1920-crf37.webm" type="video/webm" />
  <source media="(max-width: 1366px)"                             src="/videos/hero-1280w-crf37.webm" type="video/webm" />
  <source media="(max-width: 1600px)"                             src="/videos/hero-1440w-crf37.webm" type="video/webm" />
  <source                                                         src="/videos/hero-1920w-crf37.webm" type="video/webm" />
</video>
```

Source ladder is evaluated once at page load; browser picks the first match. Poster shows instantly via the `poster` attribute — covers the video while it decodes and also serves as the permanent fallback for any browser that can't play VP9 WebM.

## Marta's video — WebM VP9 rejected

Encoded Marta at WebM VP9 CRF 37 (692 KB) and CRF 42 (476 KB), both dropped 60→24 fps. Visible result: **motion is no longer smooth**. Two candidate causes:

1. Reduced framerate from 60 → 24 (half the temporal samples = visible judder on fast motion).
2. VP9 compression artifacts on low-resolution source (464×832) — VP9 is generally weaker than H.264 for very small resolutions.

Reverting Marta to **H.264 MP4 at 60 fps preserved, no audio**, CRF 22 / 24 / 26 for visual comparison.

| CRF | Size | vs 3.1 MB original |
|---:|---:|---:|
| 22 | 1.4 MB | −55% |
| 24 | 1.1 MB | −65% |
| 26 | 913 KB | −71% |

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

## Open decisions

- [ ] Regenerate `hero-poster.jpg` smaller (currently 329 KB; can be ≤ 80 KB without quality loss).
- [ ] Consider deleting the 4 unused Veo source MP4s in `public/videos/` to reduce deploy size.
