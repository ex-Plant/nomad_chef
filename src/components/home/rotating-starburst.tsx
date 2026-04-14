'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Starburst } from '@/components/home/starburst';

type StarburstColorT = 'coral' | 'blue' | 'pink' | 'yellow';

const SIZE_VARIANTS = {
  sm: 'w-36 md:w-44 lg:w-52',
  md: 'w-48 md:w-60 lg:w-72',
  lg: 'w-60 md:w-72 lg:w-88',
} as const;

type StarburstSizeT = keyof typeof SIZE_VARIANTS;

type RotatingStarburstPropsT = {
  readonly color?: StarburstColorT;
  readonly size?: StarburstSizeT;
  readonly className?: string;
};

export function RotatingStarburst({
  color = 'blue',
  size,
  className = '',
}: RotatingStarburstPropsT) {
  const sizeClass = size ? SIZE_VARIANTS[size] : '';
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const rotate = useSpring(rawRotate, { stiffness: 50, damping: 20 });

  return (
    <motion.div
      ref={ref}
      className={`pointer-events-none ${sizeClass} ${className}`}
      style={{ rotate, willChange: 'transform' }}
    >
      <Starburst color={color} />
    </motion.div>
  );
}
