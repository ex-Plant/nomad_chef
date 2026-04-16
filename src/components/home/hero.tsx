"use client";

// import { useRef } from "react";
// import { m, useScroll, useTransform } from "framer-motion";
import { SECTION_IDS } from "@/components/home/section-ids";
import { Section } from "@/components/home/section";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/home/button";
import { FadeUp } from "@/components/home/fade-up";
import { SectionContent } from "@/components/home/section-content";
import heroImg from "@/moodboard/gallery/client-selected-8.webp";

export function Hero() {
  // Parallax temporarily disabled — uncomment to restore:
  // const ref = useRef<HTMLDivElement>(null);
  // const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  // const imageOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  // const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <Section
      id={SECTION_IDS.hero}
      className="overflow-hidden bg-coral"
    >
      {/* Primary background image — parallax temporarily disabled */}
      <div
        className="absolute inset-0 z-0"
      >
        <Image
          src={heroImg}
          alt="Jajko na niebieskim tle — dramatyczna fotografia kulinarna"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          // placeholder="blur"
        />
        <div className="absolute inset-0 bg-coral/40" />
      </div>

      {/* Asymmetric layout: text left, floating image right */}
      <SectionContent className="relative z-10 flex flex-1 flex-col justify-end md:flex-row md:items-end md:justify-between ">
        {/* Left text block — pushed to bottom-left */}
        <div className="max-w-2xl">
          <FadeUp
            as="h1"
            trigger="mount"
            delay={0.4}
            className="text-heading-hero text-white"
          >
            Nomad
            <br />
            Chef
          </FadeUp>

          <FadeUp
            as="p"
            trigger="mount"
            delay={0.8}
            className="mt-6 max-w-md text-subtitle-lg text-white/90"
          >
            Jedzenie dopasowane do miejsca, ludzi i momentu
          </FadeUp>

          <FadeUp
            as="p"
            trigger="mount"
            delay={1.1}
            className="mt-3 max-w-lg text-body-base text-muted-on-dark"
          >
            Gotuje tam, gdzie mnie potrzebujesz — od prywatnych kolacji, przez
            garden party, po retreaty i wyjazdy w Polsce i za granica.
          </FadeUp>

          {/* CTAs */}
          <FadeUp
            trigger="mount"
            delay={1.4}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button
              asChild
              variant="yellow-solid"
              size="compact"
              // withArrow
              className={`h-fit`}
            >
              <a href="#uslugi">Zobacz oferte</a>
            </Button>
            <Button size="compact" asChild variant="coral-solid">
              <a href="#kontakt">Napisz do mnie</a>
            </Button>
          </FadeUp>
        </div>
      </SectionContent>
    </Section>
  );
}
