import { ArrowRight } from '@phosphor-icons/react';

const VARIANTS = {
  coral: {
    base: 'border-coral text-coral',
    circle: 'bg-coral/10',
    hover: 'hover:border-coral hover:bg-coral/5',
  },
  'coral-solid': {
    base: 'border-coral bg-coral text-white',
    circle: 'bg-white text-coral',
    hover: 'hover:shadow-[0_4px_20px_rgba(255,99,22,0.35)]',
  },
  blue: {
    base: 'border-electric-blue text-electric-blue',
    circle: 'bg-electric-blue/10',
    hover: 'hover:border-electric-blue hover:bg-electric-blue/5',
  },
  'blue-solid': {
    base: 'border-electric-blue bg-electric-blue text-white',
    circle: 'bg-white text-electric-blue',
    hover: 'hover:shadow-[0_4px_20px_rgba(25,62,244,0.35)]',
  },
  yellow: {
    base: 'border-yellow text-yellow',
    circle: 'bg-yellow/10',
    hover: 'hover:border-yellow hover:bg-yellow/5',
  },
  'yellow-solid': {
    base: 'border-yellow bg-yellow text-off-black',
    circle: 'bg-off-black/10',
    hover: 'hover:shadow-[0_4px_20px_rgba(229,245,93,0.35)]',
  },
  pink: {
    base: 'border-pink text-pink',
    circle: 'bg-pink/10',
    hover: 'hover:border-pink hover:bg-pink/5',
  },
  white: {
    base: 'border-white/60 text-white',
    circle: 'bg-white/10',
    hover: 'hover:border-white hover:bg-white/5',
  },
  dark: {
    base: 'border-off-black/20 text-off-black',
    circle: 'bg-off-black/10',
    hover: 'hover:border-off-black/40 hover:bg-off-black/[0.02]',
  },
} as const;

type ButtonVariantT = keyof typeof VARIANTS;

type ButtonPropsT = {
  readonly children: React.ReactNode;
  readonly href: string;
  readonly variant?: ButtonVariantT;
  readonly className?: string;
  readonly target?: string;
  readonly rel?: string;
};

export function Button({
  children,
  href,
  variant = 'white',
  className = '',
  target,
  rel,
}: ButtonPropsT) {
  const v = VARIANTS[variant];

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`group inline-flex items-center gap-3 rounded-full border px-8 py-4 font-geist text-sm font-medium uppercase tracking-wide transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-[1px] ${v.base} ${v.hover} ${className}`}
    >
      {children}
      <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 ${v.circle}`}>
        <ArrowRight size={14} weight="bold" aria-hidden="true" />
      </span>
    </a>
  );
}
