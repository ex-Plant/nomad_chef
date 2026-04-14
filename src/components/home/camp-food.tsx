"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { Button } from "@/components/home/button";
import { RotatingStarburst } from "@/components/home/rotating-starburst";
import { FadeUp } from "@/components/home/fade-up";
import ebookImg1 from "@/app/moodboard/ebook/ebook_1.webp";
import ebookImg2 from "@/app/moodboard/ebook/ebook_2.webp";

export function CampFood() {
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
      id="camp-food"
      className="relative overflow-hidden bg-electric-blue py-24 md:py-32 lg:py-40"
    >
      {/* Decorative starburst — bottom-left, rotates on scroll */}
      <RotatingStarburst
        color="coral"
        size="sm"
        className="absolute -left-8 bottom-12 z-[0] md:-left-6 md:bottom-16"
      />

      <div className="px-6 md:px-12 lg:px-20 z-2 relative">
        {/* Eyebrow */}
        <FadeUp className="mb-16">
          <EyebrowTag color="coral" withLine lineColor="coral">
            Ebook
          </EyebrowTag>
        </FadeUp>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Text — right side, 5 cols */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <FadeUp as="h2" delay={0.1} className="font-[family-name:var(--font-archivo-black)] text-5xl uppercase leading-[0.85] tracking-tighter text-coral md:text-7xl lg:text-8xl">
              Camp
              <br />
              Food
            </FadeUp>

            <FadeUp as="p" delay={0.2} className="mt-6 font-[family-name:var(--font-instrument)] text-lg italic text-white/80 md:text-xl">
              Moj pierwszy ebook.
            </FadeUp>

            <FadeUp as="p" delay={0.3} className="mt-4 max-w-[50ch] font-[family-name:var(--font-instrument)] text-base leading-relaxed text-white/70 md:text-lg">
              Jedzenie, ktore zabierasz ze soba — w ruch, w nature, w zycie. 38
              przepisow opartych na prostocie, jakosci i intuicji. Bez spiny.
              Bez zbednych zasad.
            </FadeUp>

            <FadeUp delay={0.4} className="mt-12">
              <Button href="#" variant="coral-solid">
                Kup ebook
              </Button>
            </FadeUp>
          </div>

          {/* Ebook covers — staggered, with scroll-driven rotation */}
          <div className="relative md:col-span-6 md:col-start-7">
            <FadeUp amount={0.2} delay={0.2} className="relative z-10 mx-auto w-4/5 md:w-full" style={{ rotate: bookRotate, willChange: "transform" }}>
              <Image
                src={ebookImg1}
                alt="Camp Food — okladka ebooka"
                className="aspect-[3/4] w-full rounded-xl object-cover shadow-2xl"
                quality={100}
              />
            </FadeUp>

            <FadeUp amount={0.2} delay={0.4} className="absolute -bottom-8 -left-8 z-20 w-2/5 md:-left-16 md:w-1/3" style={{ y: book2Y, willChange: "transform" }}>
              <div className="overflow-hidden rounded-lg border-4 border-electric-blue shadow-xl">
                <Image
                  src={ebookImg2}
                  alt="Camp Food — wnetrze ebooka"
                  className="aspect-[17/10] w-full object-cover"
                  quality={100}
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
