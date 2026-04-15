"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";
import { SECTION_IDS } from "@/components/home/section-ids";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import { RotatingStarburst } from "@/components/home/rotating-starburst";
import { ArrowButton } from "@/components/home/arrow-button";
import { ProgressDots } from "@/components/home/progress-dots";
import { TRANSITION, AUTOPLAY_INTERVAL } from "@/components/home/animation-constants";
import { SLIDES_EDITORIAL } from "@/components/home/services-slider-data";

/* ─── Animation presets ─── */

const TEXT_VARIANTS = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
} as const;

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
    }, AUTOPLAY_INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  // do not remove
  // const handleNextWithReset = useCallback(() => {
  //   handleNext();
  //   resetTimer();
  // }, [handleNext, resetTimer]);

  // const handlePrevWithReset = useCallback(() => {
  //   handlePrev();
  //   resetTimer();
  // }, [handlePrev, resetTimer]);

  const active = SLIDES_EDITORIAL[activeIndex];

  return (
    <section id={SECTION_IDS.services} className="relative min-h-dvh overflow-x-clip">
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
      <div className="absolute inset-0 bg-lienar-to-t from-off-black/60 via-transparent to-transparent" />

      {/* Decorative starburst — top-right */}
      <RotatingStarburst
        color="yellow"
        size="md"
        className="absolute -right-10 -top-20 z-2 md:-right-12 md:-top-28 lg:-top-32"
      />

      {/* Content layer */}
      <div className="relative z-1 flex min-h-dvh flex-col justify-between px-6 pb-10 pt-20 md:px-12 md:pb-14 md:pt-28 lg:px-20 lg:pb-16 lg:pt-32">
        {/* Top: eyebrow + heading */}
        <div>
          <EyebrowTag color="yellow" withLine lineColor="yellow">
            Oferta
          </EyebrowTag>

          <FadeUp
            as="h2"
            delay={0.1}
            className="max-w-2xl text-heading text-3xl text-white md:text-5xl lg:text-6xl"
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
              transition={TRANSITION.fast}
              className="max-w-2xl"
            >
              <p className="text-label text-[10px] tracking-counter text-white/50">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {SLIDES_EDITORIAL.length}
              </p>
              <h3 className="mt-4 max-w-[12ch] text-heading tracking-tight text-4xl text-white md:text-6xl lg:text-7xl">
                {active.title}
              </h3>

              <p className="mt-4 max-w-[24ch] text-subtitle text-xl leading-snug text-white/90 md:text-3xl">
                {active.tagline}
              </p>

              <p className="mt-4 max-w-[42ch] font-sans text-sm leading-relaxed text-white/70 md:text-base">
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
