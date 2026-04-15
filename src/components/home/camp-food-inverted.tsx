"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { Image } from "@/components/ui/image";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { LinkButton } from "@/components/home/button";
import { RotatingStarburst } from "@/components/home/rotating-starburst";
import { FadeUp } from "@/components/home/fade-up";
import { SectionContent } from "@/components/home/section-content";
import { SECTION_IDS } from "@/components/home/section-ids";
import ebookImg1 from "@/moodboard/ebook/ebook_1.webp";
import ebookImg2 from "@/moodboard/ebook/ebook_2.webp";

export function CampFoodInverted() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bookRotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);
  const book2Y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.campFood}
      className="relative overflow-hidden bg-coral py-24 md:py-32 lg:py-40"
    >
      {/* Decorative starburst — bottom-left, rotates on scroll */}
      <RotatingStarburst
        color="blue"
        size="sm"
        className="absolute -left-8 bottom-12 z-[0] md:-left-6 md:bottom-16"
      />

      <SectionContent className="z-2 relative">
        {/* Eyebrow */}
        <EyebrowTag color="yellow" withLine>
          Ebook
        </EyebrowTag>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Text — right side, 5 cols */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <FadeUp as="h2" delay={0.1} className="text-heading-xl text-electric-blue">
              Camp
              <br />
              Food
            </FadeUp>

            <FadeUp as="p" delay={0.2} className="mt-6 text-subtitle-base text-white/80">
              Moj pierwszy ebook.
            </FadeUp>

            <FadeUp as="p" delay={0.3} className="mt-4 max-w-[50ch] text-body-base text-muted-on-dark">
              Jedzenie, ktore zabierasz ze soba — w ruch, w nature, w zycie. 38
              przepisow opartych na prostocie, jakosci i intuicji. Bez spiny.
              Bez zbednych zasad.
            </FadeUp>

            <FadeUp delay={0.4} className="mt-12">
              <LinkButton href="#" variant="blue">
                Kup ebook
              </LinkButton>
            </FadeUp>
          </div>

          {/* Ebook covers — staggered, with scroll-driven rotation */}
          <div className="relative md:col-span-6 md:col-start-7">
            <FadeUp amount={0.2} delay={0.2} className="relative z-10 mx-auto w-4/5 md:w-full" style={{ rotate: bookRotate, willChange: "transform" }}>
              <Image
                src={ebookImg1}
                alt="Camp Food — okladka ebooka"
                className="aspect-[3/4] w-full rounded-xl object-cover shadow-2xl"
                sizes="(max-width: 768px) 80vw, 40vw"
              />
            </FadeUp>

            <FadeUp amount={0.2} delay={0.4} className="absolute -bottom-8 -left-8 z-20 w-2/5 md:-left-16 md:w-1/3" style={{ y: book2Y, willChange: "transform" }}>
              <div className="overflow-hidden rounded-lg border-4 border-coral shadow-xl">
                <Image
                  src={ebookImg2}
                  alt="Camp Food — wnetrze ebooka"
                  className="aspect-[17/10] w-full object-cover"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </SectionContent>
    </section>
  );
}
