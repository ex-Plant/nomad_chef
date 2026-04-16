"use client";

import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

const SPRING_CONFIG = { stiffness: 100, damping: 30, mass: 1 };

type ScrubLetterPropsT = {
  readonly scrollYProgress: MotionValue<number>;
  readonly start: number;
  readonly end: number;
  readonly spreadX: number;
  readonly spreadY: number;
  readonly rotate: number;
  readonly char: string;
};

function ScrubLetter({
  scrollYProgress,
  start,
  end,
  spreadX,
  spreadY,
  rotate: rotateTo,
  char,
}: ScrubLetterPropsT) {
  const xRaw = useTransform(scrollYProgress, [start, end], [spreadX, 0]);
  const yRaw = useTransform(scrollYProgress, [start, end], [spreadY, 0]);
  const rotateRaw = useTransform(scrollYProgress, [start, end], [rotateTo, 0]);
  const x = useSpring(xRaw, SPRING_CONFIG);
  const y = useSpring(yRaw, SPRING_CONFIG);
  const rotate = useSpring(rotateRaw, SPRING_CONFIG);

  return (
    <m.span
      className="inline-block"
      style={{ x, y, rotate, willChange: "transform" }}
    >
      {char === " " ? "\u00A0" : char}
    </m.span>
  );
}

type ScrubLinePropsT = {
  readonly scrollYProgress: MotionValue<number>;
  readonly index: number;
  readonly text: string;
  readonly className?: string;
};

function ScrubLine({
  scrollYProgress,
  index,
  text,
  className,
}: ScrubLinePropsT) {
  const lineStart = 0.05 + index * 0.05;
  const lineEnd = lineStart + 0.15;
  const xRaw = useTransform(scrollYProgress, [lineStart, lineEnd], [120, 0]);
  const x = useSpring(xRaw, SPRING_CONFIG);

  const words = text.split(" ");
  // Global letter index across all words for consistent scatter math
  let globalIndex = 0;
  const totalChars = text.replace(/ /g, "").length;
  const mid = (totalChars - 1) / 2;

  return (
    <m.span
      className={`block ${className ?? ""}`}
      style={{ x, willChange: "transform" }}
    >
      {words.map((word, wi) => {
        const wordLetters = word.split("").map((char) => {
          const i = globalIndex++;
          const seed = (i * 7 + 13) % 17;
          const sign = seed % 2 === 0 ? 1 : -1;
          const distFromMid = Math.abs(i - mid);
          const spreadX = (i - mid) * 20 + sign * (seed % 5) * 6;
          const spreadY = sign * (distFromMid * 12 + (seed % 7) * 4);
          const rotate = sign * (distFromMid * 4 + (seed % 3) * 3);
          const letterStart = lineStart + i * 0.004;
          const letterEnd = letterStart + 0.15;
          return (
            <ScrubLetter
              key={`${i}-${char}`}
              scrollYProgress={scrollYProgress}
              start={letterStart}
              end={letterEnd}
              spreadX={spreadX}
              spreadY={spreadY}
              rotate={rotate}
              char={char}
            />
          );
        });

        return (
          <span key={wi} className="inline-flex whitespace-nowrap">
            {wordLetters}
            {wi < words.length - 1 && <span>&nbsp;</span>}
          </span>
        );
      })}
    </m.span>
  );
}

type ScatterLineT = {
  readonly text: string;
  readonly className?: string;
};

type ScatterTextPropsT = {
  readonly lines: readonly ScatterLineT[];
  readonly as?: "h1" | "h2" | "h3" | "p";
  readonly className?: string;
  readonly scrollYProgress?: MotionValue<number>;
};

export function ScatterText({
  lines,
  as: Tag = "h2",
  className,
  scrollYProgress: externalProgress,
}: ScatterTextPropsT) {
  const internalRef = useRef<HTMLElement>(null);
  const { scrollYProgress: internalProgress } = useScroll({
    target: internalRef,
    offset: ["start end", "end start"],
  });

  const scrollYProgress = externalProgress ?? internalProgress;

  return (
    <Tag ref={internalRef as React.RefObject<never>} className={className}>
      {lines.map((line, i) => (
        <ScrubLine
          key={line.text}
          scrollYProgress={scrollYProgress}
          index={i}
          text={line.text}
          className={line.className}
        />
      ))}
    </Tag>
  );
}
