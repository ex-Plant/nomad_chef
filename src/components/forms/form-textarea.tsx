import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { cn } from "@/helpers/cn";

const textareaClasses =
  "w-full rounded-md border border-coral bg-white px-4 py-1.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:outline-none focus:ring-2 focus:ring-coral disabled:opacity-60 min-h-24 resize-none field-sizing-content";

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
      {label && (
        <label
          htmlFor={field.name}
          className="mb-1 block font-sans text-xs font-medium text-off-black"
        >
          {label}
        </label>
      )}
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
        className={cn(textareaClasses, className)}
      />
    </FieldShell>
  );
}
