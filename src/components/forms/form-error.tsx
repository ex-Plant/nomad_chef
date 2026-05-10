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
      role="alert"
      className={cn("mt-1 px-1 text-sm font-bold text-error", className)}
    >
      {children}
    </p>
  );
}
