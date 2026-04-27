"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ScatterText } from "@/components/shared/scatter-text";
import { Image } from "@/components/ui/image";
import { SECTION_IDS } from "@/config/section-ids";
import type {
  SiteT,
  CampFoodThemeT,
  CampFoodOrientationT,
} from "@/lib/get-site";
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

const THEMES: Record<CampFoodThemeT, SlideStyleT> = {
  orange: {
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
  blue: {
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
};

/* Image fit per orientation. Container size stays constant across slides
   to keep the cross-fade visually stable; only the image's own sizing
   changes — vertical fills height, horizontal fills width. */
const IMAGE_CLASS_BY_ORIENTATION: Record<CampFoodOrientationT, string> = {
  vertical: "h-full w-auto max-w-full",
  horizontal: "w-full h-auto max-h-full",
};

/* ─── Animation ─── */

const SLIDE_TRANSITION = TRANSITION.slow;

/* ─── Main component ─── */

type CampFoodPropsT = { data: SiteT["campFood"] };

export function CampFoodSwiper({ data }: CampFoodPropsT) {
  const slideCount = data.slides.length;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  /* Auto-play */
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTOPLAY_INTERVAL);
  }, [slideCount]);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTOPLAY_INTERVAL);
    timerRef.current = id;
    return () => clearInterval(id);
  }, [slideCount]);

  const handleNextWithReset = useCallback(() => {
    handleNext();
    resetTimer();
  }, [handleNext, resetTimer]);

  const handlePrevWithReset = useCallback(() => {
    handlePrev();
    resetTimer();
  }, [handlePrev, resetTimer]);

  const slideData = data.slides[activeIndex];
  const slide = { ...THEMES[slideData?.theme ?? "orange"], ...slideData };

  return (
    <Section id={SECTION_IDS.campFood}>
      {/* Starburst — cross-fades on slide change, mirrors the bg transition */}
      <AnimatePresence>
        <m.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SLIDE_TRANSITION}
          className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/2 z-100"
          style={{ willChange: "opacity" }}
        >
          <Starburst color={slide.starburstColor} size="md" variant="v1-b" />
        </m.div>
      </AnimatePresence>
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
                  className={`absolute inset-0 max-w-[240px] sm:max-w-[36ch]  text-body-lg
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
          <div className="relative h-[40vh] md:h-[min(65lvh,800px)] md:col-span-7 md:col-start-6 ">
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
                    className={`rounded-xl object-contain ${IMAGE_CLASS_BY_ORIENTATION[slide.imageOrientation ?? "vertical"]}`}
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
          total={slideCount}
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
