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

gsap.registerPlugin(ScrollTrigger);

type HeroPropsT = { data: SiteT["hero"] };

export function Hero({ data }: HeroPropsT) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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
    <Section
      ref={sectionRef}
      id={SECTION_IDS.hero}
      className="overflow-hidden bg-coral"
    >
      {/* Primary background media with parallax */}
      <div ref={imageRef} className="absolute inset-0 z-0 overflow-hidden">
        {data.media?.mimeType.startsWith("video/") ? (
          <video
            src={data.media.url}
            autoPlay
            loop
            muted
            playsInline
            className="min-h-full min-w-full object-cover"
          />
        ) : data.media ? (
          <Image
            src={data.media.url}
            alt={data.media.alt}
            fill
            priority
            sizes="100vw"
            className="min-h-full min-w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-coral/30" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Asymmetric layout: text left, floating image right */}
      <SectionContent className="relative z-10 flex flex-1 flex-col justify-end md:flex-row md:items-end md:justify-between pb-12 ">
        {/* Left text block — pushed to bottom-left */}
        <div ref={textRef} className=" text-white">
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
    </Section>
  );
}
