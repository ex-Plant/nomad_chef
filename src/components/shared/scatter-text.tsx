"use client";

import { useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type ScatterLineT = {
  readonly text: string;
  readonly className?: string;
};

type ScatterTextPropsT = {
  readonly lines: readonly ScatterLineT[];
  readonly as?: "h1" | "h2" | "h3" | "p";
  readonly className?: string;
  /** External trigger element — if omitted, the component triggers itself */
  readonly triggerRef?: RefObject<HTMLElement | null>;
};

/**
 * Compute deterministic scatter offsets for a letter.
 * Same math as the original Framer Motion version.
 */
function getLetterScatter(i: number, mid: number) {
  const seed = (i * 7 + 13) % 17;
  const sign = seed % 2 === 0 ? 1 : -1;
  const distFromMid = Math.abs(i - mid);
  return {
    x: (i - mid) * 20 + sign * (seed % 5) * 6,
    y: sign * (distFromMid * 12 + (seed % 7) * 4),
    rotate: sign * (distFromMid * 4 + (seed % 3) * 3),
  };
}

export function ScatterText({
  lines,
  as: Tag = "h2",
  className,
  triggerRef,
}: ScatterTextPropsT) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const lineEls = container.querySelectorAll<HTMLElement>("[data-scatter-line]");

      lineEls.forEach((lineEl, lineIndex) => {
        const lineStart = 0.05 + lineIndex * 0.05;
        const letterSpans = lineEl.querySelectorAll<HTMLElement>("[data-scatter-letter]");
        const totalChars = letterSpans.length;
        const mid = (totalChars - 1) / 2;

        // Create a timeline scrubbed by scroll for this line
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerRef?.current ?? container,
            start: "start end",
            end: "end start",
            scrub: 1,
          },
        });

        // Line-level x slide
        tl.fromTo(
          lineEl,
          { x: 120 },
          { x: 0, duration: 0.15, ease: "none" },
          lineStart,
        );

        // Per-letter scatter → assemble
        letterSpans.forEach((span, i) => {
          const scatter = getLetterScatter(i, mid);
          const letterStart = lineStart + i * 0.004;

          tl.fromTo(
            span,
            { x: scatter.x, y: scatter.y, rotation: scatter.rotate },
            { x: 0, y: 0, rotation: 0, duration: 0.15, ease: "none" },
            letterStart,
          );
        });
      });
    },
    { scope: containerRef, dependencies: [lines] },
  );

  return (
    <Tag ref={containerRef as RefObject<never>} className={className}>
      {lines.map((line, lineIndex) => (
        <span
          key={line.text}
          data-scatter-line={lineIndex}
          className={`block will-change-transform ${line.className ?? ""}`}
        >
          {renderLetters(line.text)}
        </span>
      ))}
    </Tag>
  );
}

/** Render static letter spans — GSAP animates transforms directly on these DOM nodes */
function renderLetters(text: string) {
  const words = text.split(" ");
  let globalIndex = 0;

  return words.map((word, wi) => {
    const letters = word.split("").map((char) => {
      const i = globalIndex++;
      return (
        <span
          key={`${i}-${char}`}
          data-scatter-letter
          className="inline-block will-change-transform"
        >
          {char}
        </span>
      );
    });

    return (
      <span key={wi} className="inline-flex whitespace-nowrap">
        {letters}
        {wi < words.length - 1 && <span>{"\u00A0"}</span>}
      </span>
    );
  });
}
