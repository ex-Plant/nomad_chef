"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import { Button } from "@/components/home/button";
import { ProgressDots } from "@/components/home/progress-dots";
import { TRANSITION, DURATION, AUTOPLAY_INTERVAL } from "@/components/home/animation-constants";

import type { StaticImageData } from "next/image";

import ebookFront from "@/moodboard/ebook/ebook_1.webp";
import ebookBack from "@/moodboard/ebook/ebook_2.webp";

/* ─── Data ─────────────────────────────────────────────── */

type SlideT = {
  readonly image: StaticImageData;
  readonly alt: string;
  readonly description: string;
};

const SLIDES: readonly SlideT[] = [
  {
    image: ebookFront,
    alt: "Camp Food — okładka ebooka, widok z przodu",
    description:
      "Jedzenie, które zabierasz ze sobą — w ruch, w naturę, w życie.",
  },
  {
    image: ebookBack,
    alt: "Camp Food — okładka ebooka, widok z tyłu",
    description:
      "38 przepisów opartych na prostocie, jakości i intuicji. Bez spiny. Bez zbędnych zasad.",
  },
] as const;

/* ─── Animation ─── */

const SLIDE_TRANSITION = TRANSITION.slow;

/* ─── Main component ─── */

export function CampFoodSplit() {
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
    <section className="relative overflow-hidden">
      {/* Split background — coral left, blue right */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-coral" />
        <div className="w-1/2 bg-electric-blue" />
      </div>

      <div className="relative z-[2] px-6 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
        {/* Eyebrow */}
        <EyebrowTag color="white" withLine lineColor="white" duration={DURATION.slow}>
          Ebook
        </EyebrowTag>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Text — left side (on coral) */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <p className="text-subtitle-base text-white/90">
              Mój pierwszy ebook.
            </p>

            <h2 className="mt-4 text-heading-md text-electric-blue">
              Camp
              <br />
              Food
            </h2>

            <div className="relative mt-6 h-24 md:h-20">
              <AnimatePresence mode="wait">
                <m.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={SLIDE_TRANSITION}
                  className="absolute inset-0 max-w-[50ch] text-body-lg text-white/90"
                >
                  {slide.description}
                </m.p>
              </AnimatePresence>
            </div>

            <div className="mt-12">
              <Button asChild variant="yellow-solid" withArrow>
                <a href="#">Kup ebook</a>
              </Button>
            </div>
          </div>

          {/* Ebook cover — right side (on blue) */}
          <div className="relative h-[50vh] md:col-span-6 md:col-start-7">
            <AnimatePresence mode="wait">
              <m.div
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
              </m.div>
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
            <Button variant="yellow" size="icon" onClick={handlePrevWithReset} aria-label="Poprzedni">
              <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
            <Button variant="yellow" size="icon" onClick={handleNextWithReset} aria-label="Następny">
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
