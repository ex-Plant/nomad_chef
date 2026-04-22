# iOS Safari Mobile Services Debugging Log

Status: significantly improved, still needs final device polish.

Last updated: 2026-04-21.

## Goal

Mobile Services should preserve the intended experience:

- full-screen image-backed section
- pinned/parallax feel
- zoom/depth on the image
- text scrolling over the image
- no jump on refresh
- no Safari viewport-height collapse
- no visible image shake

Removing the design, pinning, animation, or parallax is not considered a solution. Those changes are useful only as diagnostics.

## Confirmed Triggers

### Grain Overlay

`GrainOverlay position="fixed"` caused Safari full-height issues.

Current workaround:

```tsx
<main className="relative bg-warm-white">
  ...
  <GrainOverlay position="absolute" zIndex="z-50" />
</main>
```

Keep the grain non-fixed unless deliberately retesting.

### Native Sticky / Fixed Family

The original mobile Services implementation used a full-height sticky image layer. It had the right feel, but on iOS Safari it triggered viewport/full-height instability.

Symptoms included:

- section no longer feeling as tall as the screen
- gaps/padding around the image
- layout not recovering after entering Services
- worse behavior when scroll direction changed

### JS Fake Pin Without Scroll Normalization

The absolute image-track approach preserved the design better, but when driven by normal native iOS scrolling it still shook. This appears to be the classic iOS Safari async scrolling problem: the page scrolls on the compositor thread while JS transform updates arrive on the main thread.

## Fixes That Helped

### Refresh Jump

`src/app/layout.tsx` now injects a `beforeInteractive` script that sets:

```ts
history.scrollRestoration = "manual";
```

On reload without a hash, it forces `scrollTo(0, 0)` early and shortly after load. This fixed the delayed jump from top to Services.

### Root Scroller

`body` now uses:

```tsx
className="min-h-lvh flex flex-col bg-black overflow-x-clip"
```

This avoids root `overflow-x-hidden`, which can create bad Safari root-scroller behavior.

### GSAP Normalize Scroll

Web research found the most relevant official workaround: [`ScrollTrigger.normalizeScroll()`](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll%28%29/).

GSAP documents this as a fix for:

- mobile address bar resizing
- native scroll/main-thread synchronization problems
- iOS Safari jitter from misreported scroll/touch positions

Current mobile Services enables it while the mobile branch is active:

```ts
const normalizer = ScrollTrigger.normalizeScroll(true);
```

Cleanup:

```ts
normalizer?.kill();
ScrollTrigger.normalizeScroll(false);
```

Manual result: significantly better.

## Current Services Strategy

File: `src/components/sections/services/services-parallax.tsx`

Desktop:

- keeps the original sticky/parallax structure
- uses ScrollTrigger for image parallax and text fading

Mobile:

- does not use native sticky
- does not use fixed positioning
- does not use ScrollTrigger pinning
- does not use CSS scroll-timeline
- uses a stable absolute image track
- uses cached measurements plus one rAF transform write
- uses `ScrollTrigger.normalizeScroll(true)` to keep scroll and transforms synchronized on iOS

Mobile structure:

```tsx
<div ref={mobileSectionRef} className="services-mobile-section">
  <div ref={mobileViewportRef} className="services-mobile-viewport-probe" />
  <div className="services-mobile-stage">
    <div ref={mobileImageRef} className="services-mobile-image-track">
      <Image ... />
    </div>
  </div>
  <div className="relative z-10 pt-[50lvh]">
    {slides}
  </div>
</div>
```

The mobile image transform is derived from cached values:

- section start
- section scroll distance
- viewport probe height
- image depth distance

During scroll, the code only writes:

```ts
translate3d(0, y, 0) scale(scale)
```

No layout reads happen during scroll.

## Current Tuning Values

In `services-parallax.tsx`:

```ts
const MOBILE_START_SCALE = 1.03;
const MOBILE_END_SCALE = 1.12;
const MOBILE_DEPTH_RATIO = 0.22;
```

In `globals.css`:

```css
.services-mobile-viewport-probe {
  height: max(100vh, 100lvh);
}

.services-mobile-stage {
  inset: 0;
}

.services-mobile-image-track {
  top: calc(-1 * max(10vh, 10lvh));
  height: max(150vh, 150lvh);
}
```

## Attempts That Did Not Work

- Global fixed grain overlay.
- Native sticky as originally implemented.
- `translateZ(0)` / `will-change` as the main fix.
- `visualViewport.height` CSS variables. This made the section too short.
- CSS scroll-timeline for the mobile image track. It was smooth, but Safari appeared to recalculate/reposition during tiny scroll changes.
- JS fake pinning without `normalizeScroll`. It preserved the look but still shook.
- Reintroducing native sticky after other root fixes. This lost the image / regressed.

## Remaining Concern

`normalizeScroll(true)` improved the Services interaction significantly, but it is a hybrid scroll-normalization approach. It should be tested for:

- native-feeling touch momentum
- interaction with the mobile nav
- behavior when entering/leaving Services
- behavior after orientation changes
- any accessibility side effects

If further polish is needed, tune only the current mobile strategy first:

- `MOBILE_DEPTH_RATIO`
- `MOBILE_START_SCALE`
- `MOBILE_END_SCALE`
- image track height / overscan

Avoid jumping back to unrelated architecture changes unless this strategy is proven unshippable.
