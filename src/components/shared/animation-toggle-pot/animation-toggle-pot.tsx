"use client";

import type * as React from "react";
import { useMotionStore } from "@/stores/motion-store";
import { cn } from "@/helpers/cn";
import styles from "./animation-toggle-pot.module.css";

/* Starburst path extracted from src/components/shared/starburst.tsx (logo-a variant).
   Original viewBox: 200x200, centered at (100, 100). Scaled down to fit
   the pot body via the wrapping <g transform>. */
const STARBURST_LOGO_A =
  "M 106 18 L 114 92 L 148 30 L 124 94 L 180 56 L 132 96 L 196 96 L 132 102 " +
  "L 186 146 L 124 110 L 148 190 L 110 118 L 100 198 L 96 116 L 52 186 L 84 108 " +
  "L 14 140 L 78 98 L 8 88 L 80 92 L 28 36 L 88 90 Z";

/* Color variants — map palette keys to Tailwind fill classes. Full class
   strings are listed here so Tailwind's JIT scanner can detect and emit them. */
const FILL_COLORS = {
  coral: "fill-coral",
  "electric-blue": "fill-electric-blue",
  pink: "fill-pink",
  yellow: "fill-yellow",
  "off-black": "fill-off-black",
  "warm-white": "fill-warm-white",
  white: "fill-white",
} as const;

type PotColorT = keyof typeof FILL_COLORS;

type BubbleT = {
  cx: number;
  cy: number;
  r: number;
  delay: string;
  dx: number;
  dy: number;
  color: PotColorT;
};

/* 3 bubbles, staggered across a 10s cycle (keyframe has long idle phase).
   One bubble pops roughly every 3.3s, using the project palette. */
const BUBBLES: readonly BubbleT[] = [
  { cx: 44, cy: 40, r: 2.5, delay: "0s", dx: -8, dy: -55, color: "pink" },
  { cx: 56, cy: 42, r: 2, delay: "3.5s", dx: 10, dy: -48, color: "yellow" },
  {
    cx: 50,
    cy: 36,
    r: 2.25,
    delay: "7s",
    dx: -4,
    dy: -65,
    color: "electric-blue",
  },
] as const;

type AnimationTogglePotPropsT = {
  potColor?: PotColorT;
  lidColor?: PotColorT;
};

/* Alt version of AnimationToggle — a boiling pot with rainbow bubbles.
   When animations are on, the lid hops and bubbles rise and pop.
   When off, a pair of "z"s appears above the lid instead.
   potColor applies to the pot body, handles, and lid knob.
   lidColor applies to the lid body bar. */
export function AnimationTogglePot({
  potColor = "coral",
  lidColor = "electric-blue",
}: AnimationTogglePotPropsT = {}) {
  const reducedMotion = useMotionStore((s) => s.reducedMotion);
  const setReducedMotion = useMotionStore((s) => s.setReducedMotion);
  const animationsOn = !reducedMotion;
  const potFill = FILL_COLORS[potColor];
  const lidFill = FILL_COLORS[lidColor];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={animationsOn}
      aria-label={animationsOn ? "Wyłącz animacje" : "Włącz animacje"}
      onClick={() => setReducedMotion(animationsOn)}
      data-on={animationsOn ? "true" : "false"}
      className="group flex items-center text-off-black cursor-pointer border-0 bg-transparent p-0 -mt-4"
    >
      <span
        className={cn(
          "text-sm lg:text-xs uppercase tracking-wider font-medium text-white bg-coral pl-1 pr-2 -rotate-4 mt-8 -mr-2 lg:opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          !animationsOn && "line-through"
        )}
      >
        Animacje
      </span>
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="block size-24 lg:size-16 overflow-visible"
      >
        {/* Bubbles — rise from the pot and pop at the top */}
        {BUBBLES.map((b, i) => (
          <circle
            key={i}
            className={`${styles.bubble} ${FILL_COLORS[b.color]}`}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            style={
              {
                animationDelay: b.delay,
                "--dx": `${b.dx}px`,
                "--dy": `${b.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* "zzz" — shown only when animations are off */}
        <g className={`${styles.zzz} opacity-0`}>
          <text x="58" y="32" fontSize="12" className="font-display fill-coral">
            z
          </text>
          <text x="66" y="24" fontSize="9" className="font-display fill-coral">
            z
          </text>
        </g>

        {/* Lid — hops up and down when animations are on */}
        <g className={styles.lid}>
          {/* Lid knob (matches pot color) */}
          <rect
            x="44"
            y="36"
            width="12"
            height="4"
            rx="1.5"
            className={potFill}
          />
          {/* Lid body (colored bar) */}
          <rect
            x="28"
            y="40"
            width="44"
            height="6"
            rx="2"
            className={lidFill}
          />
        </g>

        {/* Pot body (main silhouette) */}
        <path
          d="M30 48 L70 48 L66 82 C 66 86, 62 88, 58 88 L42 88 C 38 88, 34 86, 34 82 Z"
          className={potFill}
        />
        {/* Left handle */}
        <rect x="22" y="54" width="10" height="6" rx="2" className={potFill} />
        {/* Right handle */}
        <rect x="68" y="54" width="10" height="6" rx="2" className={potFill} />

        {/* Starburst accent inside the pot */}
        <g transform="translate(50 70) scale(0.1) translate(-100 -100)">
          <path d={STARBURST_LOGO_A} className="fill-electric-blue" />
        </g>
      </svg>
    </button>
  );
}
