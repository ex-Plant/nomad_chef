import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { FormLabel } from "./form-label";
import { cn } from "@/helpers/cn";

const inputClasses =
  "w-full rounded-md ring-[1px] ring-electric-blue bg-white px-4 py-1.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:outline-none focus:ring-electric-blue disabled:opacity-60";
const invalidClasses = "ring-error focus:ring-error";

type FormTextInputPropsT = {
  field: AnyFieldApi;
  label?: string;
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormTextInput({
  field,
  label,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  ariaLabel,
  className,
  disabled,
}: FormTextInputPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  const value =
    type === "number"
      ? Number.isFinite(field.state.value)
        ? String(field.state.value)
        : ""
      : ((field.state.value as string) ?? "");
  return (
    <FieldShell field={field}>
      {label && <FormLabel htmlFor={field.name}>{label}</FormLabel>}
      <input
        type={type}
        name={field.name}
        id={field.name}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => {
          if (type === "number") {
            const raw = e.target.value;
            const parsed = raw === "" ? "" : Number(raw);
            field.handleChange(
              parsed === "" || Number.isNaN(parsed) ? 0 : parsed
            );
            return;
          }
          field.handleChange(e.target.value);
        }}
        className={cn(inputClasses, hasErrors && invalidClasses, className)}
      />
    </FieldShell>
  );
}
