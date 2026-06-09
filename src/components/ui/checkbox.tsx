import type { ComponentProps } from "react";
import { Check } from "lucide-react";
import { cn } from "@/helpers/cn";

// Presentational checkbox (styled box + check icon). Controlled via native
// input props — wrap it for form wiring (see FormCheckbox) or drive it directly.
type CheckboxPropsT = Omit<ComponentProps<"input">, "type"> & {
  /** Outline + checked-background colour. */
  boxClassName?: string;
  /** Check-icon colour. */
  iconClassName?: string;
};

export function Checkbox({
  className,
  boxClassName = "outline-yellow checked:bg-yellow",
  iconClassName = "text-off-black",
  ...props
}: CheckboxPropsT) {
  return (
    <span className="relative mt-0.5 inline-flex size-4 shrink-0">
      <input
        type="checkbox"
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded-sm bg-white outline-1 transition-colors",
          boxClassName,
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        strokeWidth={3.5}
        className={cn(
          "stroke-electric-blue pointer-events-none absolute inset-0 m-auto size-3 opacity-0 transition-opacity peer-checked:opacity-100",
          iconClassName,
        )}
      />
    </span>
  );
}
