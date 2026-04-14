"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import { Button } from "@/components/home/button";

import type { StaticImageData } from "next/image";

import ebookFront from "@/app/moodboard/ebook/ebook_1.webp";
import ebookBack from "@/app/moodboard/ebook/ebook_2.webp";

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

const EASE = [0.32, 0.72, 0, 1] as const;
const DURATION = 1.2;
const INTERVAL = 10000;

const TRANSITION = {
  duration: DURATION,
  ease: EASE,
};

/* ─── Progress dots ─── */

function ProgressDots({
  total,
  active,
  onSelect,
}: {
  total: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Slide ${i + 1}`}
          className={`h-3 rounded-full transition-[background-color] duration-500 ${
            i === active
              ? "w-10 bg-yellow"
              : "w-3 bg-white/30 hover:bg-white/50"
          }`}
          style={{ willChange: "background-color" }}
        />
      ))}
    </div>
  );
}

/* ─── Arrow button ─── */

function ArrowButton({
  onClick,
  direction,
}: {
  onClick: () => void;
  direction: "prev" | "next";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "next" ? "Następna" : "Poprzednia"}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={`text-blue ${direction === "prev" ? "rotate-180" : ""}`}
      >
        <path
          d="M4 10h12m0 0l-5-5m5 5l-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

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
    }, INTERVAL);
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
    <section className="relative overflow-hidden">
      {/* Split background — coral left, blue right */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-coral" />
        <div className="w-1/2 bg-electric-blue" />
      </div>

      <div className="relative z-[2] px-6 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
        {/* Eyebrow */}
        <FadeUp className="mb-16" duration={DURATION}>
          <EyebrowTag color="white" withLine lineColor="white">
            Ebook
          </EyebrowTag>
        </FadeUp>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Text — left side (on coral) */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <p className="font-[family-name:var(--font-instrument)] text-lg italic text-white/90 md:text-xl">
              Mój pierwszy ebook.
            </p>

            <h2 className="mt-4 font-[family-name:var(--font-archivo-black)] text-4xl uppercase leading-[0.85] tracking-tighter text-electric-blue md:text-5xl lg:text-6xl">
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
                  transition={TRANSITION}
                  className="absolute inset-0 max-w-[50ch] font-[family-name:var(--font-instrument)] text-lg leading-relaxed text-white/90 md:text-xl"
                >
                  {slide.description}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-12">
              <Button href="#" variant="yellow-solid">
                Kup ebook
              </Button>
            </div>
          </div>

          {/* Ebook cover — right side (on blue) */}
          <div className="relative h-[50vh] md:col-span-6 md:col-start-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                transition={TRANSITION}
                className="flex h-full items-center justify-center"
                style={{ willChange: "transform, opacity" }}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-auto max-w-full rounded-xl object-contain"
                  quality={85}
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
            <ArrowButton direction="prev" onClick={handlePrevWithReset} />
            <ArrowButton direction="next" onClick={handleNextWithReset} />
          </div>
        </div>
      </div>
    </section>
  );
}
