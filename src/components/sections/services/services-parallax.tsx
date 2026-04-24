"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { SectionContent } from "@/components/shared/section-content";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { ServicesBackground } from "./services-background";
import { ServicesSlideText } from "./services-slide-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type ServicesPropsT = { data: SiteT["services"] };

/* Services parallax — fake-pin workaround for iOS Safari 26 sticky bug.
   =====================================================================
   Mobile variant (<md). Desktop uses the simpler CSS-sticky version in
   services-sticky.tsx — iOS Safari 26 introduced a regression where
   `position: sticky` (and `ScrollTrigger.pin`, which rides the same
   compositor path) jitters or detaches mid-scroll while the URL bar
   collapses/expands, so mobile gets this JS-driven fake pin instead.
   Workaround approach:
   - No CSS sticky, no ScrollTrigger.pin. The pin is faked entirely in JS:
     an absolutely-positioned stage inside a tall section, with a scroll-
     driven `translate3d` that cancels out the section's scroll so the stage
     reads as visually pinned.
   - Slides live in a vertical track inside the stage, counter-translated
     upward by the same amount so they scroll naturally bottom→top during
     the pin range.
   - `ScrollTrigger.normalizeScroll(true)` is enabled for the lifetime of
     this effect to keep GSAP's scroll events in sync with iOS's deferred
     scroll updates.
   Stage is extended 20lvh above section top and the section has
   `overflow-clip` so the extension is hidden from the preceding section.
   The 20lvh upward buffer lets the image pre-cover the viewport top when
   the iOS URL bar toggles during the pin. */

/* Stage geometry — everything downstream (section height, track offset,
   eyebrow offset) is derived from these. */
const STAGE_HEIGHT_LVH = 140;
const STAGE_OFFSET_LVH = 20;
const STAGE_COVERAGE_LVH = STAGE_HEIGHT_LVH - STAGE_OFFSET_LVH;
const IMAGE_TRAVEL_PCT = 28;
// Per-slide height in lvh. Drives track height, per-slide travel distance,
// and section total height — changing this shrinks/stretches the pin range.
const SLIDE_HEIGHT_LVH = 70;
const SLIDE_HEIGHT_FRAC = SLIDE_HEIGHT_LVH / 100;

export function ServicesParallax({ data }: ServicesPropsT) {
  const SLIDES = data.slides;
  const slideCount = SLIDES.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  // Extra slide-heights of travel past the last slide's center so it fully
  // fades/exits before the pin releases.
  const EXIT_BUFFER = 0;

  useGSAP(
    () => {
      if (reducedMotion) return;
      const section = sectionRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      const imageWrap = imageRef.current;
      if (!section || !stage || !track || !imageWrap) return;

      const normalizer = ScrollTrigger.normalizeScroll(true);

      const travelUnits = Math.max(slideCount - 1 + EXIT_BUFFER, 0);
      const lastOpacities = new Array(contentRefs.current.length).fill(-1);

      let pinDistance = 0;
      let maxTrackTranslate = 0;

      const measure = () => {
        const vh = window.innerHeight;
        const slidePx = vh * SLIDE_HEIGHT_FRAC;
        pinDistance = travelUnits * slidePx;
        maxTrackTranslate = travelUnits * slidePx;
        // Derive effective stage coverage from offsetHeight so the section
        // height stays lvh-consistent across iOS URL bar toggles (innerHeight
        // shrinks with the URL bar but lvh does not).
        const stageHeight =
          (stage.offsetHeight * STAGE_COVERAGE_LVH) / STAGE_HEIGHT_LVH;
        section.style.height = `${pinDistance + stageHeight}px`;
      };

      measure();

      // Slide opacity = f(|offset - i|) where offset = progress * travelUnits.
      // |rel| = 0 → centered in viewport, |rel| = 1 → fully offscreen.
      const FULL_VISIBLE = 0.4; // below this |rel|, opacity = 1
      const INVISIBLE = 0.95; // above this |rel|, opacity = 0

      const applyTransforms = (progress: number) => {
        const ty = progress * pinDistance;
        const trackTy = -progress * maxTrackTranslate;
        stage.style.transform = `translate3d(0, ${ty}px, 0)`;
        track.style.transform = `translate3d(0, ${trackTy}px, 0)`;
        imageWrap.style.transform = `translateY(${-progress * IMAGE_TRAVEL_PCT}%)`;

        const offset = progress * travelUnits;
        for (let i = 0; i < contentRefs.current.length; i++) {
          const el = contentRefs.current[i];
          if (!el) continue;
          const d = Math.abs(offset - i);
          const opacity =
            d <= FULL_VISIBLE
              ? 1
              : d >= INVISIBLE
                ? 0
                : 1 - (d - FULL_VISIBLE) / (INVISIBLE - FULL_VISIBLE);
          // Skip redundant DOM writes when the value hasn't meaningfully
          // changed — non-active slides stay pinned at 0 for most of the pin.
          if (Math.abs(opacity - lastOpacities[i]) < 0.001) continue;
          lastOpacities[i] = opacity;
          el.style.opacity = `${opacity}`;
        }
      };

      applyTransforms(0);

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${pinDistance}`,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          applyTransforms(self.progress);
        },
        onUpdate: (self) => applyTransforms(self.progress),
      });

      return () => {
        st.kill();
        normalizer?.kill();
        ScrollTrigger.normalizeScroll(false);
      };
    },
    { scope: sectionRef, dependencies: [slideCount, reducedMotion] }
  );

  return (
    <div
      ref={sectionRef}
      id={SECTION_IDS.services}
      className="relative z-1 overflow-clip bg-off-black"
      style={{
        height: `calc(${(slideCount - 1 + EXIT_BUFFER) * SLIDE_HEIGHT_LVH + STAGE_COVERAGE_LVH}lvh)`,
      }}
    >
      <div
        ref={stageRef}
        className="absolute inset-x-0 w-full overflow-hidden will-change-transform"
        style={{
          top: `-${STAGE_OFFSET_LVH}lvh`,
          height: `${STAGE_HEIGHT_LVH}lvh`,
        }}
      >
        <ServicesBackground data={data} imageRef={imageRef} />

        {/* Eyebrow and track are offset by STAGE_OFFSET_LVH so they visually
            sit at section-top, compensating the stage's upward extension. */}
        <div
          className="absolute inset-x-0 z-20 pt-12"
          style={{ top: `${STAGE_OFFSET_LVH}lvh` }}
        >
          <SectionContent>
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              {data.eyebrow}
            </EyebrowTag>
          </SectionContent>
        </div>

        <div
          ref={trackRef}
          className="absolute left-0 flex w-screen flex-col items-stretch will-change-transform z-10"
          style={{
            top: `${STAGE_OFFSET_LVH}lvh`,
            height: `${slideCount * SLIDE_HEIGHT_LVH}lvh`,
          }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.title}
              className="flex w-screen shrink-0 flex-col justify-end pb-24"
              style={{ height: `${SLIDE_HEIGHT_LVH}lvh` }}
            >
              <div
                ref={(el) => {
                  contentRefs.current[i] = el;
                }}
                style={{ opacity: i === 0 ? 1 : 0 }}
                className="will-change-[opacity]"
              >
                <SectionContent>
                  <ServicesSlideText slide={slide} />
                </SectionContent>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
