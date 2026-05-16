import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { FormLabel } from "./form-label";
import { inputClasses, invalidClasses } from "./form-text-input";
import { cn } from "@/helpers/cn";

type FormNumberInputPropsT = {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

export function FormNumberInput({
  field,
  label,
  placeholder,
  ariaLabel,
  className,
  disabled,
  required,
  min,
  max,
  step,
}: FormNumberInputPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      {label && (
        <FormLabel htmlFor={field.name} required={required}>
          {label}
        </FormLabel>
      )}
      <input
        type="number"
        inputMode="numeric"
        name={field.name}
        id={field.name}
        value={(field.state.value as string | number) ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        aria-invalid={hasErrors}
        aria-required={required}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(inputClasses, hasErrors && invalidClasses, className)}
      />
    </FieldShell>
  );
}
