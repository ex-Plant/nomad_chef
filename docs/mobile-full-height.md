# iOS Safari — Full-Height & Sticky Debugging Log

Two related mobile-Safari issues are tracked here:

1. **Full-height rendering** — making the app paint under the iOS bottom chrome / home indicator.
2. **`position: sticky` regression on iOS 26** — sticky elements trigger a viewport recalc mid-scroll, shortening the visible area by the chrome height.

---

## Issue 1 — Full-height / edge-to-edge rendering

### Goal

Force the app to paint edge-to-edge so background color (warm-white / section colors) fills into the bottom safe-area inset, and sections using `100lvh` / `100dvh` fill the full device height.

### Fixes applied (resolved)

1. **`viewport-fit=cover`** via Next.js Viewport export (`src/app/layout.tsx`).
   ```ts
   export const viewport: Viewport = {
     width: "device-width",
     initialScale: 1,
     viewportFit: "cover",
   };
   ```
   Enables `env(safe-area-inset-*)`. Insufficient on its own.

2. **Removed `h-full` from `<html>`**. `h-full` pins html to the small viewport (svh) on iOS. `min-h-lvh` on body is enough.

3. **Changed `<body>` from `overflow-x-hidden` → `overflow-x-clip`**. `overflow-hidden` creates a scroll container on body, which on iOS Safari disables chrome auto-collapse because body stops being the root scroller. `overflow-clip` just clips paint — no scroll container, chrome collapse works again.

### Key insight

iOS Safari collapses its bottom chrome **only while the page behaves like a plain document scroll** — i.e. `html`/`body` are the root scroller and there are no CSS properties creating a sub-scroll context on the root.

---

## Issue 2 — iOS 26 Safari sticky/fixed regression

### Symptom

On iOS 26.0, scrolling into a section that contains a `position: sticky` (or `position: fixed`) descendant causes Safari to:

- Stop collapsing the URL chrome.
- Recalc the visible viewport to `svh`.
- The sections sized with `100lvh` overflow by the chrome height → apparent "bottom padding" / short viewport.
- The effect does **not** happen on page load — it is triggered when the sticky element enters the viewport during scroll.

### Root cause

Confirmed WebKit regression introduced in iOS 26.0. Apple partially fixed it in **iOS 26.1**.

- **WebKit bug 297779** — Fixed elements move up and down when scroll direction changes: https://bugs.webkit.org/show_bug.cgi?id=297779
- **mastodon/mastodon#36144** — Incorrectly positioned elements and broken scrolling on iOS 26: https://github.com/mastodon/mastodon/issues/36144
- **Discourse Meta** — iOS 26 bugs with fixed position elements: https://meta.discourse.org/t/ios-26-bugs-with-fixed-position-elements-in-discourse/382831
- **Apple Community** — iOS 26 viewport bug: https://discussions.apple.com/thread/256138682

### Affected surfaces in this project

- `src/components/sections/services/services-parallax.tsx` — sticky parallax hero was the initial reproduction case.
- `src/components/ui/grain-overlay.tsx` when used with `position="fixed"` — same bug family (full-viewport fixed element pins chrome visible).

### Attempts log

#### 1. Swap `lvh` → `svh` / `dvh` on sticky layer
**Result:** No effect on the recalc. Symptom is the sticky itself, not the viewport unit.

#### 2. `[transform:translateZ(0)]` GPU-layer promotion on sticky
**Canonical workaround** from WebKit/LinkedIn threads. Forces the element onto its own compositor layer.
**Result:** No effect on our test device (iOS 26.0). Promotes the layer but doesn't stop sticky re-evaluation.

#### 3. GSAP `ScrollTrigger.pin: true` with `pinSpacing: false`
Replaces CSS sticky with GSAP-driven `position: fixed` during the pinned phase.
**Result:** Same bug. GSAP pin uses `position: fixed` internally, which falls into the same iOS 26 regression family as sticky.

#### 4. `ScrollTrigger.config({ ignoreMobileResize: true })`
Prevents GSAP from refreshing on chrome-toggle resize events.
**Result:** Helpful as a general hygiene, but does **not** fix the underlying layout recalc triggered by Safari itself. Kept regardless.

#### 5. Transform-based fake sticky — `position: relative` + GSAP-animated `translateY`
Avoids both `position: sticky` and `position: fixed` entirely. Layer is in normal flow; GSAP scrubs `translateY` from `0` to `containerHeight - viewportHeight` across the container scroll, producing the same visual effect as sticky.
**Result:** The Safari bug does not trigger (no sticky, no fixed). However, motion is visibly janky on ProMotion (120Hz native scroll vs. 60Hz rAF-driven JS transform).

#### 6. CSS scroll-driven animation with `@supports` fallback (current)
- Fallback: `position: sticky` (works on iOS ≤25 and all other non-affected browsers — those versions don't have the bug).
- Modern browsers (iOS 26+, Chrome 115+, Firefox 130+): `@supports (animation-timeline: view())` matches and the sticky is replaced with `position: relative` + a compositor-driven scroll-timeline animation. The `view-timeline` is on the container; the animation translates the pinned layer by `var(--pin-distance)` (set in JS to `containerHeight - viewportHeight`) across `animation-range: entry 100% exit 0%`.
- CSS in `src/app/globals.css` (`.services-pin-container` / `.services-pin-target`).
- JS updates `--pin-distance` in `useLayoutEffect` on mount and `resize`.

**Why this sidesteps the bug:** no `position: sticky` and no `position: fixed` on the modern path; the translate is composited by the browser and runs at native scroll rate.

**Known trade-off:** older browsers (iOS ≤25) still use `position: sticky` via the fallback, but those versions don't carry the iOS 26 regression, so they're fine.

### Not yet tried / to revisit

- Nested scroll container — putting the sticky inside a local `overflow-y: auto` that owns its own scroll rather than participating in the root scroll. (User experimented with this in services-parallax.tsx around 2026-04-21; leaving to evaluate.)
- `contain: paint` / `isolation: isolate` on the sticky to hint at compositor isolation. Theoretical, not tested.
- Testing on iOS 26.1+. Several reports indicate the regression is largely fixed in 26.1.

---

## Environment

- Device: iPhone (model TBD — confirm)
- iOS version: **26.0** (upgrade to 26.1+ partially mitigates issue 2)
- Browser: Safari
- Build: local dev
