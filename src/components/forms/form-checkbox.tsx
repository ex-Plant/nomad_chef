import type { ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Check } from "lucide-react";
import { cn } from "@/helpers/cn";
import { FieldShell } from "./field-shell";

type FormCheckboxPropsT = {
  field: AnyFieldApi;
  label: ReactNode;
  /** Inline content rendered outside the <label> (e.g. links). */
  trailing?: ReactNode;
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
  trailing,
  className,
  disabled,
  boxClassName = "outline-yellow checked:bg-yellow",
  iconClassName = "text-off-black",
}: FormCheckboxPropsT) {
  const checked = Boolean(field.state.value);
  const hasErrors = field.state.meta.errors.length > 0;
  return (
    <FieldShell field={field}>
      <div
        className={cn(
          "flex items-start gap-3 font-sans text-sm text-white",
          disabled && "opacity-60",
          className,
        )}
      >
        <span className="relative mt-0.5 inline-flex size-4 shrink-0">
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            checked={checked}
            disabled={disabled}
            aria-invalid={hasErrors}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.checked)}
            className={cn(
              "peer size-full cursor-pointer appearance-none rounded-sm bg-white outline-1 transition-colors",
              boxClassName,
              hasErrors && "outline-error checked:bg-error outline-2",
            )}
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
        <span className="inline-flex flex-wrap items-baseline gap-x-1">
          <label
            htmlFor={field.name}
            className={cn(
              "cursor-pointer select-none",
              disabled && "cursor-not-allowed",
            )}
          >
            {label}
          </label>
          {trailing}
        </span>
      </div>
    </FieldShell>
  );
}
