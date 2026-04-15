import { type SVGProps } from "react";

type IconPropsT = SVGProps<SVGSVGElement> & {
  readonly size?: number;
  readonly strokeWidth?: number;
};

/** Instagram brand icon — matches Lucide API (size, strokeWidth, className) */
export function InstagramIcon({
  size = 24,
  strokeWidth = 2,
  ...props
}: IconPropsT) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
