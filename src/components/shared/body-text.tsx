import { cn } from "@/helpers/cn";
import { FadeUp } from "@/components/shared/fade-up";
import type { ComponentPropsWithoutRef } from "react";

type BodyTextPropsT = ComponentPropsWithoutRef<typeof FadeUp>;

export function BodyText({ className, ...props }: BodyTextPropsT) {
  return (
    <FadeUp
      as="p"
      className={cn(
        "font-sans text-sm max-w-[320px] sm:text-base sm:max-w-sm md:max-w-lg",
        className
      )}
      {...props}
    />
  );
}
