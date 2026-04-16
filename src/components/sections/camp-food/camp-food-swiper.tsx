"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ScatterText } from "@/components/shared/scatter-text";
import { Image } from "@/components/ui/image";
import { SECTION_IDS } from "@/config/section-ids";
import { Section } from "@/components/shared/section";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { Button } from "@/components/shared/button";
import { Starburst } from "@/components/shared/starburst";
import { SwiperControls } from "@/components/shared/swiper-controls";
import { SectionContent } from "@/components/shared/section-content";
import {
  TRANSITION,
  DURATION,
  AUTOPLAY_INTERVAL,
} from "@/config/animation-constants";

import type { StaticImageData } from "next/image";

import ebookFront from "@/moodboard/ebook/ebook_1.webp";
import ebookBack from "@/moodboard/ebook/ebook_2.webp";

/* ─── Data ─────────────────────────────────────────────── */

type SlideT = {
  readonly image: StaticImageData;
  readonly alt: string;
  readonly bg: string;
  readonly textColor: string;
  readonly headlineColor: string;
  readonly subtitleColor: string;
  readonly bodyColor: string;
  readonly eyebrowColor: "coral" | "blue" | "white" | "yellow";
  readonly eyebrowLineColor: "coral" | "blue" | "white" | "yellow";
  readonly buttonVariant:
    | "coral-solid"
    | "yellow-solid"
    | "blue-solid"
    | "coral"
    | "blue";
  readonly starburstColor: "coral" | "blue" | "yellow";
  readonly description: string;
};

const SLIDES: readonly SlideT[] = [
  {
    image: ebookFront,
    alt: "Camp Food — okładka ebooka, widok z przodu",
    bg: "bg-coral",
    textColor: "text-white",
    headlineColor: "text-electric-blue",
    subtitleColor: "text-white/90",
    bodyColor: "text-muted-on-dark",
    eyebrowColor: "blue",
    eyebrowLineColor: "blue",
    buttonVariant: "blue-solid",
    starburstColor: "blue",
    description:
      "Jedzenie, które zabierasz ze sobą — w ruch, w naturę, w życie.",
  },
  {
    image: ebookBack,
    alt: "Camp Food — okładka ebooka, widok z tyłu",
    bg: "bg-electric-blue",
    textColor: "text-white",
    headlineColor: "text-coral",
    subtitleColor: "text-white/80",
    bodyColor: "text-muted-on-dark",
    eyebrowColor: "coral",
    eyebrowLineColor: "coral",
    buttonVariant: "coral-solid",
    starburstColor: "coral",
    description:
      "38 przepisów opartych na prostocie, jakości i intuicji. Bez spiny. Bez zbędnych zasad.",
  },
] as const;

/* ─── Animation ─── */

const SLIDE_TRANSITION = TRANSITION.slow;

/* ─── Main component ─── */

export function CampFoodSwiper() {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  /* Auto-play */
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_INTERVAL);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_INTERVAL);
    timerRef.current = id;
    return () => clearInterval(id);
  }, []);

  const handleNextWithReset = useCallback(() => {
    handleNext();
    resetTimer();
  }, [handleNext, resetTimer]);

  const handlePrevWithReset = useCallback(() => {
    handlePrev();
    resetTimer();
  }, [handlePrev, resetTimer]);

  const slide = SLIDES[activeIndex];

  return (
    <Section id={SECTION_IDS.campFood}>
      {/* Animated background color — crossfade, no gap */}
      <AnimatePresence>
        <m.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SLIDE_TRANSITION}
          className={`absolute inset-0 ${slide.bg}`}
          style={{ willChange: "opacity" }}
        />
      </AnimatePresence>

      {/* Decorative starburst — bottom-left */}
      <Starburst
        color={slide.starburstColor}
        size="sm"
        rotate
        className="absolute -left-16 bottom-12  md:-left-6 md:bottom-16"
      />

      {/* Decorative starburst — bottom-right */}
      <Starburst
        color={slide.starburstColor}
        size="sm"
        className="absolute  z-3 md:-bottom-20 -right-16"
      />

      <SectionContent className="relative z-1">
        {/* Eyebrow */}
        <EyebrowTag
          color={slide.eyebrowColor}
          lineColor={slide.eyebrowLineColor}
          duration={DURATION.slow}
        >
          Ebook
        </EyebrowTag>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Text — left side */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <p className="text-subtitle-base text-white/90">
              Mój pierwszy ebook.
            </p>

            <ScatterText
              className={`mt-4 text-heading-lg`}
              lines={[
                { text: "Camp", className: slide.headlineColor },
                { text: "Food", className: slide.headlineColor },
              ]}
            />

            <div className="relative mt-6 h-24 md:h-20">
              <AnimatePresence>
                <m.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={SLIDE_TRANSITION}
                  className={`absolute inset-0 max-w-[40ch] text-body-lg ${slide.subtitleColor}`}
                >
                  {slide.description}
                </m.p>
              </AnimatePresence>
            </div>

            <div className="mt-12">
              <Button
                asChild
                variant={slide.buttonVariant}
                // withArrow
                size="compact"
              >
                <a href="#">Kup ebook</a>
              </Button>
            </div>
          </div>

          {/* Ebook cover — single large image, right side */}
          <div className="relative h-[65vh] md:col-span-7 md:col-start-6">
            <AnimatePresence>
              <m.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                transition={SLIDE_TRANSITION}
                className="absolute inset-0 flex h-full items-center justify-center"
                style={{ willChange: "transform, opacity" }}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-auto max-w-full rounded-xl object-contain"
                  sizes="(max-width: 768px) 80vw, 50vw"
                  priority
                />
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        <SwiperControls
          total={SLIDES.length}
          active={activeIndex}
          onPrev={handlePrevWithReset}
          onNext={handleNextWithReset}
          onSelect={(i) => {
            setActiveIndex(i);
            resetTimer();
          }}
          className="mt-16"
        />
      </SectionContent>
    </Section>
  );
}
