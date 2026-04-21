"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { Image } from "@/components/ui/image";
import { SectionContent } from "@/components/shared/section-content";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";

import { useBreakpoint } from "@/hooks/use-media-query";

import { cn } from "@/helpers/cn";

gsap.registerPlugin(ScrollTrigger);

type ServicesPropsT = { data: SiteT["services"] };

export function ServicesParallax({ data }: ServicesPropsT) {
  const SLIDES = data.slides;
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isTablet = useBreakpoint("md");
  const isDesktop = useBreakpoint("lg");

  useGSAP(
    () => {
      const container = containerRef.current;
      const imageWrap = imageRef.current;
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
    { scope: containerRef, dependencies: [isTablet, isDesktop] }
  );

  return (
    <div ref={containerRef} id={SECTION_IDS.services} className="relative z-1 ">
      {/* Sticky layer — image + eyebrow + heading + starburst stay fixed */}
      <div className="sticky top-0 z-1 h-lvh overflow-x-clip">
        {/* Image wrapper — 180% tall, GSAP translates it upward for parallax.
            Own overflow-clip so the scaled image doesn't leak vertically. */}
        <div className="absolute inset-0 overflow-clip">
          <div
            ref={imageRef}
            className="absolute inset-x-0 top-0 h-[180%] will-change-transform"
          >
            {data.background?.url && (
              <Image
                src={data.background.url}
                alt={data.backgroundAlt || data.background.alt}
                fill
                priority
                className="rounded-none object-cover"
                sizes="100vw"
              />
            )}
          </div>
        </div>
        {/* Overlay for text legibility */}
        <div className="absolute inset-0 bg-off-black/20" />

        {/* Eyebrow — inside the sticky layer so it stays pinned for the full section */}
        <div className="absolute inset-x-0 top-0 z-10 pt-12 md:pt-24 ">
          <SectionContent>
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              {data.eyebrow}
            </EyebrowTag>
          </SectionContent>
        </div>
      </div>

      {/* Scrolling text panels — pulled up over the sticky layer via negative margin */}
      <div
        className="relative z-5 pointer-events-none"
        style={{ marginTop: "-100lvh" }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.title}
            className={cn(
              `flex min-h-[min(80lvh,600px)] flex-col py-24 pointer-events-auto
               `,
              i === 0 && "mt-[50lvh]",
              i === SLIDES.length - 1 && "pb-[400px]"
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
                    <span className="bg-yellow text-off-black box-decoration-clone leading-[0.9] px-1 pr-2  font-sans text-sm md:text-base whitespace-pre-line">
                      {slide.tagline}
                    </span>
                  </p>
                )}
                {"description" in slide && (
                  <p className="max-w-sm lg:max-w-md  leading-tight  ">
                    <span className="bg-pink text-off-black box-decoration-clone leading-[0.8] px-1 pr-2  font-sans text-sm md:text-base whitespace-pre-line">
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
