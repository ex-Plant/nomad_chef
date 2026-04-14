"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import { RotatingStarburst } from "@/components/home/rotating-starburst";
import { ArrowButton } from "@/components/home/arrow-button";
import { SLIDES_EDITORIAL } from "@/components/home/services-slider-data";

/* ─── Animation presets ─── */

const TEXT_VARIANTS = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
} as const;

const TEXT_TRANSITION = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1] as const,
};

/* ─── Progress dots ─── */

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-3 rounded-full transition-all duration-300 ${
            i === active ? "w-8 bg-yellow" : "w-3 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Main component — fullscreen bg, text only ─── */

export function ServicesSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES_EDITORIAL.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + SLIDES_EDITORIAL.length) % SLIDES_EDITORIAL.length
    );
  }, []);

  /* Auto-play: advances every 8s, resets timer on manual navigation */
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES_EDITORIAL.length);
    }, 8000);
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

  const active = SLIDES_EDITORIAL[activeIndex];

  return (
    <section id="uslugi" className="relative min-h-[100dvh] overflow-x-clip">
      {/* All images stacked — crossfade via opacity */}
      {SLIDES_EDITORIAL.map((slide, i) => (
        <motion.div
          key={slide.title}
          initial={false}
          animate={{ opacity: i === activeIndex ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </motion.div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-off-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-off-black/60 via-transparent to-transparent" />

      {/* Decorative starburst — top-right */}
      <RotatingStarburst
        color="yellow"
        size="md"
        className="absolute -right-10 -top-20 z-[2] md:-right-12 md:-top-28 lg:-top-32"
      />

      {/* Content layer */}
      <div className="relative z-[1] flex min-h-[100dvh] flex-col justify-between px-6 pb-10 pt-20 md:px-12 md:pb-14 md:pt-28 lg:px-20 lg:pb-16 lg:pt-32">
        {/* Top: eyebrow + heading */}
        <div>
          <FadeUp className="mb-6">
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              Oferta
            </EyebrowTag>
          </FadeUp>

          <FadeUp
            as="h2"
            delay={0.1}
            className="max-w-2xl font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.85] tracking-tighter text-white md:text-5xl lg:text-6xl"
          >
            Co mogę
            <br />
            dla Ciebie
            <br />
            <span className="text-yellow">ugotować</span>
          </FadeUp>
        </div>

        {/* Bottom: slide text + controls */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={TEXT_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TEXT_TRANSITION}
              className="max-w-2xl"
            >
              <p className="font-[family-name:var(--font-geist-sans)] text-[10px] uppercase tracking-[0.24em] text-white/55">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {SLIDES_EDITORIAL.length}
              </p>
              <h3 className="mt-4 max-w-[12ch] font-[family-name:var(--font-archivo-black)] text-4xl uppercase leading-[0.86] tracking-tight text-white md:text-6xl lg:text-7xl">
                {active.title}
              </h3>

              <p className="mt-4 max-w-[24ch] font-[family-name:var(--font-instrument)] text-xl italic leading-snug text-white/86 md:text-3xl">
                {active.tagline}
              </p>

              <p className="mt-4 max-w-[42ch] font-[family-name:var(--font-geist-sans)] text-sm leading-relaxed text-white/62 md:text-base">
                {active.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between">
            <ProgressDots
              total={SLIDES_EDITORIAL.length}
              active={activeIndex}
            />
            {/* <div className="flex gap-3">
              <ArrowButton
                direction="prev"
                onClick={handlePrevWithReset}
                color="yellow"
              />
              <ArrowButton
                direction="next"
                onClick={handleNextWithReset}
                color="yellow"
              />
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
