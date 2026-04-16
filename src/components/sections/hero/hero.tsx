"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/config/section-ids";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/shared/button";
import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { SectionContent } from "@/components/shared/section-content";

/* ── Hero background video — uncomment ONE ──────────────── */
// const HERO_VIDEO = "/videos/_Slow_overhead_camera_drift_ac_Veo_31_61972.mp4";
// const HERO_VIDEO = "/videos/_Cinematic_slow-motion_overhea_Veo_31_Fast_98682.mp4";
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
        scale: 1,
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
      <SectionContent className="relative z-10 flex flex-1 flex-col justify-end md:flex-row md:items-end md:justify-between ">
        {/* Left text block — pushed to bottom-left */}
        <div ref={textRef} className="max-w-2xl text-white">
          <FadeUp
            as="p"
            trigger="mount"
            delay={0.9}
            duration={1.2}
            y={16}
            className="mt-6 max-w-md "
          >
            <span className="mb-2 block max-w-[42ch] font-sans text-sm md:text-base">
              <span className=" pl-2  ">
                Jedzenie dopasowane do miejsca, ludzi i momentu
              </span>
            </span>
          </FadeUp>
          <ScatterText
            as="h1"
            triggerOnMount
            className="text-heading-hero leading-[80%] text-white not-last-of-type:"
            lines={[{ text: "Nomad" }, { text: "Chef" }]}
          />

          <FadeUp
            as="p"
            trigger="mount"
            delay={1.1}
            duration={1.2}
            y={16}
            className="mt-3 max-w-lg text-body-base"
          >
            <p className=" mt-2 max-w-[42ch] font-sans text-sm md:text-base">
              <span className="   box-decoration-clone  px-1 ">
                Gotuje tam, gdzie mnie potrzebujesz — od prywatnych kolacji,
                przez garden party, po retreaty i wyjazdy w Polsce i za granica.
              </span>
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp
            trigger="mount"
            delay={1.3}
            duration={1.2}
            y={12}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button
              asChild
              variant="coral"
              size="compact"
              // withArrow
              className={`h-fit`}
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
