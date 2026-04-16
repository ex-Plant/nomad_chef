"use client";

/* Starburst shape — traced from the Chaos Kitchen logo.
   Irregular, organic spikes: longer bottom-left, shorter top-right.
   Uses the color prop to set fill.

   Static by default. Pass `rotate` to enable scroll-linked rotation. */

import { useRef } from "react";
import { m, useScroll, useSpring, useTransform } from "framer-motion";

const STARBURST_COLORS = {
  coral: "var(--coral)",
  blue: "var(--electric-blue)",
  pink: "var(--pink)",
  yellow: "var(--yellow)",
} as const;

type StarburstColorT = keyof typeof STARBURST_COLORS;

const SIZE_VARIANTS = {
  sm: "w-32 md:w-40 lg:w-44",
  md: "w-48 md:w-60 lg:w-72",
  lg: "w-60 md:w-72 lg:w-88",
} as const;

type StarburstSizeT = keyof typeof SIZE_VARIANTS;

type StarburstPropsT = {
  readonly color?: StarburstColorT;
  readonly size?: StarburstSizeT;
  readonly rotate?: boolean;
  readonly speed?: number;
  readonly offset?: number;
  readonly className?: string;
};

const SVG_PATH = `
  M 100 8
  L 112 52
  L 148 18
  L 128 58
  L 176 32
  L 142 66
  L 192 62
  L 150 80
  L 194 98
  L 150 100
  L 188 126
  L 144 116
  L 166 156
  L 132 128
  L 138 176
  L 116 138
  L 104 192
  L 100 140
  L 74 184
  L 84 136
  L 42 172
  L 72 128
  L 18 152
  L 60 114
  L 6 124
  L 52 100
  L 8 82
  L 56 86
  L 16 54
  L 62 74
  L 38 24
  L 76 64
  L 68 12
  L 88 60
  Z
`;

function StarburstSvg({
  color = "blue",
  className = "",
}: {
  readonly color?: StarburstColorT;
  readonly className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d={SVG_PATH} fill={STARBURST_COLORS[color]} />
    </svg>
  );
}

function RotatingStarburst({
  color = "blue",
  speed = 1,
  offset = 0,
  className = "",
}: {
  readonly color?: StarburstColorT;
  readonly speed?: number;
  readonly offset?: number;
  readonly className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawRotate = useTransform(
    scrollYProgress,
    [0, 1],
    [offset, offset + 180 * speed],
  );
  const springRotate = useSpring(rawRotate, { stiffness: 50, damping: 20 });

  return (
    <m.div
      ref={ref}
      className={`pointer-events-none ${className}`}
      style={{ rotate: springRotate, willChange: "transform" }}
    >
      <StarburstSvg color={color} />
    </m.div>
  );
}

export function Starburst({
  color = "blue",
  size,
  rotate = false,
  speed = 1,
  offset = 0,
  className = "",
}: StarburstPropsT) {
  const sizeClass = size ? SIZE_VARIANTS[size] : "";
  const combined = `${sizeClass} ${className}`;

  if (rotate) {
    return (
      <RotatingStarburst
        color={color}
        speed={speed}
        offset={offset}
        className={combined}
      />
    );
  }

  return (
    <div className={`pointer-events-none ${combined}`}>
      <StarburstSvg color={color} />
    </div>
  );
}
