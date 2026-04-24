"use client";

import { RefObject, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/shared/button";
import { FadeUp } from "@/components/shared/fade-up";
import { BodyText } from "@/components/shared/body-text";
import { ScatterText } from "@/components/shared/scatter-text";
import { SectionContent } from "@/components/shared/section-content";
import NextImage from "next/image";
import { Loader } from "@/components/shared/loader";
import { scrollToSection } from "@/helpers/scroll-to-section";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

const POSTER_DESKTOP_SRC = "/videos/hero-poster.jpg";
const POSTER_MOBILE_SRC = "/videos/hero-poster-mobile.jpg";
const VIDEO_MOBILE_SRC = "/videos/marta-464x832-crf22.mp4";
const VIDEO_1280_SRC = "/videos/hero-1280w-crf37.webm";
const VIDEO_1440_SRC = "/videos/hero-1440w-crf37.webm";

gsap.registerPlugin(ScrollTrigger);

type HeroPropsT = {
  data: SiteT["hero"];
  isReady: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function Hero({ data, videoRef, isReady }: HeroPropsT) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Source selection via JS — `<source media>` inside <video> is unreliable
  // across browsers (Chrome/iOS Safari sometimes pick the first decodable
  // source regardless of media). Assign src client-side after mount so the
  // server HTML never embeds a src — avoids the browser preloading the wrong
  // variant before hydration can correct it.
  const isPortraitMobile = useMediaQuery(
    "(orientation: portrait) and (max-width: 767px)"
  );
  const isMidViewport = useMediaQuery("(max-width: 1366px)");
  const videoSrc = isPortraitMobile
    ? VIDEO_MOBILE_SRC
    : isMidViewport
      ? VIDEO_1280_SRC
      : VIDEO_1440_SRC;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.src.endsWith(videoSrc)) return;
    video.src = videoSrc;
    video.load();
  }, [videoSrc, videoRef]);

  useGSAP(
    () => {
      if (reducedMotion) return;
      const section = sectionRef.current;
      const image = imageRef.current;
      const text = textRef.current;
      if (!section || !image || !text) return;

      gsap.to(image, {
        scale: 1.5,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [isReady, reducedMotion] }
  );

  return (
    <Section ref={sectionRef} id={SECTION_IDS.hero} className=" min-h-lvh">
      {/* Primary background media with parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ contain: "layout paint" }}
      >
        {/* Poster underneath — also the fallback surface if video never plays */}
        <NextImage
          src={POSTER_MOBILE_SRC}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover md:hidden"
        />
        <NextImage
          src={POSTER_DESKTOP_SRC}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden object-cover md:block"
        />
        <video
          ref={videoRef}
          poster={POSTER_MOBILE_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="relative min-h-full min-w-full object-cover"
        />
        <div className="absolute inset-0 bg-coral/20" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Coral loader overlay — blocks content until video actually plays (or 3s fallback) */}
      <div
        className={`absolute top-0 right-0 left-0 h-[110lvh] z-20 bg-coral transition-opacity duration-2000 ${
          isReady ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Loader className="h-full w-full -translate-y-12" />
      </div>

      {/* Asymmetric layout: text left, floating image right */}
      {isReady && (
        <SectionContent className="relative z-10 flex flex-1 flex-col justify-end md:flex-row md:items-end md:justify-between pb-24 ">
          {/* Left text block — pushed to bottom-left */}
          <div ref={textRef} className="relative text-white ">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-16 -z-10 
              "
            />
            <BodyText
              trigger="mount"
              delay={1.4}
              className="mb-2 md:pl-2 whitespace-pre-line
              "
            >
              {data.tagline}
            </BodyText>
            <ScatterText
              as="h1"
              triggerOnMount
              className="font-display text-7xl sm:text-8xl uppercase leading-[0.85] tracking-[-0.05em] md:text-9xl lg:text-[10rem]"
              lines={data.headingLines}
            />

            <BodyText
              trigger="mount"
              delay={1.8}
              className="mt-6 md:pl-2 whitespace-pre-line"
            >
              {data.lead}
            </BodyText>

            {/* CTAs */}
            <FadeUp
              trigger="mount"
              delay={2.2}
              className="mt-8 flex flex-wrap gap-4"
            >
              {data.ctas[0] && (
                <Button
                  variant="coral"
                  size="compact"
                  onClick={() => scrollToSection(data.ctas[0].href)}
                >
                  {data.ctas[0].label}
                </Button>
              )}
              {data.ctas[1] && (
                <Button
                  size="compact"
                  variant="yellow"
                  onClick={() => scrollToSection(data.ctas[1].href)}
                >
                  {data.ctas[1].label}
                </Button>
              )}
            </FadeUp>
          </div>
        </SectionContent>
      )}
    </Section>
  );
}
