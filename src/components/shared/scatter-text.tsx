"use client";

import { useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type ScatterLineT = {
  text: string;
  className?: string;
};

type ScatterTextPropsT = {
  lines: ScatterLineT[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** External trigger element — if omitted, the component triggers itself */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Play immediately on mount instead of on scroll enter */
  triggerOnMount?: boolean;
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
  triggerOnMount = false,
}: ScatterTextPropsT) {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const lineEls = container.querySelectorAll<HTMLElement>(
        "[data-scatter-line]"
      );
      const letterEls = container.querySelectorAll<HTMLElement>(
        "[data-scatter-letter]"
      );

      // Always clear any leftover transforms before building (or skipping)
      // the timeline. Without this, a prior non-reduced run may have left
      // letters in the scattered initial state (applied by tl.progress(0)),
      // and context.revert() doesn't always undo it — letters stay visibly
      // scattered even after reducedMotion flips on.
      gsap.set([...lineEls, ...letterEls], { clearProps: "transform" });

      if (reducedMotion) return;

      const triggerEl = triggerRef?.current ?? container;

      // Build a paused timeline — ScrollTrigger plays/resets it
      const tl = gsap.timeline({ paused: true });

      lineEls.forEach((lineEl, lineIndex) => {
        const lineDelay = lineIndex * 0.2;
        const letterSpans = lineEl.querySelectorAll<HTMLElement>(
          "[data-scatter-letter]"
        );
        const totalChars = letterSpans.length;
        const mid = (totalChars - 1) / 2;

        // Line-level x slide
        tl.fromTo(
          lineEl,
          { x: 120 },
          { x: 0, duration: 1.4, ease: "back.out(1.4)" },
          lineDelay
        );

        // Per-letter scatter → assemble with stagger
        letterSpans.forEach((span, i) => {
          const scatter = getLetterScatter(i, mid);

          tl.fromTo(
            span,
            { x: scatter.x, y: scatter.y, rotation: scatter.rotate },
            { x: 0, y: 0, rotation: 0, duration: 1.4, ease: "back.out(1.7)" },
            lineDelay + i * 0.05
          );
        });
      });

      // Set initial scattered state
      tl.progress(0);

      if (triggerOnMount) {
        tl.play();
      } else {
        ScrollTrigger.create({
          trigger: triggerEl,
          start: "top 90%",
          once: true,
          onEnter: () => tl.restart(),
        });
      }
    },
    { scope: containerRef, dependencies: [reducedMotion] }
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
