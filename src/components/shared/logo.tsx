import NextImage from "next/image";
import { cn } from "@/helpers/cn";
import logoSrc from "@/assets/logo.png";

const LOGO_ALT = "Marta Leśniewska — Chaos Kitchen";

type LogoPropsT = {
  className?: string;
  priority?: boolean;
};

export function Logo({ className, priority = false }: LogoPropsT) {
  return (
    <NextImage
      src={logoSrc}
      alt={LOGO_ALT}
      priority={priority}
      // Matches the rendered size from the className: 128px below lg, 160px above.
      // If the className is overridden to a different size, update this too.
      sizes="(min-width: 1024px) 160px, 128px"
      className={cn("h-32 w-32 lg:h-40 lg:w-40", className)}
    />
  );
}
