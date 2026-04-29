import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { FieldShell } from "./field-shell";
import { cn } from "@/helpers/cn";

const selectClasses =
  "w-full rounded-md border border-coral bg-white px-4 py-1.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand focus:outline-none focus:ring-2 focus:ring-coral disabled:opacity-60";

type FormSelectPropsT = {
  field: AnyFieldApi;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormSelect({
  field,
  children,
  ariaLabel,
  className,
  disabled,
}: FormSelectPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      <select
        name={field.name}
        id={field.name}
        value={(field.state.value as string) ?? ""}
        aria-label={ariaLabel}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(selectClasses, className)}
      >
        {children}
      </select>
    </FieldShell>
  );
}
