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
import { cn } from "../../../helpers/cn";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type PropsT = { data: SiteT["services"] };

/* Services sticky — desktop variant.
   =====================================================================
   Native CSS sticky pins the image + eyebrow while the text panels below
   scroll naturally over it. Each panel fades out as it exits the viewport
   top. This is the simple, reliable implementation; the JS fake-pin in
   services-parallax.tsx exists only to work around the iOS Safari 26
   sticky regression on mobile.
   Used by <Services> on viewports >= md (768px). */
export function ServicesSticky({ data }: PropsT) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const container = containerRef.current;
      const imageWrap = imageRef.current;
      if (!container || !imageWrap) return;

      gsap.fromTo(
        imageWrap,
        { yPercent: 0 },
        {
          yPercent: -28,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      // Fade each panel out as it scrolls past the top of the viewport.
      panelRefs.current.forEach((panel) => {
        if (!panel) return;
        gsap.to(panel, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top 30%",
            end: "center top",
            scrub: true,
          },
        });
      });
    },
    { scope: containerRef, dependencies: [data.slides.length, reducedMotion] }
  );

  return (
    <div
      ref={containerRef}
      id={SECTION_IDS.services}
      className="relative z-1"
    >
      {/* Sticky image + eyebrow — pinned for the full section */}
      <div className="sticky top-0 z-1 h-dvh overflow-hidden">
        <ServicesBackground data={data} imageRef={imageRef} />
        <div className="absolute inset-x-0 top-0 z-20 pt-24">
          <SectionContent>
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              {data.eyebrow}
            </EyebrowTag>
          </SectionContent>
        </div>
      </div>

      {/* Scrolling text panels — pulled up over the sticky layer */}
      <div className="relative z-5" style={{ marginTop: "-100dvh" }}>
        {data.slides.map((slide, i) => (
          <div
            key={slide.title}
            className={cn(
              "flex min-h-[80lvh] w-screen shrink-0 flex-col justify-end pb-24 md:pb-32 will-change-[opacity,height]",
              i === 0 && "h-lvh"
            )}
          >
            <SectionContent>
              <div
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                <ServicesSlideText slide={slide} />
              </div>
            </SectionContent>
          </div>
        ))}
        <div className="h-[50lvh]" />
      </div>
    </div>
  );
}
