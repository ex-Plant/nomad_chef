"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/config/section-ids";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/shared/button";
import { FadeUp } from "@/components/shared/fade-up";
import { BodyText } from "@/components/shared/body-text";
import { ScatterText } from "@/components/shared/scatter-text";
import { SectionContent } from "@/components/shared/section-content";

/* ── Hero background video — uncomment ONE ──────────────── */
// const HERO_VIDEO = "/videos/_Slow_overhead_camera_drift_ac_Veo_31_61972.mp4";
// const HERO_VIDEO =
// ("/videos/_Cinematic_slow-motion_overhea_Veo_31_Fast_98682.mp4");
// const HERO_VIDEO = "/videos/Can_you_create_another_version_Veo_31_79044.mp4";
const HERO_VIDEO = "/videos/Can_you_create_another_version_Kling_30__04633.mp4";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
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
      {/* Primary background video with parallax */}
      <div ref={imageRef} className="absolute inset-0 z-0 overflow-hidden">
        <video
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="min-h-full min-w-full object-cover"
        />
        <div className="absolute inset-0 bg-coral/30" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Asymmetric layout: text left, floating image right */}
      <SectionContent className="relative z-10 flex flex-1 flex-col justify-end md:flex-row md:items-end md:justify-between pb-12 ">
        {/* Left text block — pushed to bottom-left */}
        <div ref={textRef} className=" text-white">
          <BodyText trigger="mount" delay={0.9} className="mb-2 md:pl-2">
            Jedzenie dopasowane do miejsca, ludzi i momentu
          </BodyText>
          <ScatterText
            as="h1"
            triggerOnMount
            className="font-display text-7xl sm:text-8xl uppercase leading-[0.85] tracking-[-0.05em] md:text-9xl lg:text-[10rem]"
            lines={[{ text: "Nomad" }, { text: "Chef" }]}
          />

          <BodyText trigger="mount" delay={1.1} className="mt-6 md:pl-2">
            Gotuje tam, gdzie mnie potrzebujesz — od prywatnych kolacji, przez
            garden party, po retreaty i wyjazdy w Polsce i za granica.
          </BodyText>

          {/* CTAs */}
          <FadeUp
            trigger="mount"
            delay={1.3}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button
              asChild
              variant="coral"
              size="compact"
              // withArrow
            >
              <a href="#uslugi">Zobacz oferte</a>
            </Button>
            <Button size="compact" asChild variant="yellow">
              <a href="#kontakt">Napisz do mnie</a>
            </Button>
          </FadeUp>
        </div>
      </SectionContent>
    </Section>
  );
}
