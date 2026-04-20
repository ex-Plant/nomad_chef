"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ScatterText } from "@/components/shared/scatter-text";
import { Image } from "@/components/ui/image";
import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { Section } from "@/components/shared/section";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { Button } from "@/components/shared/button";
import { Starburst } from "@/components/shared/starburst";
import { SwiperControls } from "@/components/shared/swiper-controls";
import { SectionContent } from "@/components/shared/section-content";
import { BodyText } from "@/components/shared/body-text";
import { TRANSITION, AUTOPLAY_INTERVAL } from "@/config/animation-constants";

/* ─── Data ─────────────────────────────────────────────── */

type SlideStyleT = {
  bg: string;
  textColor: string;
  headlineColor: string;
  subtitleColor: string;
  bodyColor: string;
  eyebrowColor: "coral" | "blue" | "white" | "yellow";
  eyebrowLineColor: "coral" | "blue" | "white" | "yellow";
  buttonVariant:
    | "coral-solid"
    | "yellow-solid"
    | "blue-solid"
    | "coral"
    | "blue";
  starburstColor: "coral" | "blue" | "yellow";
};

const SLIDE_STYLES: SlideStyleT[] = [
  {
    bg: "bg-coral",
    textColor: "text-white",
    headlineColor: "text-electric-blue",
    subtitleColor: "text-white/90",
    bodyColor: "text-muted-on-dark",
    eyebrowColor: "blue",
    eyebrowLineColor: "blue",
    buttonVariant: "blue-solid",
    starburstColor: "blue",
  },
  {
    bg: "bg-electric-blue",
    textColor: "text-white",
    headlineColor: "text-coral",
    subtitleColor: "text-white/80",
    bodyColor: "text-muted-on-dark",
    eyebrowColor: "coral",
    eyebrowLineColor: "coral",
    buttonVariant: "coral-solid",
    starburstColor: "coral",
  },
] as const;

/* ─── Animation ─── */

const SLIDE_TRANSITION = TRANSITION.slow;

/* ─── Main component ─── */

type CampFoodPropsT = { data: SiteT["campFood"] };

export function CampFoodSwiper({ data }: CampFoodPropsT) {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDE_STYLES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + SLIDE_STYLES.length) % SLIDE_STYLES.length
    );
  }, []);

  /* Auto-play */
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDE_STYLES.length);
    }, AUTOPLAY_INTERVAL);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDE_STYLES.length);
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

  const SLIDES = SLIDE_STYLES.map((style, i) => ({
    ...style,
    ...(data.slides[i] ?? { alt: "", description: "" }),
  }));
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

      <SectionContent className="relative z-3">
        <Starburst
          color={slide.starburstColor}
          size="sm"
          rotate
          className="absolute -left-12 -bottom-26 z-[-1] md:-left-6 "
        />
        {/* Eyebrow */}
        <EyebrowTag
          color={slide.eyebrowColor}
          lineColor={slide.eyebrowLineColor}
        >
          {data.eyebrow}
        </EyebrowTag>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8 ">
          {/* Text — left side */}
          <div className="flex flex-col justify-center md:col-span-5 md:col-start-1">
            <BodyText className="text-white/90">{data.kicker}</BodyText>

            <ScatterText
              className={`mt-4 text-heading-lg tracking-tight `}
              lines={data.headingLines.map((line) => ({
                ...line,
                className: slide.headlineColor,
              }))}
            />

            <div className="relative mt-6 min-h-12 sm:min-h-14 ">
              <AnimatePresence>
                <m.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={SLIDE_TRANSITION}
                  className={`absolute inset-0 max-w-[320px] sm:max-w-[36ch]  text-body-lg
                    font-sans text-sm sm:text-base whitespace-pre-line ${slide.subtitleColor}`}
                >
                  {slide.description}
                </m.p>
              </AnimatePresence>
            </div>

            <div className="mt-8">
              <Button
                asChild
                variant={slide.buttonVariant}
                // withArrow
                size="compact"
              >
                <a href={data.cta.href}>{data.cta.label}</a>
              </Button>
            </div>
          </div>

          {/* Ebook cover — single large image, right side */}
          <div className="relative h-[40vh] md:h-[min(65dvh,800px)] md:col-span-7 md:col-start-6 ">
            <Starburst
              color={slide.starburstColor}
              size="sm"
              className="absolute z-1 -right-4 md:-left-72  -top-16 "
              variant="logo-a"
            />
            <AnimatePresence>
              <m.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                transition={SLIDE_TRANSITION}
                className="absolute inset-0 flex h-full items-center justify-center z-4"
                style={{ willChange: "transform, opacity" }}
              >
                {slide.image && (
                  <Image
                    src={slide.image.url}
                    alt={slide.alt || slide.image.alt}
                    width={slide.image.width ?? 1200}
                    height={slide.image.height ?? 1500}
                    className="h-full w-auto max-w-full rounded-xl object-contain"
                    sizes="(max-width: 768px) 80vw, (max-width:1440px) 50vw, 750px"
                    priority
                  />
                )}
              </m.div>
            </AnimatePresence>
            {/* Decorative starburst — bottom-right */}
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
