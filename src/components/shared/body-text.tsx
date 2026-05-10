import { cn } from "@/helpers/cn";
import { FadeUp } from "@/components/shared/fade-up";
import type { ComponentPropsWithoutRef } from "react";

type BodyTextPropsT = ComponentPropsWithoutRef<typeof FadeUp>;

export function BodyText({ className, ...props }: BodyTextPropsT) {
  return (
    <FadeUp
      as="p"
      className={cn(
        "max-w-[325px] font-sans text-sm sm:max-w-sm sm:text-base md:max-w-lg",
        className,
      )}
      {...props}
    />
  );
}
