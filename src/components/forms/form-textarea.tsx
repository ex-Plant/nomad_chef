import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { FormLabel } from "./form-label";
import { cn } from "@/helpers/cn";

const textareaClasses =
  "w-full rounded-md ring-[3px] ring-yellow bg-white px-4 py-1.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:outline-none focus:ring-yellow disabled:opacity-60 min-h-24 resize-none field-sizing-content";
const invalidClasses = "ring-error focus:ring-error";

type FormTextareaPropsT = {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  rows?: number;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormTextarea({
  field,
  label,
  placeholder,
  rows = 4,
  ariaLabel,
  className,
  disabled,
}: FormTextareaPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      {label && <FormLabel htmlFor={field.name}>{label}</FormLabel>}
      <textarea
        name={field.name}
        id={field.name}
        rows={rows}
        value={(field.state.value as string) ?? ""}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(textareaClasses, hasErrors && invalidClasses, className)}
      />
    </FieldShell>
  );
}
