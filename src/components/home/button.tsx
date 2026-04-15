import { ArrowRight } from 'lucide-react';

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

export type ButtonVariantT = keyof typeof VARIANTS;

const SHAPES = {
  pill: {
    wrapper: 'rounded-full px-8 py-4 gap-3',
    circle: 'h-7 w-7',
    icon: 14,
  },
  compact: {
    wrapper: 'rounded-lg px-5 py-2.5 gap-2',
    circle: 'h-5 w-5',
    icon: 12,
  },
} as const;

export type ButtonShapeT = keyof typeof SHAPES;

const BASE_CLASSES =
  'group inline-flex items-center border font-geist text-sm font-medium uppercase tracking-wide transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-[1px]';

function ButtonContent({
  children,
  circleClasses,
  shape = 'pill',
}: {
  readonly children: React.ReactNode;
  readonly circleClasses: string;
  readonly shape?: ButtonShapeT;
}) {
  const s = SHAPES[shape];

  return (
    <>
      {children}
      <span
        className={`flex ${s.circle} items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 ${circleClasses}`}
      >
        <ArrowRight size={s.icon} strokeWidth={2.5} aria-hidden="true" />
      </span>
    </>
  );
}

type ButtonPropsT = {
  readonly children: React.ReactNode;
  readonly variant?: ButtonVariantT;
  readonly shape?: ButtonShapeT;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly disabled?: boolean;
};

export function Button({
  children,
  variant = 'white',
  shape = 'pill',
  className = '',
  onClick,
  type = 'button',
  disabled,
}: ButtonPropsT) {
  const v = VARIANTS[variant];
  const s = SHAPES[shape];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE_CLASSES} ${s.wrapper} ${v.base} ${v.hover} ${className}`}
    >
      <ButtonContent circleClasses={v.circle} shape={shape}>{children}</ButtonContent>
    </button>
  );
}

type LinkButtonPropsT = {
  readonly children: React.ReactNode;
  readonly href: string;
  readonly variant?: ButtonVariantT;
  readonly shape?: ButtonShapeT;
  readonly className?: string;
  readonly target?: string;
  readonly rel?: string;
};

export function LinkButton({
  children,
  href,
  variant = 'white',
  shape = 'pill',
  className = '',
  target,
  rel,
}: LinkButtonPropsT) {
  const v = VARIANTS[variant];
  const s = SHAPES[shape];

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`${BASE_CLASSES} ${s.wrapper} ${v.base} ${v.hover} ${className}`}
    >
      <ButtonContent circleClasses={v.circle} shape={shape}>{children}</ButtonContent>
    </a>
  );
}
