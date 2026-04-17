"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import { Image } from "@/components/ui/image";
import { SectionContent } from "@/components/shared/section-content";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";

import { Starburst } from "@/components/shared/starburst";

const SLIDES = CONTENT.services.slides;

/* ── Parallax background image — uncomment ONE ──────────────── */
import parallaxBg from "@/moodboard/gallery/candidates/spread-overhead.jpg";
import { cn } from "../../../helpers/cn";
// import parallaxBg from "@/moodboard/gallery/candidates/table-feast.jpg";
// import parallaxBg from "@/moodboard/gallery/candidates/fresh-ingredients-topdown.jpg";
// import parallaxBg from "@/moodboard/gallery/candidates/spices-colorful-topdown.jpg";
// import parallaxBg from "@/moodboard/gallery/candidates/noodles-fullit's good, but I needed to be more aligned with the scroll justframe.jpg";

gsap.registerPlugin(ScrollTrigger);

/* ─── ServicesParallax — sticky image, scrolling text panels ─── */

export function ServicesParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const starburstRef = useRef<HTMLDivElement>(null);
  const starburstSvgRef = useRef<SVGSVGElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const container = containerRef.current;
      const imageWrap = imageRef.current;
      const starburst = starburstRef.current;
      const svg = starburstSvgRef.current;
      if (!container) return;

      /* Classic parallax: image is 180% viewport height, translates slowly upward.
         Text scrolls at normal speed → image at ~0.25x speed = strong depth. */
      if (imageWrap) {
        gsap.fromTo(
          imageWrap,
          { yPercent: 0, scale: 1 },
          {
            yPercent: -35,
            scale: 1.15,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }

      /* Starburst position and rotation are separate tweens because they need
         different ScrollTrigger ranges: position stops at 90% (parks before the
         last slide), rotation spans 100% (never stops spinning). A single tween
         can only have one start/end range. */
      if (starburst) {
        gsap.fromTo(
          starburst,
          { top: "0%" },
          {
            top: "calc(100% - 6rem)",
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "90% bottom",
              scrub: 1.5,
            },
          }
        );
      }

      /* Starburst rotation — spans full scroll so it never stops spinning */
      if (svg) {
        gsap.fromTo(
          svg,
          { rotation: 0 },
          {
            rotation: 720,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.5,
            },
          }
        );
      }

      /* Text panels — fade out as they scroll up out of the viewport.
         Each panel is 100dvh. Fade from 1→0 as it exits upward. */
      panelRefs.current.forEach((panel) => {
        if (!panel) return;
        gsap.to(panel, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top 20%",
            end: "center top",
            scrub: true,
          },
        });
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div ref={containerRef} id={SECTION_IDS.services} className="relative z-1 ">
      {/* Sticky layer — image + eyebrow + heading + starburst stay fixed */}
      <div className="sticky top-0 z-1 h-dvh overflow-x-clip">
        {/* Image wrapper — 180% tall, GSAP translates it upward for parallax.
            Own overflow-clip so the scaled image doesn't leak vertically. */}
        <div className="absolute inset-0 overflow-clip">
          <div
            ref={imageRef}
            className="absolute inset-x-0 top-0 h-[180%] will-change-transform"
          >
            <Image
              src={parallaxBg}
              alt={CONTENT.services.backgroundAlt}
              fill
              priority
              className="rounded-none object-cover"
              sizes="100vw"
            />
          </div>
        </div>
        {/* Overlay for text legibility */}
        <div className="absolute inset-0 bg-off-black/30" />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-off-black/60 via-transparent to-transparent" /> */}

        {/* Eyebrow — inside the sticky layer so it stays pinned for the full section */}
        <div className="absolute inset-x-0 top-0 z-10 py-24">
          <SectionContent>
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              {CONTENT.services.eyebrow}
            </EyebrowTag>
          </SectionContent>
        </div>

        {/* Decorative starburst — starts top-right, GSAP moves it to bottom-right */}
        <div
          ref={starburstRef}
          className="absolute -right-12 top-0 z-4 -translate-y-1/3  md:-right-20"
        >
          <Starburst
            variant="v1-b"
            color="yellow"
            size="md"
            svgRef={starburstSvgRef}
          />
        </div>
      </div>

      {/* Scrolling text panels — pulled up over the sticky layer via negative margin */}
      <div
        className="relative z-5 pointer-events-none"
        style={{ marginTop: "-100dvh" }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.title}
            className={cn(
              `flex min-h-dvh flex-col py-24 pointer-events-auto
               drop-shadow-[0_0_60px_rgba(0,0,0,0.5)]
               
               `,
              i === 0 && "mt-[50dvh]"
            )}
          >
            <div
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
            >
              <SectionContent className=" ">
                <h3 className="max-w-sm sm:max-w-xl lg:max-w-2xl ">
                  <span className="bg-coral text-white box-decoration-clone leading-[0.9] pr-2 max-w-[12ch] text-heading-lg tracking-tight">
                    {slide.title}
                  </span>
                </h3>
                {"tagline" in slide && (
                  <p className="mt-8 max-w-sm sm:max-w-md leading-tight mb-2 ">
                    <span className="bg-yellow text-off-black box-decoration-clone leading-[0.9] px-1 pr-2  font-sans text-sm md:text-base  ">
                      {slide.tagline}
                    </span>
                  </p>
                )}
                {"description" in slide && (
                  <p className="max-w-sm lg:max-w-md  leading-tight  ">
                    <span className="bg-pink text-off-black box-decoration-clone leading-[0.8] px-1 pr-2  font-sans text-sm md:text-base">
                      {slide.description}
                    </span>
                  </p>
                )}
              </SectionContent>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
