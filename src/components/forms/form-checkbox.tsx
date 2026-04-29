import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/helpers/cn";

type FormCheckboxPropsT = {
  field: AnyFieldApi;
  label: string;
  className?: string;
  disabled?: boolean;
};

export function FormCheckbox({
  field,
  label,
  className,
  disabled,
}: FormCheckboxPropsT) {
  const checked = Boolean(field.state.value);
  return (
    <label
      htmlFor={field.name}
      className={cn(
        "flex cursor-pointer items-start gap-3 select-none font-sans text-sm text-off-black",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      <input
        type="checkbox"
        id={field.name}
        name={field.name}
        checked={checked}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-coral"
      />
      <span>{label}</span>
    </label>
  );
}
