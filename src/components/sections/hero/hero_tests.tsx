"use client";

import { useRef } from "react";
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
import { Image } from "@/components/ui/image";
import NextImage from "next/image";
import { useVideoReady } from "@/hooks/use-video-ready";
import { Loader } from "@/components/shared/loader";
import { scrollToSection } from "@/helpers/scroll-to-section";

const POSTER_SRC = "/videos/hero-poster.jpg";

gsap.registerPlugin(ScrollTrigger);

type HeroPropsT = { data: SiteT["hero"] };

export function HeroTests({ data }: HeroPropsT) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const desktopMedia = data.mediaDesktop;
  const mobileMedia = data.mediaMobile;
  const isVideo = desktopMedia?.mimeType.startsWith("video/") ?? false;
  const { videoRef, isReady } = useVideoReady({
    enabled: isVideo,
    timeoutMs: 5000,
  });


  useGSAP(
    () => {
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

      gsap.to(text, {
        y: -800,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [isReady] }
  );

  return (
    <Section ref={sectionRef} id={SECTION_IDS.hero} className=" min-h-[110lvh]">
      {/* Primary background media with parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ contain: "layout paint" }}
      >
        {isVideo && desktopMedia ? (
          <>
            {/* Poster underneath — also the fallback surface if video never plays */}
            <NextImage
              src={POSTER_SRC}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <video
              ref={videoRef}
              poster={POSTER_SRC}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="relative min-h-full min-w-full object-cover"
            >
              {mobileMedia && (
                <source
                  media="(max-width: 768px)"
                  src={mobileMedia.url}
                  type={mobileMedia.mimeType}
                />
              )}
              <source src={desktopMedia.url} type={desktopMedia.mimeType} />
            </video>
          </>
        ) : desktopMedia ? (
          <Image
            src={desktopMedia.url}
            alt={desktopMedia.alt}
            fill
            priority
            sizes="100vw"
            className="min-h-full min-w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-coral/20" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Coral loader overlay — blocks content until video actually plays (or 3s fallback) */}
      <div
        className={`absolute inset-0 z-20 bg-coral transition-opacity duration-000 ${
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
