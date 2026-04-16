"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ScatterText } from "@/components/shared/scatter-text";
import { Image } from "@/components/ui/image";
import { SECTION_IDS } from "@/config/section-ids";
import { Section } from "@/components/shared/section";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { FadeUp } from "@/components/shared/fade-up";
import { Starburst } from "@/components/shared/starburst";
import { SwiperControls } from "@/components/shared/swiper-controls";
import { SectionContent } from "@/components/shared/section-content";
import {
  TRANSITION,
  AUTOPLAY_INTERVAL,
} from "@/config/animation-constants";
import { SLIDES_EDITORIAL } from "@/components/sections/services/services-slider-data";

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
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES_EDITORIAL.length);
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

  const active = SLIDES_EDITORIAL[activeIndex];

  return (
    <Section id={SECTION_IDS.services}>
      {/* All images stacked — crossfade via opacity */}
      {SLIDES_EDITORIAL.map((slide, i) => (
        <m.div
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
        </m.div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-off-black/10" />
      <div className="absolute inset-0 bg-lienar-to-t from-off-black/60 via-transparent to-transparent" />

      {/* Decorative starburst — bottom-right */}
      <Starburst
        color="yellow"
        size="md"
        rotate
        className="absolute -right-10 -bottom-28 z-2 md:-right-12 md:-bottom-36 lg:-bottom-50 "
      />

      {/* Content layer */}
      <SectionContent className="z-3 flex flex-1 flex-col justify-between relative">
        {/* Top: eyebrow + heading */}
        <div>
          <EyebrowTag color="yellow" withLine lineColor="yellow">
            Oferta
          </EyebrowTag>

          <ScatterText
            className="max-w-2xl text-heading-sm"
            lines={[
              { text: "Co mogę", className: "text-white" },
              { text: "dla Ciebie", className: "text-white" },
              { text: "ugotować", className: "text-yellow" },
            ]}
          />
        </div>

        {/* Bottom: slide text + controls */}
        <div>
          <AnimatePresence mode="wait">
            <m.div
              key={activeIndex}
              variants={TEXT_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION.fast}
              className="max-w-2xl"
            >
              <h3 className="max-w-[12ch] text-heading-lg tracking-tight text-white">
                {active.title}
              </h3>

              <p className="mt-4 max-w-[24ch] text-subtitle-xl leading-snug text-white/90">
                {active.tagline}
              </p>

              <p className="mt-4 max-w-[42ch] font-sans text-sm leading-relaxed text-muted-on-dark md:text-base">
                {active.description}
              </p>
            </m.div>
          </AnimatePresence>

          <SwiperControls
            total={SLIDES_EDITORIAL.length}
            active={activeIndex}
            onPrev={handlePrevWithReset}
            onNext={handleNextWithReset}
            onSelect={(i) => {
              setActiveIndex(i);
              resetTimer();
            }}
            className="mt-8 z-10 relative"
          />
        </div>
      </SectionContent>
    </Section>
  );
}
