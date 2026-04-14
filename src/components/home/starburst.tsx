/* Starburst shape — traced from the Chaos Kitchen logo.
   Irregular, organic spikes: longer bottom-left, shorter top-right.
   Uses currentColor so it inherits from text-* utilities or the color prop. */

const STARBURST_COLORS = {
  coral: 'var(--coral)',
  blue: 'var(--electric-blue)',
  pink: 'var(--pink)',
  yellow: 'var(--yellow)',
} as const;

type StarburstColorT = keyof typeof STARBURST_COLORS;

type StarburstPropsT = {
  readonly color?: StarburstColorT;
  readonly className?: string;
};

export function Starburst({ color = 'blue', className = '' }: StarburstPropsT) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="
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
        "
        fill={STARBURST_COLORS[color]}
      />
    </svg>
  );
}
