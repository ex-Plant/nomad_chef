"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/helpers/cn";

// Mirrors FormCheckbox's markup/classes, but driven by c15t consent state
// instead of a TanStack form field — the preferences dialog has no form.
type ConsentCheckboxPropsT = {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
};

export function ConsentCheckbox({
  id,
  checked,
  disabled,
  onCheckedChange,
  label,
}: ConsentCheckboxPropsT) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 font-sans text-sm text-white",
        disabled && "opacity-60",
      )}
    >
      <span className="relative mt-0.5 inline-flex size-4 shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={cn(
            "peer outline-yellow checked:bg-yellow size-full cursor-pointer appearance-none rounded-sm bg-white outline-1 transition-colors",
            disabled && "cursor-not-allowed",
          )}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3.5}
          className="text-off-black pointer-events-none absolute inset-0 m-auto size-3 opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <label
        htmlFor={id}
        className={cn(
          "cursor-pointer select-none",
          disabled && "cursor-not-allowed",
        )}
      >
        {label}
      </label>
    </div>
  );
}
