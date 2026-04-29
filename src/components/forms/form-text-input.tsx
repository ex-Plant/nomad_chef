import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { cn } from "@/helpers/cn";

const inputClasses =
  "w-full rounded-md border border-coral bg-white px-4 py-1.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:outline-none focus:ring-2 focus:ring-coral disabled:opacity-60";
const invalidClasses = "border-error focus:ring-error";

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
      ? Number.isFinite(field.state.value) ? String(field.state.value) : ""
      : (field.state.value as string) ?? "";
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
            field.handleChange(parsed === "" || Number.isNaN(parsed) ? 0 : parsed);
            return;
          }
          field.handleChange(e.target.value);
        }}
        className={cn(inputClasses, hasErrors && invalidClasses, className)}
      />
    </FieldShell>
  );
}
