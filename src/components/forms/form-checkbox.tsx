import type { AnyFieldApi } from "@tanstack/react-form";
import { Check } from "lucide-react";
import { cn } from "@/helpers/cn";

type FormCheckboxPropsT = {
  field: AnyFieldApi;
  label: string;
  className?: string;
  disabled?: boolean;
  /** Tailwind class for the outline + checked-bg colour. Default: yellow. */
  boxClassName?: string;
  /** Tailwind text class controlling the check-icon colour. Default: off-black. */
  iconClassName?: string;
};

export function FormCheckbox({
  field,
  label,
  className,
  disabled,
  boxClassName = "outline-yellow checked:bg-yellow",
  iconClassName = "text-off-black",
}: FormCheckboxPropsT) {
  const checked = Boolean(field.state.value);
  return (
    <label
      htmlFor={field.name}
      className={cn(
        "flex cursor-pointer items-start gap-3 select-none font-sans text-sm text-white",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <span className="relative mt-0.5 inline-flex size-4 shrink-0">
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          checked={checked}
          disabled={disabled}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          className={cn(
            "peer size-full cursor-pointer appearance-none rounded-sm bg-white outline-1  transition-colors",
            boxClassName
          )}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3.5}
          className={cn(
            "pointer-events-none absolute inset-0 m-auto size-3 opacity-0 transition-opacity peer-checked:opacity-100 stroke-electric-blue",
            iconClassName
          )}
        />
      </span>
      <span>{label}</span>
    </label>
  );
}
