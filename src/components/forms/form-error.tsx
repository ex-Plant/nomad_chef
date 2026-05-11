import type { ReactNode } from "react";
import { cn } from "@/helpers/cn";

type FormErrorPropsT = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function FormError({ id, className, children }: FormErrorPropsT) {
  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      className={cn("text-error mt-1 px-1 text-sm font-bold", className)}
    >
      {children}
    </p>
  );
}
