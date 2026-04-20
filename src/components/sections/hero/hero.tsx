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
import { useBreakpoint } from "@/hooks/use-media-query";
import { Loader } from "@/components/shared/loader";

gsap.registerPlugin(ScrollTrigger);

type HeroPropsT = { data: SiteT["hero"] };

export function Hero({ data }: HeroPropsT) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const desktopMedia = data.mediaDesktop;
  const mobileMedia = data.mediaMobile;
  const isVideo = desktopMedia?.mimeType.startsWith("video/") ?? false;
  const isLg = useBreakpoint("lg");
  const posterSrc = isLg
    ? "/videos/hero-poster.jpg"
    : "/videos/hero-poster-mobile.jpg";
  const { videoRef, isReady } = useVideoReady({
    enabled: isVideo,
    timeoutMs: 3000,
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const image = imageRef.current;
      const text = textRef.current;
      if (!section || !image || !text) return;

      gsap.to(image, {
        // scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(text, {
        y: -400,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <Section ref={sectionRef} id={SECTION_IDS.hero} className=" min-h-dvh">
      {/* Primary background media with parallax */}
      <div ref={imageRef} className="absolute inset-0 z-0 overflow-hidden ">
        {isVideo && desktopMedia ? (
          <>
            {/* Poster underneath — also the fallback surface if video never plays */}
            <NextImage
              src={posterSrc}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* TODO: once client picks final videos, serve optimized variants from /public/videos
                and switch back to static <source> tags like the commented block below.
                For now videos are served from Payload media (desktop + mobile uploads). */}
            {/*
            <video
              ref={videoRef}
              poster="/videos/hero-poster.jpg"
              autoPlay loop muted playsInline preload="auto"
              className="relative min-h-full min-w-full object-cover"
            >
              <source media="(max-width: 768px)" src="/videos/marta-464x832-crf22.mp4" type="video/mp4" />
              <source media="(max-width: 1366px)" src="/videos/hero-1280w-crf37.webm" type="video/webm" />
              <source media="(max-width: 1600px)" src="/videos/hero-1440w-crf37.webm" type="video/webm" />
              <source src="/videos/hero-1920w-crf37.webm" type="video/webm" />
            </video>
            */}
            <video
              ref={videoRef}
              poster={posterSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
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
      </div>

      {/* Coral loader overlay — blocks content until video actually plays (or 3s fallback) */}
      <div
        className={`absolute inset-0 z-20 bg-coral transition-opacity duration-500 ${
          isReady ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Loader className="h-full w-full" />
      </div>

      {/* Asymmetric layout: text left, floating image right */}
      {isReady && (
        <SectionContent className="relative z-10 flex flex-1 flex-col justify-end md:flex-row md:items-end md:justify-between pb-12 ">
          {/* Left text block — pushed to bottom-left */}
          <div ref={textRef} className="relative text-white ">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-16 -z-10 
                 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_70%)]
              "
            />
            <BodyText trigger="mount" delay={0.9} className="mb-2 md:pl-2 whitespace-pre-line">
              {data.tagline}
            </BodyText>
            <ScatterText
              as="h1"
              triggerOnMount
              className="font-display text-7xl sm:text-8xl uppercase leading-[0.85] tracking-[-0.05em] md:text-9xl lg:text-[10rem]"
              lines={data.headingLines}
            />

            <BodyText trigger="mount" delay={1.1} className="mt-6 md:pl-2 whitespace-pre-line">
              {data.lead}
            </BodyText>

            {/* CTAs */}
            <FadeUp
              trigger="mount"
              delay={1.3}
              className="mt-8 flex flex-wrap gap-4"
            >
              {data.ctas[0] && (
                <Button asChild variant="coral" size="compact">
                  <a href={data.ctas[0].href}>{data.ctas[0].label}</a>
                </Button>
              )}
              {data.ctas[1] && (
                <Button size="compact" asChild variant="yellow">
                  <a href={data.ctas[1].href}>{data.ctas[1].label}</a>
                </Button>
              )}
            </FadeUp>
          </div>
        </SectionContent>
      )}
    </Section>
  );
}
