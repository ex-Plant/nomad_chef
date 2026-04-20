"use client";

/* Starburst shape — traced from the Chaos Kitchen logo.
   Irregular, organic spikes: longer bottom-left, shorter top-right.
   Uses the color prop to set fill.

   Static by default. Pass `rotate` to enable scroll-linked rotation via GSAP. */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const STARBURST_COLORS = {
  coral: "var(--coral)",
  blue: "var(--electric-blue)",
  pink: "var(--pink)",
  yellow: "var(--yellow)",
} as const;

type StarburstColorT = keyof typeof STARBURST_COLORS;

const SIZE_VARIANTS = {
  sm: "w-24 md:w-40 lg:w-44",
  md: "w-28 md:w-60 lg:w-72",
  lg: "w-100 md:w-140 lg:w-180",
} as const;

type StarburstSizeT = keyof typeof SIZE_VARIANTS;

type StarburstPropsT = {
  color?: StarburstColorT;
  size?: StarburstSizeT;
  variant?: StarburstVariantT;
  rotate?: boolean;
  speed?: number;
  offset?: number;
  className?: string;
};

/* Original organic starburst — relatively uniform spikes */
const SVG_PATH_ORGANIC = `
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

/* ── Previous versions (narrower spikes, valleys at ~74-82) ──────────── */

/* V1-A — medium spikes, perspective tilt. Valleys ~74-78. */
const SVG_PATH_V1A = `
  M 104 22
  L 114 76
  L 140 28
  L 124 78
  L 168 44
  L 132 80
  L 188 74
  L 138 88
  L 194 104
  L 136 98
  L 184 142
  L 128 110
  L 166 178
  L 118 120
  L 132 196
  L 106 126
  L 92 198
  L 94 124
  L 52 186
  L 82 116
  L 18 160
  L 76 104
  L 6 120
  L 72 92
  L 10 72
  L 74 82
  L 26 38
  L 80 78
  L 62 24
  L 90 76
  Z
`;

/* V1-B — medium spikes, stronger perspective. Valleys ~78-80. */
const SVG_PATH_V1B = `
  M 102 30
  L 112 78
  L 136 34
  L 122 80
  L 164 48
  L 130 82
  L 186 78
  L 136 90
  L 192 108
  L 134 100
  L 180 146
  L 128 112
  L 160 182
  L 118 122
  L 130 198
  L 106 128
  L 90 200
  L 94 126
  L 56 190
  L 82 118
  L 22 164
  L 76 106
  L 8 122
  L 72 94
  L 12 76
  L 74 84
  L 30 44
  L 80 80
  L 64 32
  L 90 78
  Z
`;

/* ── Current versions (wider spikes, more center body) ──────────────── */

/* Logo A — wide spikes, 10 points. Valleys at ~92-96. Perspective tilt. */
const SVG_PATH_LOGO_A = `
  M 106 18
  L 114 92
  L 148 30
  L 124 94
  L 180 56
  L 132 96
  L 196 96
  L 132 102
  L 186 146
  L 124 110
  L 148 190
  L 110 118
  L 100 198
  L 96 116
  L 52 186
  L 84 108
  L 14 140
  L 78 98
  L 8 88
  L 80 92
  L 28 36
  L 88 90
  Z
`;

/* Logo B — ultra-wide, 8 points. Valleys at ~94-98. Badge-like. */
const SVG_PATH_LOGO_B = `
  M 104 24
  L 118 96
  L 162 42
  L 130 96
  L 196 100
  L 128 106
  L 172 164
  L 114 116
  L 108 198
  L 96 114
  L 38 170
  L 80 106
  L 6 98
  L 80 94
  L 42 38
  L 92 94
  Z
`;

/* Logo C — wide spikes, 14 points. Valleys at ~90-94. Dense silhouette. */
const SVG_PATH_LOGO_C = `
  M 98 14
  L 108 90
  L 136 20
  L 120 92
  L 170 38
  L 130 92
  L 194 70
  L 134 96
  L 198 108
  L 132 102
  L 182 150
  L 126 112
  L 156 184
  L 114 120
  L 118 200
  L 102 120
  L 76 198
  L 90 116
  L 38 178
  L 80 110
  L 8 142
  L 76 100
  L 4 96
  L 76 94
  L 14 56
  L 80 90
  L 32 22
  L 86 88
  L 60 12
  L 94 88
  Z
`;

/* Logo D — wide, 10 points, CW rotation. Valleys at ~92-96. Bold. */
const SVG_PATH_LOGO_D = `
  M 112 16
  L 118 94
  L 156 28
  L 128 94
  L 192 66
  L 136 96
  L 200 112
  L 134 104
  L 184 158
  L 122 114
  L 140 198
  L 108 120
  L 90 200
  L 94 118
  L 40 180
  L 82 110
  L 4 130
  L 78 98
  L 6 72
  L 80 94
  L 34 24
  L 90 92
  Z
`;

/* Logo E — 8 very fat spikes. Valleys at ~96-98. Almost a rounded star. */
const SVG_PATH_LOGO_E = `
  M 100 10
  L 116 96
  L 172 36
  L 128 98
  L 198 106
  L 126 108
  L 166 180
  L 110 118
  L 96 200
  L 92 114
  L 30 174
  L 80 104
  L 4 96
  L 82 94
  L 36 28
  L 92 94
  Z
`;

/* Logo F — 12 points, CCW tilt. Valleys at ~92-96. Aggressive but chunky. */
const SVG_PATH_LOGO_F = `
  M 96 12
  L 108 92
  L 142 22
  L 122 92
  L 184 54
  L 132 96
  L 200 104
  L 132 102
  L 180 156
  L 122 112
  L 136 196
  L 108 120
  L 86 200
  L 92 116
  L 36 178
  L 80 108
  L 4 122
  L 76 98
  L 8 64
  L 78 92
  L 32 18
  L 88 90
  Z
`;

/* Logo G — 10 spikes, strong CW tilt. Valleys at ~92-96. Heavy bottom-right. */
const SVG_PATH_LOGO_G = `
  M 114 14
  L 120 94
  L 158 26
  L 130 94
  L 192 62
  L 138 96
  L 202 110
  L 136 104
  L 188 160
  L 124 114
  L 148 198
  L 112 122
  L 98 202
  L 96 118
  L 46 186
  L 84 110
  L 6 138
  L 78 100
  L 2 82
  L 78 94
  L 26 28
  L 88 90
  Z
`;

/* Logo H — 8 points, CCW tilt. Valleys at ~96-98. Maximum body. */
const SVG_PATH_LOGO_H = `
  M 96 8
  L 112 96
  L 168 30
  L 128 98
  L 200 98
  L 128 106
  L 170 178
  L 112 116
  L 94 202
  L 92 114
  L 26 172
  L 78 104
  L 2 94
  L 78 94
  L 38 24
  L 90 92
  Z
`;

const SVG_PATHS = {
  organic: SVG_PATH_ORGANIC,
  "v1-a": SVG_PATH_V1A,
  "v1-b": SVG_PATH_V1B,
  "logo-a": SVG_PATH_LOGO_A,
  "logo-b": SVG_PATH_LOGO_B,
  "logo-c": SVG_PATH_LOGO_C,
  "logo-d": SVG_PATH_LOGO_D,
  "logo-e": SVG_PATH_LOGO_E,
  "logo-f": SVG_PATH_LOGO_F,
  "logo-g": SVG_PATH_LOGO_G,
  "logo-h": SVG_PATH_LOGO_H,
} as const;

type StarburstVariantT = keyof typeof SVG_PATHS;

function StarburstSvg({
  color = "blue",
  variant = "organic",
  className = "",
}: {
  color?: StarburstColorT;
  variant?: StarburstVariantT;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d={SVG_PATHS[variant]} fill={STARBURST_COLORS[color]} />
    </svg>
  );
}

function RotatingStarburst({
  color = "blue",
  variant = "organic",
  speed = 1,
  offset = 0,
  className = "",
}: {
  color?: StarburstColorT;
  variant?: StarburstVariantT;
  speed?: number;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.fromTo(
        el,
        { rotation: offset },
        {
          rotation: offset + 180 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        }
      );
    },
    { scope: ref, dependencies: [] }
  );

  return (
    <div
      ref={ref}
      className={`pointer-events-none ${className}`}
      style={{ willChange: "transform" }}
    >
      <StarburstSvg color={color} variant={variant} />
    </div>
  );
}

export function Starburst({
  color = "blue",
  size,
  variant = "organic",
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
        variant={variant}
        speed={speed}
        offset={offset}
        className={combined}
      />
    );
  }

  return (
    <div className={`pointer-events-none ${combined}`}>
      <StarburstSvg color={color} variant={variant} />
    </div>
  );
}
