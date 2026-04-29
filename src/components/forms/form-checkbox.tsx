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
        "flex cursor-pointer items-start gap-3 select-none font-sans text-sm text-white",
        disabled && "opacity-60 cursor-not-allowed",
        className
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
        className={cn(
          "mt-0.5 size-4 cursor-pointer appearance-none rounded-sm bg-white outline outline-2 outline-yellow transition-colors",
          "checked:bg-yellow",
          "checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22><path%20fill=%22%23211509%22%20d=%22M6.5%2012L2.5%208l1.4-1.4L6.5%209.2%2012.1%203.6%2013.5%205z%22/></svg>')]",
          "checked:bg-no-repeat checked:bg-center",
        )}
      />
      <span>{label}</span>
    </label>
  );
}
