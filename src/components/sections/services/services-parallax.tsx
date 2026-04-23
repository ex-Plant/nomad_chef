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
   - Stage is h-[120lvh] so the image still covers the viewport when iOS's
     URL bar is visible and innerHeight < lvh.
   Stage is constrained to the section's own bounds — never extended above
   `top-0` — because extending upward causes the image to draw over the
   previous section (About). Accept the brief pre-pin strip of the previous
   section at the top as a consequence. */
export function ServicesParallax({ data }: ServicesPropsT) {
  const SLIDES = data.slides;
  const slideCount = SLIDES.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Extra slide-heights of travel past the last slide's center so it fully
  // fades/exits before the pin releases.
  const EXIT_BUFFER = 0.75;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!section || !stage || !track) return;

      const normalizer = ScrollTrigger.normalizeScroll(true);

      const travelUnits = Math.max(slideCount - 1 + EXIT_BUFFER, 0);

      let pinDistance = 0;
      let maxTrackTranslate = 0;

      const measure = () => {
        const vh = window.innerHeight;
        pinDistance = travelUnits * vh;
        maxTrackTranslate = travelUnits * vh;
        // Lock section height to pinDistance (px, from innerHeight) + the
        // actual stage height so the stage fully exits before the section
        // ends, even when the stage is taller than the viewport on mobile.
        const stageHeight = stage.offsetHeight;
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

        // Image parallax: yPercent 0 → -35, scale 1 → 1.15 across the pin
        // range. 2D transform (no translate3d) so the image stays in the
        // stage's compositor layer and doesn't get pre-rasterized then
        // upscaled.
        const image = imageRef.current;
        if (image) {
          const iy = -progress * 35;
          const scale = 1 + progress * 0.15;
          image.style.transform = `translateY(${iy}%) scale(${scale})`;
        }

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
    { scope: sectionRef, dependencies: [slideCount] }
  );

  return (
    <div
      ref={sectionRef}
      id={SECTION_IDS.services}
      className="relative z-1 bg-off-black"
      style={{ height: `calc(${slideCount + EXIT_BUFFER} * 100lvh)` }}
    >
      {/* Stage — absolute inside the tall section, constrained to section
          bounds (top-0). JS drives translateY to fake a CSS `sticky`. Image
          is pinned; the vertical slide track inside is counter-translated so
          slides read as normal scroll. Stage is 120lvh tall so the image
          covers the viewport when the iOS URL bar is visible. */}
      <div
        ref={stageRef}
        className="absolute inset-x-0 top-0 h-[120lvh] w-full overflow-hidden will-change-transform"
      >
        <ServicesBackground data={data} imageRef={imageRef} />

        {/* Eyebrow — pinned to top of stage */}
        <div className="absolute inset-x-0 top-0 z-20 pt-12">
          <SectionContent>
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              {data.eyebrow}
            </EyebrowTag>
          </SectionContent>
        </div>

        {/* Vertical track — N × 100lvh tall, translateY driven by scroll */}
        <div
          ref={trackRef}
          className="absolute top-0 left-0 flex w-screen flex-col items-stretch will-change-transform z-10"
          style={{ height: `${slideCount * 100}lvh` }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.title}
              className="flex h-lvh w-screen shrink-0 flex-col justify-end pb-24"
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
