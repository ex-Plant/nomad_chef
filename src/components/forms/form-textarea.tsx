import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { FormLabel } from "./form-label";
import { cn } from "@/helpers/cn";
import { inputClasses, invalidClasses } from "./form-text-input";

type FormTextareaPropsT = {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  rows?: number;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
};

export function FormTextarea({
  field,
  label,
  placeholder,
  rows = 4,
  ariaLabel,
  className,
  disabled,
  required,
}: FormTextareaPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      {label && (
        <FormLabel htmlFor={field.name} required={required}>
          {label}
        </FormLabel>
      )}
      <textarea
        name={field.name}
        id={field.name}
        rows={rows}
        value={(field.state.value as string) ?? ""}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={hasErrors}
        aria-required={required}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(
          "min-h-24 resize-none ",
          inputClasses,
          hasErrors && invalidClasses,
          className
        )}
      />
    </FieldShell>
  );
}
