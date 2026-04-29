import NextImage from "next/image";
import { cn } from "@/helpers/cn";
import logoSrc from "@/assets/logo.png";

const LOGO_ALT = "Marta Leśniewska — Chaos Kitchen";

type LogoPropsT = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function Logo({
  className,
  priority = false,
  sizes = "128px",
}: LogoPropsT) {
  return (
    <NextImage
      src={logoSrc}
      alt={LOGO_ALT}
      priority={priority}
      // Default `sizes` matches the default className (size-32 = 128px).
      // Override `sizes` when the consumer passes a different rendered size.
      sizes={sizes}
      className={cn("size-32", className)}
    />
  );
}
