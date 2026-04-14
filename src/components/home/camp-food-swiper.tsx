"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";
import { SECTION_IDS } from "@/components/home/section-ids";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import { Button } from "@/components/home/button";
import { RotatingStarburst } from "@/components/home/rotating-starburst";
import { ProgressDots } from "@/components/home/progress-dots";
import { ArrowButton } from "@/components/home/arrow-button";
import { TRANSITION, DURATION, AUTOPLAY_INTERVAL } from "@/components/home/animation-constants";

import type { StaticImageData } from "next/image";

import ebookFront from "@/app/moodboard/ebook/ebook_1.webp";
import ebookBack from "@/app/moodboard/ebook/ebook_2.webp";

/* ─── Data ─────────────────────────────────────────────── */

type SlideT = {
  readonly image: StaticImageData;
  readonly alt: string;
  readonly bg: string;
  readonly textColor: string;
  readonly headlineColor: string;
  readonly subtitleColor: string;
  readonly bodyColor: string;
  readonly eyebrowColor: "coral" | "white" | "yellow";
  readonly eyebrowLineColor: "coral" | "white" | "yellow";
  readonly buttonVariant: "coral-solid" | "yellow-solid";
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
    bodyColor: "text-white/70",
    eyebrowColor: "white",
    eyebrowLineColor: "white",
    buttonVariant: "yellow-solid",
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
    bodyColor: "text-white/70",
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
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

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
    <section id={SECTION_IDS.campFood} className="relative overflow-hidden">
      {/* Animated background color — crossfade, no gap */}
      <AnimatePresence>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SLIDE_TRANSITION}
          className={`absolute inset-0 ${slide.bg}`}
          style={{ willChange: "opacity" }}
        />
      </AnimatePresence>

      {/* Decorative starburst */}
      <RotatingStarburst
        color={slide.starburstColor}
        size="sm"
        className="absolute -left-8 bottom-12 z-[1] md:-left-6 md:bottom-16"
      />

      <div className="relative z-[2] px-6 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
        {/* Eyebrow */}
        <FadeUp className="mb-16" duration={DURATION.slow}>
          <EyebrowTag
            color={slide.eyebrowColor}
            withLine
            lineColor={slide.eyebrowLineColor}
          >
            Ebook
          </EyebrowTag>
        </FadeUp>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Text — left side */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <p className="text-subtitle text-lg text-white/90 md:text-xl">
              Mój pierwszy ebook.
            </p>

            <h2
              className={`mt-4 text-heading text-4xl md:text-5xl lg:text-6xl ${slide.headlineColor}`}
            >
              Camp
              <br />
              Food
            </h2>

            <div className="relative mt-6 h-24 md:h-20">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={SLIDE_TRANSITION}
                  className={`absolute inset-0 max-w-[50ch] text-body text-lg md:text-xl ${slide.subtitleColor}`}
                >
                  {slide.description}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-12">
              <Button href="#" variant={slide.buttonVariant}>
                Kup ebook
              </Button>
            </div>
          </div>

          {/* Ebook cover — single large image, right side */}
          <div className="relative h-[50vh] md:col-span-6 md:col-start-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                transition={SLIDE_TRANSITION}
                className="flex h-full items-center justify-center"
                style={{ willChange: "transform, opacity" }}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-auto max-w-full rounded-xl object-contain"
                  sizes="(max-width: 768px) 80vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-16 flex items-center justify-between">
          <ProgressDots
            total={SLIDES.length}
            active={activeIndex}
            onSelect={(i) => {
              setActiveIndex(i);
              resetTimer();
            }}
          />
          <div className="flex gap-3">
            <ArrowButton direction="prev" onClick={handlePrevWithReset} color="yellow" />
            <ArrowButton direction="next" onClick={handleNextWithReset} color="yellow" />
          </div>
        </div>
      </div>
    </section>
  );
}
