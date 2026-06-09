import type { ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/helpers/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldShell } from "./field-shell";

type FormCheckboxPropsT = {
  field: AnyFieldApi;
  label: ReactNode;
  /**
   * Full accessible name for the input. Use when the visible label is split —
   * e.g. the consent text continues into `trailing` links rendered outside the
   * <label> — so a screen reader announces the complete purpose, not just the
   * leading `label` word.
   */
  ariaLabel?: string;
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
  ariaLabel,
  trailing,
  className,
  disabled,
  boxClassName = "outline-yellow checked:bg-yellow",
  iconClassName = "text-off-black",
}: FormCheckboxPropsT) {
  const checked = Boolean(field.state.value);
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      <div
        className={cn(
          "flex items-start gap-3 font-sans text-sm text-white",
          disabled && "opacity-60",
          className,
        )}
      >
        <Checkbox
          id={field.name}
          name={field.name}
          checked={checked}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={hasErrors}
          aria-describedby={hasErrors ? errorId : undefined}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          boxClassName={cn(
            boxClassName,
            hasErrors && "outline-error checked:bg-error outline-2",
          )}
          iconClassName={iconClassName}
        />
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
